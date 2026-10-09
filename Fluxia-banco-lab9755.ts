/**
 * Fluxia-banco · Edge Function (Supabase / Deno)
 * Compatible con cliente Fluxia v92.x / v93.x / v94.x
 *
 * Versión: v94.88 (alineada con cliente LAB cloud-first)
 * Base: v92.10 ESTABLE + v94.26 QUIRÚRGICO + v94.30 PSU
 *
 * v94.12: cliente envía blacklist ampliada; servidor sigue filtrando por id
 * v94.7.4: chequeo de blacklist de movimientos borrados por usuario
 * v94.9: CaixaBank — al consultar estado se refresca la sesión EB antes de
 *   marcar caducado; si la sesión sigue viva se recuperan cuentas; mensajes
 *   claros de sesión muerta vs HUB046; ping reporta versión.
 * v94.30: cabeceras Psu-Ip-Address/Psu-User-Agent en acciones manuales (presente:true).
 * v94.26: HUB046 no gasta cuota (skip movs + no refresh); limpia HUB046 al
 *   cambiar de día (Europe/Madrid); conectado=true si permiso vivo aunque
 *   limite_diario; campos operativo/limite_hasta_manana.
 * v94.88: ping version alineada; recomendación de UNIQUE(user_id,banco);
 *   blacklist llega ya filtrada desde cliente cloud-first (Almacen).
 *
 * Secrets necesarios en Supabase → Edge Functions → Secrets:
 *   EB_APP_ID        → Application ID de Enable Banking (kid del JWT)
 *   EB_APP_SECRET    → Clave privada RSA PEM
 *   EB_REDIRECT_URL  → URL de retorno
 *   SUPABASE_URL     → (automático en Edge)
 *   SUPABASE_SERVICE_ROLE_KEY → (recomendado)
 *
 * Tabla SQL (ejecutar UNA vez en SQL Editor si no existe):
 *
 *   create table if not exists public.fluxia_banco_sesiones (
 *     id uuid primary key default gen_random_uuid(),
 *     user_id uuid not null,
 *     banco text not null,
 *     session_id text not null,
 *     account_uids jsonb not null default '[]',
 *     cuentas jsonb not null default '[]',
 *     valido_hasta timestamptz,
 *     lee_desde date,
 *     ultima_sync_fondo timestamptz,
 *     ultimo_error text,
 *     state text,
 *     created_at timestamptz default now(),
 *     updated_at timestamptz default now()
 *   );
 *   create index if not exists fluxia_banco_sesiones_user on public.fluxia_banco_sesiones(user_id);
 *   -- v94.88 · recomendado para upsert limpio (no destructivo si ya existe):
 *   create unique index if not exists fluxia_banco_sesiones_user_banco
 *     on public.fluxia_banco_sesiones(user_id, banco);
 *
 * RLS (recomendado):
 *   alter table public.fluxia_banco_sesiones enable row level security;
 *   create policy "own rows" on public.fluxia_banco_sesiones
 *     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
 *   -- Si usas service_role en la Edge Function, RLS se bypasea (correcto).
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const EB_API = "https://api.enablebanking.com";
const VERSION = "fluxia-banco-lab-v97.55";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function err(msg: string, status = 400) {
  return json({ error: msg, success: false }, status);
}

// ── JWT RS256 para Enable Banking ──────────────────────────────────────────

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const raw = atob(b64);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf.buffer;
}

function b64url(data: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array;
  if (typeof data === "string") {
    bytes = new TextEncoder().encode(data);
  } else if (data instanceof ArrayBuffer) {
    bytes = new Uint8Array(data);
  } else {
    bytes = data;
  }
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function ebJwt(): Promise<string> {
  const appId = Deno.env.get("EB_APP_ID") || "";
  let secret = Deno.env.get("EB_APP_SECRET") || "";
  if (!appId || !secret) {
    throw new Error("Faltan secrets EB_APP_ID o EB_APP_SECRET");
  }
  secret = secret.replace(/\\n/g, "\n").trim();
  if (!secret.includes("BEGIN")) {
    secret =
      "-----BEGIN PRIVATE KEY-----\n" +
      secret +
      "\n-----END PRIVATE KEY-----";
  }
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(secret),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const header = { typ: "JWT", alg: "RS256", kid: appId };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: "enablebanking.com",
    aud: "api.enablebanking.com",
    iat: now,
    exp: now + 3600,
  };
  const h = b64url(JSON.stringify(header));
  const p = b64url(JSON.stringify(payload));
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(h + "." + p),
  );
  return h + "." + p + "." + b64url(sig);
}

async function ebFetch(
  path: string,
  opts: { method?: string; body?: unknown; psu?: { ip: string; ua: string } | null } = {},
) {
  const token = await ebJwt();
  const headers: Record<string, string> = {
    Authorization: "Bearer " + token,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (opts.psu && opts.psu.ip && opts.psu.ua) {
    headers["Psu-Ip-Address"] = opts.psu.ip;
    headers["Psu-User-Agent"] = opts.psu.ua;
  }
  const res = await fetch(EB_API + path, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    if (opts.psu && /PSU_HEADER/i.test(text)) {
      return ebFetch(path, { ...opts, psu: null });
    }
    const msg =
      data?.message ||
      data?.error ||
      data?.detail ||
      `Enable Banking HTTP ${res.status}`;
    throw new Error(String(msg));
  }
  return data;
}

// ── Supabase admin + usuario del JWT ───────────────────────────────────────

function sbAdmin() {
  const url = Deno.env.get("SUPABASE_URL") || "";
  const key =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    Deno.env.get("SUPABASE_ANON_KEY") ||
    "";
  if (!url || !key) throw new Error("Falta SUPABASE_URL o SERVICE_ROLE_KEY");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function userFromReq(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) throw new Error("Inicia sesión en Ajustes → ☁️ Nube");
  const sb = sbAdmin();
  const { data, error } = await sb.auth.getUser(m[1]);
  if (error || !data?.user) {
    throw new Error("Sesión inválida o caducada. Vuelve a entrar en Nube.");
  }
  return { sb, user: data.user, token: m[1] };
}

// ── Helpers de dominio ─────────────────────────────────────────────────────

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function plusDays(n: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString();
}

function mapCuentas(accounts: any[]) {
  return (accounts || []).map((a: any) => ({
    uid: a.uid || a.account_id || a.accountId || a.id || "",
    nombre:
      a.name ||
      a.product ||
      a.cash_account_type ||
      a.currency ||
      "Cuenta",
    iban:
      (a.account_id && a.account_id.iban) ||
      a.iban ||
      (Array.isArray(a.identification_hashes)
        ? ""
        : "") ||
      "",
    moneda: a.currency || "EUR",
  }));
}

function mapMov(t: any, banco: string) {
  const booking =
    t.booking_date ||
    t.bookingDate ||
    t.value_date ||
    t.valueDate ||
    t.transaction_date ||
    "";
  const fecha = String(booking).slice(0, 10);
  const amount = t.transaction_amount || t.transactionAmount || t.amount || {};
  let importe = Number(String(amount.amount ?? amount.value ?? t.amount ?? 0).replace(",", "."));
  if (!isFinite(importe)) importe = 0;
  const ccy = amount.currency || "EUR";
  const ind = String(
    t.credit_debit_indicator || t.creditDebitIndicator || "",
  ).toUpperCase();
  if (ind === "DBIT" || ind === "DEBIT") importe = -Math.abs(importe);
  if (ind === "CRDT" || ind === "CREDIT") importe = Math.abs(importe);

  const concepto =
    t.remittance_information?.[0] ||
    t.remittanceInformationUnstructured ||
    t.reference ||
    t.additional_information ||
    t.description ||
    "Movimiento";
  const contraparte =
    t.creditor?.name ||
    t.debtor?.name ||
    t.creditor_name ||
    t.debtor_name ||
    t.counterpart_name ||
    "";
  const id =
    t.entry_reference ||
    t.transaction_id ||
    t.transactionId ||
    t.id ||
    `${banco}|${fecha}|${importe}|${String(concepto).slice(0, 40)}`;
  const pendiente = !!(
    t.status &&
    String(t.status).toUpperCase() !== "BOOK" &&
    String(t.status).toUpperCase() !== "BOOKED"
  );
  return {
    id: String(id),
    fecha,
    importe,
    concepto: String(concepto).slice(0, 120),
    contraparte: String(contraparte).slice(0, 80),
    banco,
    moneda: ccy,
    pendiente,
  };
}

async function listSesiones(sb: any, userId: string) {
  const { data, error } = await sb
    .from("fluxia_banco_sesiones")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) {
    if (/relation|does not exist|schema cache/i.test(error.message || "")) {
      throw new Error(
        "Falta la tabla fluxia_banco_sesiones. Ejecuta el SQL del comentario del index.ts en el SQL Editor de Supabase.",
      );
    }
    throw new Error(error.message);
  }
  return data || [];
}

function conexionFromRow(row: any) {
  const vto = row.valido_hasta ? new Date(row.valido_hasta) : null;
  const caducado = vto ? vto.getTime() < Date.now() : false;
  return {
    id: row.id,
    banco: row.banco,
    valido_hasta: row.valido_hasta || null,
    cuentas: row.cuentas || [],
    ultima_sync_fondo: row.ultima_sync_fondo || null,
    ultimo_error: row.ultimo_error || null,
    caducado,
    lee_desde: row.lee_desde || null,
    session_id: row.session_id,
  };
}

// ── Acciones ───────────────────────────────────────────────────────────────

async function accionBancos() {
  const data = await ebFetch("/aspsps?country=ES");
  const list = Array.isArray(data) ? data : data.aspsps || data.data || [];
  const bancos = list.map((b: any) => ({
    nombre: b.name || b.aspsp_name || b.id,
    pais: b.country || "ES",
    logo: b.logo || null,
  }));
  return {
    success: true,
    bancos,
    aspsps: list.map((b: any) => ({
      id: b.name || b.id,
      name: b.name,
      country: b.country || "ES",
      logo: b.logo,
    })),
  };
}

async function accionIniciar(body: any, userId: string, sb: any) {
  const banco = String(body.banco || body.name || body.aspsp || "").trim();
  if (!banco) throw new Error("Indica el banco");
  const redirect =
    Deno.env.get("EB_REDIRECT_URL") ||
    body.redirect_url ||
    "";
  if (!redirect) {
    throw new Error(
      "Falta EB_REDIRECT_URL en Secrets de la Edge Function",
    );
  }

  const state = b64url(
    JSON.stringify({
      u: userId,
      b: banco,
      t: Date.now(),
      n: crypto.randomUUID(),
    }),
  );

  // v94.88 · Preferir select+update/insert (funciona con o sin UNIQUE constraint)
  try {
    const { data: existing } = await sb
      .from("fluxia_banco_sesiones")
      .select("id")
      .eq("user_id", userId)
      .eq("banco", banco)
      .maybeSingle();
    if (existing?.id) {
      await sb
        .from("fluxia_banco_sesiones")
        .update({
          state,
          session_id: "pending:" + state.slice(0, 32),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await sb.from("fluxia_banco_sesiones").insert({
        user_id: userId,
        banco,
        session_id: "pending:" + state.slice(0, 32),
        state,
        cuentas: [],
        account_uids: [],
      });
    }
  } catch (_) {
    /* ignore — no bloquear el flujo de autorización */
  }

  const authBody = {
    access: {
      valid_until: plusDays(90),
      balances: true,
      transactions: true,
    },
    aspsp: { name: banco, country: "ES" },
    state,
    redirect_url: redirect,
    psu_type: "personal",
  };
  const auth = await ebFetch("/auth", { method: "POST", body: authBody });
  const url = auth.url || auth.authorization_url;
  if (!url) throw new Error("Enable Banking no devolvió URL de autorización");
  return {
    success: true,
    url,
    authorization_id: auth.authorization_id || null,
    banco,
  };
}

async function accionConfirmar(body: any, userId: string, sb: any) {
  const code = body.code;
  if (!code) throw new Error("Falta code del banco");

  const session = await ebFetch("/sessions", {
    method: "POST",
    body: { code },
  });
  const sessionId = session.session_id || session.sessionId;
  if (!sessionId) throw new Error("No se pudo crear la sesión bancaria");

  const accounts = session.accounts || [];
  const aspspName =
    session.aspsp?.name ||
    body.banco ||
    "Banco";
  const cuentas = mapCuentas(accounts);
  const uids = cuentas.map((c: any) => c.uid).filter(Boolean);
  const validUntil =
    session.access?.valid_until ||
    session.access?.validUntil ||
    plusDays(90);

  const { data: rows } = await sb
    .from("fluxia_banco_sesiones")
    .select("*")
    .eq("user_id", userId)
    .eq("banco", aspspName);

  if (rows && rows.length) {
    await sb
      .from("fluxia_banco_sesiones")
      .update({
        session_id: sessionId,
        cuentas,
        account_uids: uids,
        valido_hasta: validUntil,
        lee_desde: hoyISO(),
        ultimo_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", rows[0].id);
  } else {
    await sb.from("fluxia_banco_sesiones").insert({
      user_id: userId,
      banco: aspspName,
      session_id: sessionId,
      cuentas,
      account_uids: uids,
      valido_hasta: validUntil,
      lee_desde: hoyISO(),
    });
  }

  const all = await listSesiones(sb, userId);
  const conexiones = all
    .filter((r: any) => !String(r.session_id).startsWith("pending:"))
    .map(conexionFromRow);

  return {
    success: true,
    banco: aspspName,
    session_id: sessionId,
    conexiones,
    sin_cuentas: cuentas.length === 0,
  };
}

/** v94.26 · helpers HUB046 */
function esMsgHub046(s: string): boolean {
  return /HUB046|limitado las consultas|Allowed number of accesses|límite de consultas/i.test(String(s || ""));
}

function hoyMadrid(): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Madrid",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function hub046SigueActivo(ultimoError: string, updatedAt?: string | null): boolean {
  if (!esMsgHub046(ultimoError)) return false;
  if (!updatedAt) return true;
  try {
    const d = new Date(updatedAt);
    const diaErr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Madrid",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
    return diaErr === hoyMadrid();
  } catch {
    return true;
  }
}

async function accionEstado(_body: any, userId: string, sb: any) {
  const all = await listSesiones(sb, userId);
  const conexiones: any[] = [];
  for (const r0 of all) {
    if (String(r0.session_id).startsWith("pending:")) continue;
    let r = r0;
    const sinCuentas =
      !(Array.isArray(r.cuentas) && r.cuentas.length) &&
      !(Array.isArray(r.account_uids) && r.account_uids.length);
    const vto = r.valido_hasta ? new Date(r.valido_hasta) : null;
    const porFecha = vto ? vto.getTime() < Date.now() : false;
    const errPrev = String(r.ultimo_error || "");
    let esHub046 = hub046SigueActivo(errPrev, r.updated_at);
    if (esMsgHub046(errPrev) && !esHub046) {
      try {
        await sb
          .from("fluxia_banco_sesiones")
          .update({ ultimo_error: null, updated_at: new Date().toISOString() })
          .eq("id", r.id);
        r.ultimo_error = null;
      } catch (_) { /* ignore */ }
    }
    if (!esHub046 && (sinCuentas || porFecha)) {
      try {
        const refreshed = await refreshCuentasDesdeSesion(r, sb);
        if (refreshed && (refreshed.cuentas?.length || refreshed.account_uids?.length)) {
          r = refreshed;
          if (r.ultimo_error && /sin cuentas|session|caduc/i.test(String(r.ultimo_error))) {
            try {
              await sb
                .from("fluxia_banco_sesiones")
                .update({ ultimo_error: null, updated_at: new Date().toISOString() })
                .eq("id", r.id);
              r.ultimo_error = null;
            } catch (_) { /* ignore */ }
          }
        }
      } catch (e: any) {
        const msg = String(e?.message || e || "");
        if (esMsgHub046(msg)) {
          try {
            await sb
              .from("fluxia_banco_sesiones")
              .update({
                ultimo_error: "HUB046: límite de consultas de hoy. Los datos ya cargados siguen. Prueba mañana.",
                updated_at: new Date().toISOString(),
              })
              .eq("id", r.id);
            r.ultimo_error = "HUB046: límite de consultas de hoy. Los datos ya cargados siguen. Prueba mañana.";
          } catch (_) { /* ignore */ }
        } else if (/session|not found|expired|invalid|unauthorized|401|403/i.test(msg)) {
          try {
            await sb
              .from("fluxia_banco_sesiones")
              .update({
                ultimo_error: "Sesión bancaria caducada. Pulsa Reconectar (1 min).",
                updated_at: new Date().toISOString(),
              })
              .eq("id", r.id);
            r.ultimo_error = "Sesión bancaria caducada. Pulsa Reconectar (1 min).";
          } catch (_) { /* ignore */ }
        }
      }
    }
    const conn = conexionFromRow(r);
    const errNow = String(conn.ultimo_error || r.ultimo_error || "");
    const hubNow = hub046SigueActivo(errNow, r.updated_at);
    if (hubNow) {
      conn.caducado = false;
      conn.ultimo_error = "HUB046: límite de consultas de hoy. Los datos ya cargados siguen. Prueba mañana.";
      conn.limite_diario = true;
      conn.operativo = false;
      conn.limite_hasta_manana = true;
    } else {
      conn.limite_diario = false;
      conn.limite_hasta_manana = false;
      const sigueSin =
        !(conn.cuentas && conn.cuentas.length) &&
        !(Array.isArray(r.account_uids) && r.account_uids.length);
      if (porFecha) {
        conn.caducado = true;
        conn.operativo = false;
      } else if (sigueSin && /sesión|caduc|expired|Reconectar \(1 min\)/i.test(errNow)) {
        conn.caducado = true;
        conn.operativo = false;
      } else if (conn.cuentas && conn.cuentas.length) {
        conn.caducado = false;
        conn.operativo = true;
      } else {
        conn.operativo = !sigueSin;
      }
      if (sigueSin && !porFecha && !/sesión|caduc|expired/i.test(errNow)) {
        conn.caducado = false;
        conn.operativo = false;
        if (!conn.ultimo_error) {
          conn.ultimo_error = "Sin cuentas en este momento. No hace falta reconectar si el permiso sigue válido.";
        }
      }
    }
    conn.permiso_valido = !conn.caducado && !porFecha;
    conexiones.push(conn);
  }
  const algunaPermiso = conexiones.some((c) => c.permiso_valido);
  const algunaOperativa = conexiones.some((c) => c.operativo && (c.cuentas || []).length > 0);
  return {
    success: true,
    conectado: algunaPermiso || algunaOperativa,
    conexiones,
    nBancos: conexiones.length,
    operativos: conexiones.filter((c) => c.operativo).length,
    version: VERSION,
  };
}

async function refreshCuentasDesdeSesion(row: any, sb: any) {
  const sid = row.session_id;
  if (!sid || String(sid).startsWith("pending:")) return row;
  try {
    const data = await ebFetch(`/sessions/${encodeURIComponent(sid)}`);
    let accounts: any[] = [];
    if (Array.isArray(data.accounts_data) && data.accounts_data.length) {
      accounts = data.accounts_data;
    } else if (Array.isArray(data.accounts) && data.accounts.length) {
      if (typeof data.accounts[0] === "string") {
        accounts = data.accounts.map((uid: string) => ({ uid }));
      } else {
        accounts = data.accounts;
      }
    }
    if (!accounts.length) return row;
    const cuentas = mapCuentas(accounts);
    const uids = cuentas.map((x: any) => x.uid).filter(Boolean);
    if (!uids.length) return row;
    await sb
      .from("fluxia_banco_sesiones")
      .update({
        cuentas,
        account_uids: uids,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    return { ...row, cuentas, account_uids: uids };
  } catch (_) {
    return row;
  }
}

function friendlyEbError(msg: string) {
  const s = String(msg || "");
  if (/HUB046|Allowed number of accesses exceeded/i.test(s)) {
    return "HUB046: límite de consultas de hoy. Los movimientos ya cargados siguen disponibles. Prueba mañana (no hace falta reconectar).";
  }
  if (/session.*(not found|expired|invalid)|invalid session|unauthorized|401/i.test(s)) {
    return "Sesión bancaria caducada o cerrada por el banco. Pulsa Reconectar (no pierdes movimientos ya apuntados).";
  }
  return s;
}

async function fetchMovsSesion(
  row: any,
  desde: string,
  sb?: any,
  psu?: { ip: string; ua: string } | null,
): Promise<{ movs: any[]; error?: string }> {
  let work = row;
  if (!psu && hub046SigueActivo(String(work.ultimo_error || ""), work.updated_at)) {
    return {
      movs: [],
      error: "HUB046: límite de consultas de hoy. Los movimientos ya cargados siguen disponibles. Prueba mañana (no hace falta reconectar).",
    };
  }
  let uids: string[] = Array.isArray(work.account_uids) ? [...work.account_uids] : [];
  if (!uids.length && Array.isArray(work.cuentas)) {
    for (const c of work.cuentas) if (c && c.uid) uids.push(c.uid);
  }
  if (!uids.length && sb) {
    work = await refreshCuentasDesdeSesion(work, sb);
    uids = Array.isArray(work.account_uids) ? [...work.account_uids] : [];
    if (!uids.length && Array.isArray(work.cuentas)) {
      for (const c of work.cuentas) if (c && c.uid) uids.push(c.uid);
    }
  }
  if (!uids.length) {
    return { movs: [], error: "sin cuentas (vincula en Enable Banking → Link accounts)" };
  }

  const movs: any[] = [];
  let lastErr = "";
  for (const uid of uids) {
    try {
      let continuation: string | null = null;
      let pages = 0;
      do {
        const q = new URLSearchParams({
          date_from: desde,
          date_to: hoyISO(),
        });
        if (continuation) q.set("continuation_key", continuation);
        const data = await ebFetch(
          `/accounts/${encodeURIComponent(uid)}/transactions?` + q.toString(),
          { psu },
        );
        const list =
          data.transactions ||
          data.booked ||
          data.data ||
          (Array.isArray(data) ? data : []);
        for (const t of list) {
          const m = mapMov(t, work.banco);
          if (m.fecha && isFinite(m.importe) && m.importe !== 0) movs.push(m);
        }
        continuation = data.continuation_key || data.continuationKey || null;
        pages++;
      } while (continuation && pages < 8);
    } catch (e: any) {
      lastErr = friendlyEbError(e?.message || String(e));
    }
  }
  return { movs, error: lastErr || undefined };
}

async function accionMovimientos(body: any, userId: string, sb: any) {
  const desde = String(body.desde || hoyISO()).slice(0, 10);
  const all = await listSesiones(sb, userId);
  const activas = all.filter(
    (r: any) => !String(r.session_id).startsWith("pending:"),
  );
  let movimientos: any[] = [];
  const errores: string[] = [];
  const cortes: Record<string, string> = {};
  const porBanco: Record<string, number> = {};

  const fetched: Awaited<ReturnType<typeof fetchMovsSesion>>[] = new Array(activas.length);
  let cursor = 0;
  async function worker() {
    while (cursor < activas.length) {
      const index = cursor++;
      fetched[index] = await fetchMovsSesion(activas[index], desde, sb, body.__psu || null);
    }
  }
  await Promise.all(Array.from({length: Math.min(2, activas.length)}, () => worker()));
  for (let index = 0; index < activas.length; index++) {
    const row = activas[index];
    const { movs, error } = fetched[index];
    movimientos.push(...movs);
    porBanco[row.banco] = (porBanco[row.banco] || 0) + movs.length;
    if (error) errores.push(row.banco + ": " + error);
    if (row.lee_desde) cortes[row.banco] = row.lee_desde;
    const patch: any = { updated_at: new Date().toISOString() };
    if (error && esMsgHub046(error)) {
      patch.ultimo_error = error;
    } else if (error) {
      patch.ultimo_error = error;
      if (movs.length) patch.ultima_sync_fondo = new Date().toISOString();
    } else {
      patch.ultimo_error = null;
      patch.ultima_sync_fondo = new Date().toISOString();
    }
    await sb.from("fluxia_banco_sesiones").update(patch).eq("id", row.id);
  }

  // Blacklist del cliente (ahora sincronizada vía Almacen/Supabase en v94.88)
  const blacklist = new Set((body.blacklist || []).filter(Boolean));
  if (blacklist.size > 0) {
    const antes = movimientos.length;
    movimientos = movimientos.filter(m => !blacklist.has(m.id));
    const filtrados = antes - movimientos.length;
    if (filtrados > 0) {
      console.log(`[v94.88] Filtrados ${filtrados} movimientos borrados (blacklist nube)`);
    }
  }

  const avisos = errores.length ? errores.join(" · ") : null;
  return {
    success: true,
    movimientos,
    cortes,
    por_banco: porBanco,
    avisos,
    errorFondo: avisos,
    ...(movimientos.length === 0 && errores.length === activas.length && activas.length
      ? { error: avisos }
      : {}),
  };
}

async function accionBandeja(body: any, userId: string, sb: any) {
  const d = new Date();
  d.setDate(d.getDate() - 40);
  return accionMovimientos(
    { ...body, desde: d.toISOString().slice(0, 10) },
    userId,
    sb,
  );
}

const PREF_SALDO = ["CLBD", "ITBD", "ITAV", "CLAV", "XPCD"];

function elegirSaldo(balances: any[]) {
  const tipo = (b: any) =>
    String(b.balance_type || b.type || "").toUpperCase();
  for (const t of PREF_SALDO) {
    const hit = balances.find((b: any) => tipo(b) === t);
    if (hit) return hit;
  }
  return balances[0];
}

async function accionSaldos(_body: any, userId: string, sb: any) {
  const all = await listSesiones(sb, userId);
  const saldos: any[] = [];
  const errores: string[] = [];
  const total: Record<string, number> = {};

  for (const row0 of all) {
    if (String(row0.session_id).startsWith("pending:")) continue;
    let row = row0;
    if (!_body.__psu && hub046SigueActivo(String(row.ultimo_error || ""), row.updated_at)) {
      errores.push(row.banco + ": límite diario (HUB046) — saldo no actualizado hoy");
      continue;
    }
    let uids: string[] = Array.isArray(row.account_uids) ? [...row.account_uids] : [];
    if (!uids.length) {
      row = await refreshCuentasDesdeSesion(row, sb);
      uids = Array.isArray(row.account_uids) ? [...row.account_uids] : [];
    }
    for (const uid of uids) {
      try {
        const data = await ebFetch(
          `/accounts/${encodeURIComponent(uid)}/balances`,
          { psu: _body.__psu || null },
        );
        const raw = data.balances || data || [];
        const balances = (Array.isArray(raw) ? raw : [raw]).filter(Boolean);
        if (!balances.length) continue;
        const b = elegirSaldo(balances);
        const amt = b.balance_amount || b.balanceAmount || b.amount || {};
        let importe = Number(String(amt.amount ?? 0).replace(",", "."));
        if (!isFinite(importe)) continue;
        const ind = String(b.credit_debit_indicator || "").toUpperCase();
        if (ind === "DBIT" || ind === "DEBIT") importe = -Math.abs(importe);
        const moneda = amt.currency || "EUR";
        const cuenta = (row.cuentas || []).find((x: any) => x.uid === uid);
        saldos.push({
          banco: row.banco,
          cuenta: uid,
          nombre: cuenta?.nombre || "",
          iban: cuenta?.iban || "",
          tipo: b.balance_type || b.type || "expected",
          saldo: importe,
          importe,
          moneda,
        });
        total[moneda] = Math.round(((total[moneda] || 0) + importe) * 100) / 100;
      } catch (e: any) {
        errores.push(row.banco + ": " + friendlyEbError(e?.message || String(e)));
      }
    }
  }

  return {
    success: true,
    saldos,
    total,
    avisos: errores,
    errorFondo: errores.length ? errores.join(" · ") : null,
    ...(saldos.length === 0 && errores.length ? { error: errores.join(" · ") } : {}),
  };
}

async function accionDesconectar(body: any, userId: string, sb: any) {
  if (body.todos) {
    await sb.from("fluxia_banco_sesiones").delete().eq("user_id", userId);
    return { success: true };
  }
  if (body.connection_id) {
    await sb
      .from("fluxia_banco_sesiones")
      .delete()
      .eq("user_id", userId)
      .eq("id", body.connection_id);
    return { success: true };
  }
  if (body.banco) {
    await sb
      .from("fluxia_banco_sesiones")
      .delete()
      .eq("user_id", userId)
      .eq("banco", body.banco);
    return { success: true };
  }
  throw new Error("Indica connection_id, banco o todos:true");
}

async function accionAccesoListar() {
  return { success: true, emails: [] };
}
async function accionAccesoInvitar() {
  return { success: true, emails: [] };
}
async function accionAccesoQuitar() {
  return { success: true, emails: [] };
}

function psuDesdePeticion(req: Request, body: any): { ip: string; ua: string } | null {
  if (!body || body.presente !== true) return null;
  const xff = req.headers.get("x-forwarded-for") || "";
  const ip = (req.headers.get("cf-connecting-ip") || xff.split(",")[0] || "").trim();
  const ua = (req.headers.get("user-agent") || "").trim();
  return ip && ua ? { ip, ua } : null;
}

// ── Entry ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (req.method !== "POST") {
    return err("Solo POST", 405);
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return err("JSON inválido");
  }

  const accion = String(
    body.accion || body.action || body.op || "",
  ).toLowerCase();
  body.__psu = psuDesdePeticion(req, body);

  try {
    if (accion === "bancos" || accion === "listar_bancos" || accion === "") {
      try {
        return json(await accionBancos());
      } catch (e: any) {
        return err(e.message || String(e), 500);
      }
    }

    const { sb, user } = await userFromReq(req);
    const uid = user.id;

    switch (accion) {
      case "iniciar":
      case "start":
      case "auth":
      case "connect":
        return json(await accionIniciar(body, uid, sb));
      case "confirmar":
      case "callback":
      case "authorize":
        return json(await accionConfirmar(body, uid, sb));
      case "estado":
      case "status":
        return json(await accionEstado(body, uid, sb));
      case "movimientos":
      case "transactions":
        return json(await accionMovimientos(body, uid, sb));
      case "bandeja":
        return json(await accionBandeja(body, uid, sb));
      case "saldos":
      case "balances":
        return json(await accionSaldos(body, uid, sb));
      case "desconectar":
      case "disconnect":
        return json(await accionDesconectar(body, uid, sb));
      case "acceso_listar":
        return json(await accionAccesoListar());
      case "acceso_invitar":
        return json(await accionAccesoInvitar());
      case "acceso_quitar":
        return json(await accionAccesoQuitar());
      case "ping":
        return json({ success: true, pong: true, version: VERSION });
      default:
        return err("Acción desconocida: " + accion);
    }
  } catch (e: any) {
    console.error("Fluxia-banco error:", e);
    return err(e?.message || String(e), 500);
  }
});


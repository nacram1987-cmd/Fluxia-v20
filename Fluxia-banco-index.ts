/**
 * Fluxia-banco · Edge Function (Supabase / Deno)
 * Compatible con cliente Fluxia v92.x / v93.x
 * Versión: original v92.10 + UN solo arreglo en la acción "saldos"
 * (devuelve saldo, total y avisos en el formato que lee el cliente).
 *
 * Secrets necesarios en Supabase → Edge Functions → Secrets:
 *   EB_APP_ID        → Application ID de Enable Banking (kid del JWT)
 *   EB_APP_SECRET    → Clave privada RSA PEM (la que subiste a Enable Banking)
 *   EB_REDIRECT_URL  → URL de retorno (ej. https://nacram1987-cmd.github.io/...)
 *   SUPABASE_URL     → (automático en Edge)
 *   SUPABASE_SERVICE_ROLE_KEY → (o SUPABASE_ANON_KEY + políticas; mejor service role)
 *
 * Tabla SQL (ejecutar una vez en SQL Editor si no existe):
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
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const EB_API = "https://api.enablebanking.com";

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
  // Si viene con \n escapados
  secret = secret.replace(/\\n/g, "\n").trim();
  if (!secret.includes("BEGIN")) {
    // Puede venir solo el cuerpo base64
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
  opts: { method?: string; body?: unknown } = {},
) {
  const token = await ebJwt();
  const res = await fetch(EB_API + path, {
    method: opts.method || "GET",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
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
  // Enable Banking: credit positivo / debit negativo según credit_debit_indicator
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
    // Tabla inexistente → mensaje claro
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
  // Lista ASPSPs España
  const data = await ebFetch("/aspsps?country=ES");
  const list = Array.isArray(data) ? data : data.aspsps || data.data || [];
  const bancos = list.map((b: any) => ({
    nombre: b.name || b.aspsp_name || b.id,
    pais: b.country || "ES",
    logo: b.logo || null,
  }));
  // Formato dual: cliente v92.10 acepta bancos y aspsps
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

  // state = userId + banco (para recuperar al volver)
  const state = b64url(
    JSON.stringify({
      u: userId,
      b: banco,
      t: Date.now(),
      n: crypto.randomUUID(),
    }),
  );

  // Guardar state pendiente (sin session aún)
  await sb.from("fluxia_banco_sesiones").upsert(
    {
      user_id: userId,
      banco,
      session_id: "pending:" + state.slice(0, 32),
      state,
      cuentas: [],
      account_uids: [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,banco" },
  ).then(() => {}).catch(() => {
    // Si no hay constraint única, insertar
  });

  // Insert simple si upsert falla por falta de unique
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
    /* ignore */
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

  // Actualizar fila pending o crear
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
    // Buscar por state si vino
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

async function accionEstado(_body: any, userId: string, sb: any) {
  const all = await listSesiones(sb, userId);
  const conexiones = all
    .filter((r: any) => !String(r.session_id).startsWith("pending:"))
    .map((r: any) => {
      const conn = conexionFromRow(r);
      // v94.7.2: Detectar CaixaBank sin cuentas → sesión caducada
      // (Enable Banking cierra la sesión silenciosamente tras inactividad)
      if (
        String(r.banco || "").toLowerCase().includes("caixa") &&
        (!conn.cuentas || conn.cuentas.length === 0) &&
        !conn.caducado
      ) {
        conn.caducado = true;
      }
      return conn;
    });
  return {
    success: true,
    conectado: conexiones.length > 0,
    conexiones,
    nBancos: conexiones.length,
  };
}

async function refreshCuentasDesdeSesion(row: any, sb: any) {
  const sid = row.session_id;
  if (!sid || String(sid).startsWith("pending:")) return row;
  try {
    const data = await ebFetch(`/sessions/${encodeURIComponent(sid)}`);
    // accounts may be list of uids or full objects in accounts_data
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
    return "HUB046: el banco ha limitado las consultas de este consentimiento. Espera unas horas o reconecta una sola vez.";
  }
  return s;
}

async function fetchMovsSesion(
  row: any,
  desde: string,
  sb?: any,
): Promise<{ movs: any[]; error?: string }> {
  let work = row;
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
        );
        const list =
          data.transactions ||
          data.booked ||
          data.data ||
          (Array.isArray(data) ? data : []);
        for (const t of list) {
          const m = mapMov(t, work.banco);
          // aceptar importe 0 no; sí negativos y positivos
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
  const movimientos: any[] = [];
  const errores: string[] = [];
  const cortes: Record<string, string> = {};
  const porBanco: Record<string, number> = {};

  for (const row of activas) {
    const { movs, error } = await fetchMovsSesion(row, desde, sb);
    movimientos.push(...movs);
    porBanco[row.banco] = (porBanco[row.banco] || 0) + movs.length;
    if (error) errores.push(row.banco + ": " + error);
    if (row.lee_desde) cortes[row.banco] = row.lee_desde;
    await sb
      .from("fluxia_banco_sesiones")
      .update({
        ultima_sync_fondo: new Date().toISOString(),
        ultimo_error: error || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
  }

  // Importante: NO usar la clave "error" si hay movimientos (el cliente hace throw si data.error).
  // Los avisos de un banco (HUB046) van en avisos / errorFondo.
  const avisos = errores.length ? errores.join(" · ") : null;
  return {
    success: true,
    movimientos,
    cortes,
    por_banco: porBanco,
    avisos,
    errorFondo: avisos,
    // solo error duro si no hay ningún movimiento y todos fallaron
    ...(movimientos.length === 0 && errores.length === activas.length && activas.length
      ? { error: avisos }
      : {}),
  };
}

async function accionBandeja(body: any, userId: string, sb: any) {
  // Últimos ~40 días
  const d = new Date();
  d.setDate(d.getDate() - 40);
  return accionMovimientos(
    { ...body, desde: d.toISOString().slice(0, 10) },
    userId,
    sb,
  );
}

// Orden de preferencia del saldo por cuenta (Enable Banking devuelve varios tipos por cuenta):
// primero el saldo contabilizado, luego el disponible. Solo se usa UNO por cuenta
// para que el total no cuente dos veces el mismo dinero.
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
    let uids: string[] = Array.isArray(row.account_uids) ? [...row.account_uids] : [];
    if (!uids.length) {
      row = await refreshCuentasDesdeSesion(row, sb);
      uids = Array.isArray(row.account_uids) ? [...row.account_uids] : [];
    }
    for (const uid of uids) {
      try {
        const data = await ebFetch(
          `/accounts/${encodeURIComponent(uid)}/balances`,
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
          // El cliente Fluxia lee "saldo"; "importe" se mantiene por compatibilidad
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
    // El cliente espera una LISTA en "avisos" (hace avisos.join)
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

// Acceso compartido (stub seguro: solo el propio usuario)
async function accionAccesoListar() {
  return { success: true, emails: [] };
}
async function accionAccesoInvitar() {
  return { success: true, emails: [] };
}
async function accionAccesoQuitar() {
  return { success: true, emails: [] };
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

  try {
    // bancos puede ir sin sesión (útil para diagnóstico)
    if (accion === "bancos" || accion === "listar_bancos" || accion === "") {
      // Si no hay auth, igual listamos (como el stub actual)
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
        return json({ success: true, pong: true, version: "fluxia-banco-v92.10" });
      default:
        return err("Acción desconocida: " + accion);
    }
  } catch (e: any) {
    console.error("Fluxia-banco error:", e);
    return err(e?.message || String(e), 500);
  }
});

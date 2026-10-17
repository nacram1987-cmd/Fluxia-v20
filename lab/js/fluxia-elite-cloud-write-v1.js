// Escritura de colecciones de Élite en la nube (paso 2 de la escritura bidireccional).
// - Nunca escribe sin leer la versión actual, fusionar con el motor del HTML (FluxiaSync954) y comprobar que el resultado contiene todo lo que Élite quería guardar.
// - Copia previa de la clave antes de escribir.
// - Escritura condicionada: solo se guarda si la clave no cambió desde la lectura (t). Si cambió, se relee, se fusiona otra vez y se reintenta.
// - El motor recibe la clave corta (v2_provisiones). Con la clave completa profile:…:v2_… no fusiona nada.
(function (root) {
  'use strict';
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  function importeCents(value) {
    const n = typeof value === 'string' ? Number(value.replace(',', '.')) : value;
    if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0 || n > 100000) return null;
    const cents = Math.round(n * 100);
    return Math.abs(cents / 100 - n) < 1e-9 ? cents : null;
  }

  // Provisión nueva con la misma forma que crea el HTML (inicio = nombre del mes, fin = null).
  function validateProvision(input, now) {
    const errors = [];
    const nombre = String(input?.nombre || '').trim();
    if (!nombre || nombre.length > 80) errors.push('nombre');
    const cents = importeCents(input?.importeMensual);
    if (cents === null) errors.push('importeMensual');
    const mes = Number(input?.mes);
    if (!Number.isInteger(mes) || mes < 1 || mes > 12) errors.push('mes');
    if (!Number.isFinite(now)) errors.push('now');
    if (errors.length) return { ok: false, errors };
    return {
      ok: true,
      item: { id: String(now) + '_' + (input.seq || 1), nombre, importeMensual: cents / 100, inicio: MESES[mes - 1], fin: null, origen: 'manual', _fxUpdatedAt: now, aportaciones: {} }
    };
  }

  // Fusiona lo que Élite quiere guardar con lo que hay en la nube, usando el motor del HTML.
  function mergeWithRemote(sync, key, intendedArray, remoteArray) {
    const raw = sync.mergeCloudValue(key, JSON.stringify(intendedArray), JSON.stringify(remoteArray), null, null, null, null, null, null);
    const merged = JSON.parse(raw);
    if (!Array.isArray(merged)) throw new Error('El motor de fusión no devolvió una lista');
    const ids = new Set(merged.map((x) => String(x?.id ?? '')));
    const missing = intendedArray.filter((x) => !ids.has(String(x?.id ?? '')));
    if (missing.length) throw new Error('La fusión descartaría ' + missing.length + ' registro(s); no se escribe nada');
    return merged;
  }

  // transport: { read(profileKey) -> {v: array, t: number} ; backup(profileKey, row) ; patch(profileKey, expectedT, array) -> boolean }
  async function writeCollection({ sync, transport, profileKey, shortKey, build, maxAttempts = 3 }) {
    if (!sync || typeof sync.mergeCloudValue !== 'function') throw new Error('Falta el motor de fusión');
    if (shortKey.indexOf('profile:') === 0) throw new Error('El motor necesita la clave corta, no la completa');
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const row = await transport.read(profileKey);
      const remote = Array.isArray(row?.v) ? row.v : [];
      const intended = build(remote);
      const merged = mergeWithRemote(sync, shortKey, intended, remote);
      if (row) await transport.backup(profileKey, row);
      const ok = await transport.patch(profileKey, row ? row.t : 0, merged);
      if (ok) return { attempt, count: merged.length };
    }
    throw new Error('La nube cambió en cada intento; no se escribió nada. Vuelve a intentarlo.');
  }

  // Transporte real contra fluxia_datos. Solo usa el token del propio usuario (RLS) y filtra siempre por user_id.
  // La escritura va condicionada a la versión t leída: si otro cliente escribió antes, no se aplica nada.
  function supabaseTransport({ base, anonKey, token, owner, fetchFn }) {
    const f = fetchFn || fetch;
    const headers = { apikey: anonKey, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
    const enc = encodeURIComponent;
    return {
      async read(profileKey) {
        const res = await f(base + '/rest/v1/fluxia_datos?select=v,t&user_id=eq.' + enc(owner) + '&clave=eq.' + enc(profileKey), { headers, cache: 'no-store', credentials: 'omit' });
        if (!res.ok) throw new Error('Lectura de la nube fallida: ' + res.status);
        const rows = await res.json();
        if (!Array.isArray(rows) || rows.length > 1) throw new Error('Respuesta inesperada de la nube');
        if (!rows.length) return null;
        const v = typeof rows[0].v === 'string' ? JSON.parse(rows[0].v) : rows[0].v;
        return { v, t: Number(rows[0].t) || 0 };
      },
      async backup(profileKey, row) {
        const body = { user_id: owner, clave: 'backup:' + profileKey + ':' + new Date().toISOString(), v: JSON.stringify(row.v), t: row.t };
        const res = await f(base + '/rest/v1/fluxia_datos', { method: 'POST', headers, body: JSON.stringify(body), credentials: 'omit' });
        if (!res.ok) throw new Error('No se pudo crear la copia previa: ' + res.status);
      },
      async patch(profileKey, expectedT, array) {
        const newT = Math.max(Date.now(), expectedT + 1);
        const url = base + '/rest/v1/fluxia_datos?user_id=eq.' + enc(owner) + '&clave=eq.' + enc(profileKey) + '&t=eq.' + enc(String(expectedT));
        const res = await f(url, { method: 'PATCH', headers: { ...headers, Prefer: 'return=representation' }, body: JSON.stringify({ v: JSON.stringify(array), t: newT }), credentials: 'omit' });
        if (!res.ok) throw new Error('Escritura fallida: ' + res.status);
        const rows = await res.json();
        return Array.isArray(rows) && rows.length === 1;
      },
    };
  }

  const api = { MESES, importeCents, validateProvision, mergeWithRemote, writeCollection, supabaseTransport };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FluxiaEliteCloudWrite = api;
})(typeof window !== 'undefined' ? window : globalThis);

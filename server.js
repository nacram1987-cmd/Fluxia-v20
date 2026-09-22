/**
 * Fluxia Backend — Node.js estándar, sin npm install (Node >= 18).
 *
 * Arranque local:   node server.js   →  http://127.0.0.1:8787
 *
 * Variables de entorno (todas opcionales en local):
 *   ALLOWED_EMAILS            Lista separada por comas. Solo estos emails pueden tener cuenta.
 *                             Vacío = cualquiera (NO recomendado en producción).
 *   UPSTASH_REDIS_REST_URL    Almacenamiento persistente (Upstash Redis, plan gratis).
 *   UPSTASH_REDIS_REST_TOKEN  Si faltan, se usa el disco local (en Render gratis se BORRA).
 *   BREVO_API_KEY             Envío del código por email (Brevo, plan gratis).
 *   MAIL_FROM                 Remitente verificado en Brevo, ej: tu@gmail.com
 *   RESEND_API_KEY            Alternativa a Brevo (solo envía a tu propio email sin dominio).
 *   DEV_SHOW_CODE=1           SOLO para pruebas: devuelve el código en pantalla. Nunca en producción.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = process.env.PORT || 8787;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const IS_PROD = process.env.NODE_ENV === 'production';

const MAX_BODY = 8 * 1024 * 1024;           // 8 MB por petición
const CODE_TTL_MS = 15 * 60 * 1000;          // el código caduca a los 15 min
const CODE_MAX_TRIES = 5;                    // intentos por código
const TOKEN_TTL_MS = 180 * 24 * 3600 * 1000; // sesión: 180 días
const VERSIONS_KEPT = 5;                     // copias anteriores guardadas por usuario
const CODE_COOLDOWN_MS = Number(process.env.CODE_COOLDOWN_MS) || 45e3; // espera entre códigos al mismo email

const ALLOWED = String(process.env.ALLOWED_EMAILS || '')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

// ─────────────────────────────────────────────────────────────
// ALMACENAMIENTO: Upstash (persistente) o disco local
// ─────────────────────────────────────────────────────────────
const UP_URL = (process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/$/, '');
const UP_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';
const USE_UPSTASH = !!(UP_URL && UP_TOKEN);

async function redis(cmd) {
  const r = await fetch(UP_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + UP_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd)
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error('Almacenamiento: ' + (j.error || r.status));
  return j.result;
}

function fileFor(key) {
  return path.join(DATA_DIR, key.replace(/[^a-z0-9@._:-]/gi, '_') + '.json');
}

const store = {
  async get(key) {
    if (USE_UPSTASH) {
      const v = await redis(['GET', key]);
      return v == null ? null : JSON.parse(v);
    }
    try { return JSON.parse(fs.readFileSync(fileFor(key), 'utf8')); } catch { return null; }
  },
  async set(key, val, ttlMs) {
    const s = JSON.stringify(val);
    if (USE_UPSTASH) {
      return ttlMs ? redis(['SET', key, s, 'PX', String(ttlMs)]) : redis(['SET', key, s]);
    }
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = fileFor(key) + '.tmp';
    fs.writeFileSync(tmp, s);
    fs.renameSync(tmp, fileFor(key));   // escritura atómica: nunca queda un archivo a medias
  },
  async del(key) {
    if (USE_UPSTASH) return redis(['DEL', key]);
    try { fs.unlinkSync(fileFor(key)); } catch {}
  }
};

// ─────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────
const emailKey = e => String(e || '').trim().toLowerCase();
const hash = s => crypto.createHash('sha256').update(String(s)).digest('hex');
const makeCode = () => String(crypto.randomInt(100000, 1000000));
const makeToken = () => crypto.randomBytes(32).toString('hex');
function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
const emailPermitido = e => !ALLOWED.length || ALLOWED.includes(e);

const K = {
  user: e => 'fluxia:user:' + e,
  token: t => 'fluxia:token:' + hash(t),
  snap: e => 'fluxia:snap:' + e,
  vers: e => 'fluxia:snapvers:' + e
};

// Límite de peticiones en memoria (suficiente para uso personal)
const hits = new Map();
function limitado(clave, max, ventanaMs) {
  const now = Date.now();
  const arr = (hits.get(clave) || []).filter(t => now - t < ventanaMs);
  arr.push(now);
  hits.set(clave, arr);
  return arr.length > max;
}
setInterval(() => { const now = Date.now(); for (const [k, a] of hits) if (!a.some(t => now - t < 3600e3)) hits.delete(k); }, 600e3).unref();

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};
function send(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, Object.assign({
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store'
  }, CORS));
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on('data', c => {
      size += c.length;
      if (size > MAX_BODY) { reject(Object.assign(new Error('El plan es demasiado grande'), { status: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch { reject(Object.assign(new Error('JSON no válido'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}

function ipDe(req) {
  return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
}

async function authUser(req) {
  const m = String(req.headers.authorization || '').match(/^Bearer\s+([a-f0-9]{32,128})$/i);
  if (!m) return null;
  const t = await store.get(K.token(m[1]));
  if (!t || !t.email || (t.expires && Date.now() > t.expires)) return null;
  return { email: t.email, raw: m[1] };
}

// ─────────────────────────────────────────────────────────────
// EMAIL
// ─────────────────────────────────────────────────────────────
function htmlCodigo(code) {
  return '<div style="font-family:system-ui,sans-serif;max-width:420px;margin:auto;padding:24px;">' +
    '<h2 style="color:#0E7C90;margin:0 0 12px;">Fluxia</h2>' +
    '<p>Tu código para entrar es:</p>' +
    '<p style="font-size:32px;font-weight:700;letter-spacing:6px;margin:16px 0;">' + code + '</p>' +
    '<p style="color:#64748B;font-size:13px;">Caduca en 15 minutos. Si no lo has pedido tú, ignora este correo.</p></div>';
}
async function enviarCodigo(email, code) {
  const from = process.env.MAIL_FROM || '';
  if (process.env.BREVO_API_KEY && from) {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ sender: { email: from, name: 'Fluxia' }, to: [{ email }], subject: 'Tu código de Fluxia: ' + code, htmlContent: htmlCodigo(code) })
    });
    if (!r.ok) throw new Error('No se pudo enviar el email (' + r.status + ')');
    return 'email';
  }
  if (process.env.RESEND_API_KEY) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: from || 'Fluxia <onboarding@resend.dev>', to: [email], subject: 'Tu código de Fluxia: ' + code, html: htmlCodigo(code) })
    });
    if (!r.ok) throw new Error('No se pudo enviar el email (' + r.status + ')');
    return 'email';
  }
  return null; // sin proveedor configurado
}

// ─────────────────────────────────────────────────────────────
// ESTÁTICOS
// ─────────────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json'
};
function serveStatic(req, res, pathname) {
  let rel = pathname === '/' ? '/index.html' : pathname;
  try { rel = decodeURIComponent(rel).replace(/\0/g, ''); } catch { return send(res, 400, { error: 'Ruta no válida' }); }
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR + path.sep)) return send(res, 400, { error: 'Ruta no válida' });
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, { error: 'No encontrado' });
  const ext = path.extname(file).toLowerCase();
  const data = fs.readFileSync(file);
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': data.length,
    // index.html siempre fresco para que el iPhone reciba las actualizaciones
    'Cache-Control': ext === '.html' || ext === '.webmanifest' ? 'no-cache' : 'public, max-age=86400',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'X-Frame-Options': 'SAMEORIGIN'
  });
  res.end(data);
}

// ─────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
  const p = new URL(req.url || '/', 'http://x').pathname;
  const q = new URL(req.url || '/', 'http://x').searchParams;

  try {
    if (req.method === 'GET' && p === '/health') {
      return send(res, 200, {
        ok: true, service: 'fluxia-backend', time: new Date().toISOString(),
        storage: USE_UPSTASH ? 'upstash (persistente)' : 'disco local (temporal en Render gratis)',
        email: (process.env.BREVO_API_KEY && process.env.MAIL_FROM) ? 'brevo' : (process.env.RESEND_API_KEY ? 'resend' : 'sin configurar'),
        privado: ALLOWED.length > 0
      });
    }

    // Pedir código
    if (req.method === 'POST' && p === '/auth/request-code') {
      const { email: raw } = await readBody(req);
      const email = emailKey(raw);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return send(res, 400, { error: 'Email no válido' });
      if (limitado('ip:' + ipDe(req), 20, 3600e3)) return send(res, 429, { error: 'Demasiados intentos. Prueba en una hora.' });
      if (limitado('mail:' + email, 1, CODE_COOLDOWN_MS)) return send(res, 429, { error: 'Espera unos segundos antes de pedir otro código.' });
      // Misma respuesta si el email no está autorizado: no se revela quién tiene cuenta
      if (!emailPermitido(email)) return send(res, 200, { ok: true, message: 'Si el email está autorizado, recibirás un código.' });

      const code = makeCode();
      const user = (await store.get(K.user(email))) || { email, createdAt: new Date().toISOString() };
      user.codeHash = hash(email + ':' + code);
      user.codeExpires = Date.now() + CODE_TTL_MS;
      user.codeTries = 0;
      await store.set(K.user(email), user);

      let via = null;
      try { via = await enviarCodigo(email, code); }
      catch (e) { console.error('[mail]', e.message); return send(res, 502, { error: 'No se pudo enviar el email. Inténtalo de nuevo.' }); }

      const payload = { ok: true, message: via ? 'Te hemos enviado un código a tu correo.' : 'Código generado.' };
      if (!via) {
        if (IS_PROD && process.env.DEV_SHOW_CODE !== '1') {
          return send(res, 503, { error: 'El servidor no tiene configurado el envío de emails.' });
        }
        payload.devCode = code;            // solo en local / pruebas explícitas
        console.log('[auth] Código para ' + email + ': ' + code);
      }
      return send(res, 200, payload);
    }

    // Verificar código
    if (req.method === 'POST' && p === '/auth/verify') {
      const body = await readBody(req);
      const email = emailKey(body.email);
      const code = String(body.code || '').trim();
      if (limitado('verify:' + ipDe(req), 30, 3600e3)) return send(res, 429, { error: 'Demasiados intentos. Prueba en una hora.' });
      const user = await store.get(K.user(email));
      if (!user || !user.codeHash) return send(res, 400, { error: 'Pide primero un código' });
      if (Date.now() > (user.codeExpires || 0)) return send(res, 400, { error: 'El código ha caducado. Pide otro.' });
      if ((user.codeTries || 0) >= CODE_MAX_TRIES) return send(res, 429, { error: 'Demasiados intentos con este código. Pide otro.' });
      if (!safeEqual(hash(email + ':' + code), user.codeHash)) {
        user.codeTries = (user.codeTries || 0) + 1;
        await store.set(K.user(email), user);
        return send(res, 401, { error: 'Código incorrecto' });
      }
      delete user.codeHash; delete user.codeExpires; delete user.codeTries;
      user.verifiedAt = new Date().toISOString();
      await store.set(K.user(email), user);
      const token = makeToken();
      await store.set(K.token(token), { email, expires: Date.now() + TOKEN_TTL_MS }, TOKEN_TTL_MS);
      return send(res, 200, { ok: true, token, email });
    }

    if (req.method === 'POST' && p === '/auth/logout') {
      const a = await authUser(req);
      if (a) await store.del(K.token(a.raw));
      return send(res, 200, { ok: true });
    }

    // A partir de aquí, todo requiere sesión
    if (p.startsWith('/v1/')) {
      const a = await authUser(req);
      if (!a) return send(res, 401, { error: 'Sesión caducada. Vuelve a entrar.' });

      if (req.method === 'GET' && p === '/v1/me') {
        const s = await store.get(K.snap(a.email));
        return send(res, 200, { ok: true, email: a.email, lastUpload: s ? s.updatedAt : null });
      }

      if (req.method === 'GET' && p === '/v1/snapshot') {
        const v = q.get('version');
        if (v != null) {
          const vers = (await store.get(K.vers(a.email))) || [];
          const item = vers[Number(v)];
          if (!item) return send(res, 404, { error: 'Esa versión no existe' });
          return send(res, 200, { ok: true, snapshot: item });
        }
        const s = await store.get(K.snap(a.email));
        if (!s) return send(res, 404, { error: 'No hay plan guardado en el servidor' });
        return send(res, 200, { ok: true, snapshot: s });
      }

      if (req.method === 'GET' && p === '/v1/snapshot/versions') {
        const vers = (await store.get(K.vers(a.email))) || [];
        return send(res, 200, { ok: true, versions: vers.map((x, i) => ({ version: i, updatedAt: x.updatedAt })) });
      }

      if (req.method === 'PUT' && p === '/v1/snapshot') {
        const body = await readBody(req);
        const payload = body.snapshot || body;
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return send(res, 400, { error: 'Falta el plan' });
        const anterior = await store.get(K.snap(a.email));
        if (anterior) {
          const vers = (await store.get(K.vers(a.email))) || [];
          vers.unshift(anterior);
          await store.set(K.vers(a.email), vers.slice(0, VERSIONS_KEPT));
        }
        const wrapped = { email: a.email, updatedAt: new Date().toISOString(), snapshot: payload };
        await store.set(K.snap(a.email), wrapped);
        return send(res, 200, { ok: true, updatedAt: wrapped.updatedAt });
      }

      if (req.method === 'DELETE' && p === '/v1/account') {
        await store.del(K.snap(a.email));
        await store.del(K.vers(a.email));
        await store.del(K.user(a.email));
        await store.del(K.token(a.raw));
        return send(res, 200, { ok: true, deleted: true });
      }

      return send(res, 404, { error: 'Ruta no encontrada' });
    }

    if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(req, res, p);
    return send(res, 404, { error: 'Ruta no encontrada' });
  } catch (e) {
    console.error(e);
    return send(res, e.status || 500, { error: e.status ? e.message : 'Error interno' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n  Fluxia listo → http://127.0.0.1:' + PORT);
  console.log('  Almacenamiento: ' + (USE_UPSTASH ? 'Upstash (persistente)' : 'disco local'));
  console.log('  Emails: ' + ((process.env.BREVO_API_KEY && process.env.MAIL_FROM) ? 'Brevo' : process.env.RESEND_API_KEY ? 'Resend' : 'no configurado (el código se muestra en pantalla solo en local)'));
  console.log('  Acceso: ' + (ALLOWED.length ? 'solo ' + ALLOWED.join(', ') : 'abierto a cualquier email'));
  if (IS_PROD && !USE_UPSTASH) console.warn('  ⚠️  En producción sin Upstash: los datos se perderán al reiniciar.');
  if (IS_PROD && !ALLOWED.length) console.warn('  ⚠️  ALLOWED_EMAILS vacío: cualquiera puede crear cuenta.');
  console.log('');
});

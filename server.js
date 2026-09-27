import express from 'express';
import cors from 'cors';
import webpush from 'web-push';
import fs from 'node:fs';
import path from 'node:path';

const app = express();
app.use(cors());
app.use(express.json({ limit: '64kb' }));

const PORT = Number(process.env.PORT || 3000);
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || '';
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const PUSH_SHARED_SECRET = process.env.PUSH_SHARED_SECRET || '';

if (VAPID_SUBJECT && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// Demo-ready persistence. Replace with encrypted database storage for production.
const dataDir = path.join(process.cwd(), 'data');
const subsFile = path.join(dataDir, 'subscriptions.json');
fs.mkdirSync(dataDir, { recursive: true });
const subscriptions = new Map();
try {
  const saved = JSON.parse(fs.readFileSync(subsFile, 'utf8'));
  for (const item of Array.isArray(saved) ? saved : []) if (item?.subscription?.endpoint) subscriptions.set(item.subscription.endpoint, item);
} catch (_) {}
function persistSubscriptions() {
  const tmp = subsFile + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify([...subscriptions.values()], null, 2), 'utf8');
  fs.renameSync(tmp, subsFile);
}
const processedMovements = new Map();

function authWebhook(req) {
  return !!PUSH_SHARED_SECRET && req.get('x-fluxia-push-secret') === PUSH_SHARED_SECRET;
}
function cleanMovementId(value) {
  return String(value || '').trim().slice(0, 180);
}
function pruneProcessed() {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  for (const [k, v] of processedMovements) if (v < cutoff) processedMovements.delete(k);
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'fluxia-push', vapidConfigured: !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) });
});

app.get('/api/push/config', (_req, res) => {
  res.json({ ok: true, vapidPublicKey: VAPID_PUBLIC_KEY, appId: 'fluxia-beta' });
});

app.post('/api/push/subscribe', (req, res) => {
  const sub = req.body?.subscription;
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return res.status(400).json({ ok: false, error: 'invalid_subscription' });
  }
  const userId = String(req.body?.userId || 'local-device').slice(0, 180);
  subscriptions.set(sub.endpoint, {
    subscription: sub,
    userId,
    appId: String(req.body?.appId || 'fluxia-beta'),
    updatedAt: Date.now()
  });
  persistSubscriptions();
  res.json({ ok: true });
});

app.post('/api/push/unsubscribe', (req, res) => {
  const endpoint = String(req.body?.endpoint || '');
  if (endpoint) { subscriptions.delete(endpoint); persistSubscriptions(); }
  res.json({ ok: true });
});

/*
  Punto de entrada para el conector bancario.
  El agregador/API de banco debe llamar a este endpoint cuando exista un
  movimiento NUEVO. Nunca manda un movimiento financiero al cliente: solo
  dispara la notificación. El movimiento seguirá entrando por el flujo de
  sincronización bancaria de Fluxia.
*/
app.post('/api/push/test', async (req, res) => {
  if (!authWebhook(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  const userId = String(req.body?.userId || '').trim();
  if (!userId) return res.status(400).json({ ok: false, error: 'user_id_required' });
  let sent = 0, removed = 0;
  for (const [endpoint, item] of subscriptions) {
    if (item.userId !== userId) continue;
    try {
      await webpush.sendNotification(item.subscription, JSON.stringify({
        title: '🔔 Fluxia · prueba Web Push',
        body: 'La conexión de avisos bancarios funciona correctamente.',
        tag: 'fluxia-push-test',
        badge: 1,
        url: 'https://nacram1987-cmd.github.io/Fluxia-v20/'
      }), { TTL: 300, urgency: 'normal', topic: 'fluxia-test' });
      sent++;
    } catch (err) {
      const status = err?.statusCode;
      if (status === 404 || status === 410) { subscriptions.delete(endpoint); persistSubscriptions(); removed++; }
      else console.error('[Fluxia Push] test error', status, err?.message || err);
    }
  }
  res.json({ ok: true, sent, removed });
});

app.post('/api/bank/movement', async (req, res) => {
  if (!authWebhook(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });

  const movement = req.body?.movement || req.body || {};
  const movementId = cleanMovementId(movement.movimientoId || movement.id || movement.bancoRef);
  const targetUserId = String(movement.userId || '').trim();
  if (!targetUserId) return res.status(400).json({ ok: false, error: 'user_id_required' });
  if (!movementId) return res.status(400).json({ ok: false, error: 'movement_id_required' });

  pruneProcessed();
  if (processedMovements.has(movementId)) {
    return res.json({ ok: true, duplicate: true, sent: 0 });
  }
  processedMovements.set(movementId, Date.now());

  const title = movement.title || '🏦 Fluxia · nuevo pago bancario';
  const amount = movement.importe;
  const concept = movement.concepto || 'Nuevo movimiento bancario';
  const body = movement.body || (amount !== undefined
    ? `${concept} · ${Number(amount).toFixed(2)} €`
    : concept);

  let sent = 0, removed = 0;
  for (const [endpoint, item] of subscriptions) {
    if (item.userId !== targetUserId) continue;
    try {
      await webpush.sendNotification(item.subscription, JSON.stringify({
        title,
        body,
        tag: `fluxia-bank-${movementId}`,
        movementId,
        bancoRef: movement.bancoRef || null,
        badge: 1,
        url: movement.url || 'https://nacram1987-cmd.github.io/Fluxia-v20/'
      }), { TTL: 3600, urgency: 'high', topic: `fx${movementId.replace(/[^A-Za-z0-9_-]/g, '').slice(-20)}` });
      sent++;
    } catch (err) {
      const status = err?.statusCode;
      if (status === 404 || status === 410) { subscriptions.delete(endpoint); persistSubscriptions(); removed++; }
      else console.error('[Fluxia Push] send error', status, err?.message || err);
    }
  }

  res.json({ ok: true, duplicate: false, sent, removed, movementId });
});

app.listen(PORT, () => {
  console.log(`Fluxia Push server listening on :${PORT}`);
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('VAPID keys are not configured. Generate them with: npx web-push generate-vapid-keys');
  }
});

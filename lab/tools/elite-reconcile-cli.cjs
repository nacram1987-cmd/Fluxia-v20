#!/usr/bin/env node
'use strict';
/* Herramienta PRIVADA de conciliación de solo lectura (Fluxia Élite v2.0.25).
 *
 * Uso:
 *   node lab/tools/elite-reconcile-cli.cjs --cloud export-nube.json --html copia-html.json \
 *        --month 2026-10 --cutoff 2026-10-15T10:00:00+02:00 --out ./informe-privado
 *
 *  --cloud   exportación «fluxia-elite-cloud-readonly-v1» (botón de exportación de Élite).
 *  --html    copia «fluxia-perfil-v1» exportada por el HTML estable.
 *  --month   periodo contable AAAA-MM.   --cutoff  instante común de corte (ISO con zona).
 *  --bank-scope none   declara explícitamente que el perfil no usa movimientos bancarios en el periodo (criterio [d]).
 *  --out     carpeta de salida (se crea). Escribe: informe-privado.json (con IDs reales: NO subir a GitHub)
 *            e informe-publico.json (seudónimos y huellas; sin IDs ni importes por registro).
 *
 * Solo LEE los dos archivos locales. No usa red, no lee credenciales y no escribe en Supabase.
 * Usa EXACTAMENTE las mismas funciones del HTML que la app (lib/elite-html-functions.cjs).
 */
const fs = require('node:fs');
const path = require('node:path');
const { loadEliteFunctions, MODS } = require('../qa/lib/elite-html-functions.cjs');
const { validateEvidenceCut } = require('./elite-evidence-cut-guard.cjs');

function arg(name, fallback) {
  const i = process.argv.indexOf('--' + name);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : fallback;
}
function fail(message) { console.error('ERROR: ' + message); process.exit(2); }
const replacer = (k, v) => (typeof v === 'bigint' ? v.toString() : v);

const cloudPath = arg('cloud'), htmlPath = arg('html'), month = arg('month'), cutoff = arg('cutoff'), outDir = arg('out', './informe-conciliacion');
if (!cloudPath || !month || !cutoff) fail('Uso: --cloud <export.json> [--html <copia.json>] --month AAAA-MM --cutoff <ISO con zona> [--out carpeta]');
if (!/^\d{4}-\d{2}$/.test(month)) fail('--month debe ser AAAA-MM');
if (!Number.isFinite(Date.parse(cutoff)) || !/(Z|[+-]\d{2}:\d{2})$/.test(cutoff)) fail('--cutoff debe ser ISO con zona horaria (p. ej. 2026-10-15T10:00:00+02:00)');

let cloud; try { cloud = JSON.parse(fs.readFileSync(cloudPath, 'utf8')); } catch (e) { fail('Exportación de la nube ilegible: ' + e.message); }
if (cloud.format !== 'fluxia-elite-cloud-readonly-v1' || !cloud.sources || !cloud.user_id || !cloud.profile_key) fail('La exportación no tiene el formato fluxia-elite-cloud-readonly-v1');
let backup = null;
if (htmlPath) { try { backup = JSON.parse(fs.readFileSync(htmlPath, 'utf8')); } catch (e) { fail('Copia del HTML ilegible: ' + e.message); } }

const S = loadEliteFunctions({ owner: cloud.user_id, activeProfile: cloud.profile_key, selectedMonth: month });
const ctx = S.context;
const missing = [];
ctx.items = {};
for (const mod of MODS.filter((m) => m.key)) {
  const src = cloud.sources[mod.key];
  if (src && src.available && Array.isArray(src.records)) ctx.items[mod.key] = src.records;
  else missing.push(mod.id);
}
ctx.extraFinance = {};
for (const [key, src] of Object.entries(cloud.sources)) if (src && src.available && src.value !== undefined && String(key).startsWith('planRescate_v2_')) ctx.extraFinance[key] = src.value;
ctx.sourceUpdated = cloud.source_updated || {};
ctx.cloudReadAt = typeof cloud.exported_at === 'string' ? cloud.exported_at : '';
ctx.cloudFinanceSnapshot = { owner: cloud.user_id, profile: cloud.profile_key, complete: missing.length === 0 && Array.isArray(ctx.extraFinance.planRescate_v2_usos) };
let acceptedHtmlCut = null;
if (backup) {
  try {
    const profile = cloud.profile_key.slice(2, -2);
    const parsed = S.api.validatePrivateBackup(backup, profile);
    acceptedHtmlCut = parsed.when;
    ctx.backupFinance = { owner: cloud.user_id, profile: cloud.profile_key, when: parsed.when, sources: S.api.readPrivateBackupSources(backup, profile), modules: S.api.readBackupFinancialModules(backup, profile) };
  } catch (e) { console.error('AVISO: copia del HTML rechazada (' + e.message + '). Se informa sin comparación HTML↔nube.'); }
}

// Un certificado solo compara un periodo y corte común. La discrepancia ahora bloquea el informe.
try { validateEvidenceCut({ month, cutoff, cloudMonth: cloud.accounting_month, cloudExportedAt: cloud.exported_at, htmlSnapshotAt: acceptedHtmlCut }); }
catch (e) { fail('Corte de evidencia incompatible: ' + e.message); }
if (arg('bank-scope') === 'none') S.storage.setItem('fluxia_elite_recon_bankscope_v1:' + encodeURIComponent(cloud.user_id) + ':' + encodeURIComponent(cloud.profile_key), JSON.stringify({ scope: 'none', month }));
const cert = S.api.availableCertificationReport();
const Rec = S.reconciliation;
const ev = cert.evidence || {};
const priv = {
  format: 'fluxia-elite-reconciliation-private-v1', generatedAt: new Date().toISOString(), period: month, cutoff,
  status: cert.status, certified: cert.certified === true,
  availableCents: cert.calculation && cert.calculation.ok ? String(cert.calculation.cents) : null,
  availableFormatted: cert.calculation && cert.calculation.ok ? Rec.formatCents(cert.calculation.cents) : null,
  blockers: cert.blockers || [], gates: cert.verdict ? cert.verdict.gates : [],
  flags: cert.verdict ? { dataSufficientToCalculate: cert.verdict.dataSufficientToCalculate, dataSufficientToCertify: cert.verdict.dataSufficientToCertify, bankSyncUpToDate: cert.verdict.bankSyncUpToDate } : {},
  comparison: ev.comparison || null, duplicates: { variables: ev.variableDuplicates || [], ingresos: ev.incomeDuplicates || [] },
  checksums: ev.checksums || {}, ledgerChecksum: ev.ledgerChecksum || null, certificateHash: ev.certificateHash || null,
  missingCollections: missing, warning: 'PRIVADO: contiene importes e IDs. No subir a GitHub ni compartir.',
};
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'informe-privado.json'), JSON.stringify(priv, replacer, 1));
const pub = Rec.publicReport({ generatedAt: priv.generatedAt, period: month, cutoff, ownerId: cloud.user_id, profileId: cloud.profile_key, status: cert.status, availableCents: cert.calculation && cert.calculation.ok ? cert.calculation.cents : null,
  flags: priv.flags, gates: priv.gates, checksums: priv.checksums, certificateHash: priv.certificateHash, diffCount: ev.comparison && ev.comparison.diffs ? ev.comparison.diffs.length : 0, modules: ev.comparison && ev.comparison.modules ? ev.comparison.modules : {} });
fs.writeFileSync(path.join(outDir, 'informe-publico.json'), JSON.stringify(pub, replacer, 1));
console.log('Estado: ' + priv.status + (priv.availableFormatted ? ' · Disponible ' + priv.availableFormatted : '') + ' · bloqueos: ' + priv.blockers.length);
for (const b of priv.blockers.slice(0, 12)) console.log(' - ' + b);
console.log('Informes escritos en ' + path.resolve(outDir));
process.exit(cert.certified ? 0 : 1);

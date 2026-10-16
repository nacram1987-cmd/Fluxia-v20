'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const { validateEvidenceCut, MAX_SKEW_MS } = require('../tools/elite-evidence-cut-guard.cjs');
const cloud = '2026-10-15T10:00:00+02:00';
const near = (ms) => new Date(Date.parse(cloud) + ms).toISOString();
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('✓ ' + name); }
test('acepta exports del mismo mes y corte con desfase de 1 h exacta', () => {
  assert.equal(validateEvidenceCut({ month: '2026-10', cloudMonth: '2026-10', cutoff: cloud, cloudExportedAt: cloud, htmlSnapshotAt: near(MAX_SKEW_MS) }), true);
});
test('acepta nube sin HTML y deja al certificado resolver que falta comparación', () => {
  assert.equal(validateEvidenceCut({ month: '2026-10', cloudMonth: '2026-10', cutoff: cloud, cloudExportedAt: cloud }), true);
});
test('rechaza periodo fuera de rango', () => assert.throws(() => validateEvidenceCut({ month: '2026-13', cloudMonth: '2026-13', cutoff: cloud, cloudExportedAt: cloud }), /periodo válido/));
test('rechaza exportación de otro mes', () => assert.throws(() => validateEvidenceCut({ month: '2026-10', cloudMonth: '2026-09', cutoff: cloud, cloudExportedAt: cloud }), /no coincide/));
test('rechaza timestamp sin zona horaria', () => assert.throws(() => validateEvidenceCut({ month: '2026-10', cloudMonth: '2026-10', cutoff: '2026-10-15T10:00:00', cloudExportedAt: cloud }), /zona horaria/));
test('rechaza corte separado de la nube por más de 1 h', () => assert.throws(() => validateEvidenceCut({ month: '2026-10', cloudMonth: '2026-10', cutoff: near(MAX_SKEW_MS + 1), cloudExportedAt: cloud }), /más de 1 h de la exportación de nube/));
test('rechaza corte separado de HTML por más de 1 h', () => assert.throws(() => validateEvidenceCut({ month: '2026-10', cloudMonth: '2026-10', cutoff: cloud, cloudExportedAt: near(MAX_SKEW_MS - 60000), htmlSnapshotAt: near(2 * MAX_SKEW_MS - 120000) }), /más de 1 h de la copia HTML/));
test('rechaza fuentes HTML/nube separadas entre sí por más de 1 h', () => assert.throws(() => validateEvidenceCut({ month: '2026-10', cloudMonth: '2026-10', cutoff: cloud, cloudExportedAt: near(-MAX_SKEW_MS - 60000), htmlSnapshotAt: near(MAX_SKEW_MS + 60000) }), /difieren más de 1 h/));
test('la CLI aborta antes de crear informes cuando el corte no coincide', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fluxia-cut-'));
  try {
    const exportPath = path.join(dir, 'synthetic-cloud.json'), out = path.join(dir, 'must-not-exist');
    fs.writeFileSync(exportPath, JSON.stringify({ format: 'fluxia-elite-cloud-readonly-v1', accounting_month: '2026-10', exported_at: cloud, user_id: 'synthetic-owner', profile_key: 'p_usr-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa__', sources: {} }));
    const cli = path.join(__dirname, '../tools/elite-reconcile-cli.cjs');
    const r = cp.spawnSync(process.execPath, [cli, '--cloud', exportPath, '--month', '2026-10', '--cutoff', near(MAX_SKEW_MS + 1), '--out', out], { encoding: 'utf8' });
    assert.equal(r.status, 2); assert.match(r.stderr, /Corte de evidencia incompatible/); assert.equal(fs.existsSync(out), false);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
test('la CLI bloquea una exportación de nube de otro mes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fluxia-month-'));
  try {
    const exportPath = path.join(dir, 'synthetic-cloud.json'), out = path.join(dir, 'must-not-exist');
    fs.writeFileSync(exportPath, JSON.stringify({ format: 'fluxia-elite-cloud-readonly-v1', accounting_month: '2026-09', exported_at: cloud, user_id: 'synthetic-owner', profile_key: 'p_usr-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa__', sources: {} }));
    const cli = path.join(__dirname, '../tools/elite-reconcile-cli.cjs');
    const r = cp.spawnSync(process.execPath, [cli, '--cloud', exportPath, '--month', '2026-10', '--cutoff', cloud, '--out', out], { encoding: 'utf8' });
    assert.equal(r.status, 2); assert.match(r.stderr, /no coincide/); assert.equal(fs.existsSync(out), false);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
console.log('PASS v2.0.27 evidence-cut guard: ' + passed + ' tests');

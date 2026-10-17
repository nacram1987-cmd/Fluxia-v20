'use strict';
// La CLI de conciliación reproduce el criterio [c] como la app: usa los vínculos persistentes de rescate (fluxia_rescue_links)
// y rechaza vínculos de otro perfil. Datos sintéticos.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const T = require('../tools/conciliacion-tres-vias.cjs');
const root = path.resolve(__dirname, '../..');
const PERFIL = 'usr-00000000-test-0000-0000-000000000000';
const fila = (c, v) => ({ clave: 'profile:' + PERFIL + ':' + c, v: JSON.stringify(v), t: 1, updated_at: '2026-10-17T06:00:00Z' });
const snap = { corte: '2026-10-17T06:00:00Z', rows: [fila('v2_ingresos', []), fila('v2_fijos', []), fila('v2_movimientos', []), fila('v2_compartidos', []), fila('v2_financiaciones', []),
  fila('v2_provisiones', [{ id: 'p1', nombre: 'Seguro', importeMensual: 100, inicio: 'julio', fin: null, aportaciones: { octubre: [{ id: 'a1', fecha: '2026-10-03', importe: 100 }] } }]),
  fila('v2_usos', [{ id: 'u1', mes: 'octubre', fecha: '2026-10-15', provision: 'Seguro', tipo: 'temporal', importe: 80, repuesto: 0 }])] };
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fx-cli-'));
fs.writeFileSync(path.join(dir, 'nube.json'), JSON.stringify(T.exportacionElite(snap, PERFIL, 'usuario-test', '2026-10')));
const link = { operation_id: 'u1', hucha_id: 'p1', operation_name: 'Seguro', amount_cents: 8000, operation_date: '2026-10-15', profile_id: PERFIL };
fs.writeFileSync(path.join(dir, 'ok.json'), JSON.stringify([link]));
fs.writeFileSync(path.join(dir, 'ajeno.json'), JSON.stringify([{ ...link, profile_id: 'usr-otro' }]));
const run = (extra) => spawnSync(process.execPath, [path.join(root, 'lab/tools/elite-reconcile-cli.cjs'), '--cloud', path.join(dir, 'nube.json'), '--month', '2026-10', '--cutoff', '2026-10-17T06:00:00Z', '--out', path.join(dir, 'out'), ...extra], { encoding: 'utf8' });
const sin = run([]);
assert.match(sin.stdout, /1 rescate\(s\) vinculados solo por nombre/, 'sin vínculos: rescate solo por nombre');
const con = run(['--rescue-links', path.join(dir, 'ok.json')]);
assert.match(con.stdout, /^Estado: /m, 'la CLI genera informe (sale con 1 mientras el certificado no esté completo: es su diseño)' + con.stderr);
assert.doesNotMatch(con.stdout, /vinculados solo por nombre/, 'con vínculo persistente ya no es «solo por nombre»');
const ajeno = run(['--rescue-links', path.join(dir, 'ajeno.json')]);
assert.notEqual(ajeno.status, 0); assert.match(ajeno.stderr, /otro perfil/, 'no se mezclan perfiles');
fs.rmSync(dir, { recursive: true, force: true });
console.log('PASS CLI: vínculos persistentes de rescate como en la app y rechazo de vínculos de otro perfil');

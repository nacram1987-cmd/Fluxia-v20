/* E2E v94.63 · escenario REAL del fallo v94.55–62 (plan partido + vaciado + papelera). Debe FALLAR con v94.62. */
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const FILE = process.argv[2];
const P = 'usr-nacho1', LP = 'fluxia_user_' + P + '__', U = 'planRescate_v2_u_' + P + '_';
const HOY = '2026-10-03', AYER_ISO = '2026-10-03T08:00:00.000Z';
const m = (id, extra) => Object.assign({ id, mes: 'octubre', fecha: '2026-10-0' + (1 + (id.charCodeAt(1) % 3)), concepto: 'Gasto ' + id, categoria: 'Otros', importe: 10 + id.length, origen: 'manual' }, extra || {});
const seed = {};
const prof = { id: P, name: 'Nacho', createdAt: 1, newUser: false, legacy: false, principal: false, onboardingPending: false, onboardingCompletedAt: 2 };
const inv = { id: 'usr-inv', name: 'Invitada', createdAt: 5, newUser: false, legacy: false, principal: false, onboardingPending: false, onboardingCompletedAt: 6 };
seed['fluxia_profile_v2'] = JSON.stringify(prof);
seed['fluxia_profiles_v2'] = JSON.stringify([prof, inv]);
seed['fluxia_perfil_aislado_' + P] = '1';           /* lo que hacía el onboarding de v94.55+ */
seed['fluxia_perfil_aislado_usr-inv'] = '1';
const cfg = { data: { septiembre: { deficit: 0, fondo: 0 }, octubre: { deficit: 0, fondo: 0 }, noviembre: { deficit: 0, fondo: 0 } }, deficitInicial: 0, fondoObjetivo: 0, meses: ['septiembre', 'octubre', 'noviembre'], planAnio: 2026 };
seed[LP + 'planRescate_v2_config_plan'] = JSON.stringify(cfg);
seed[LP + 'planRescate_v2_ingresos'] = JSON.stringify([{ id: 'i1', mes: 'octubre', concepto: 'Nómina', importe: 2000, pagadoEl: '2026-10-01' }, { id: 'i0', mes: 'septiembre', concepto: 'Nómina', importe: 2000, pagadoEl: '2026-09-01' }]);
seed[LP + 'planRescate_v2_fijos'] = JSON.stringify([{ id: 'f1', mes: 'octubre', nombre: 'Alquiler', importe: 700 }]);
const p1base = { id: 'p1', nombre: 'Coche', importeMensual: 100, inicio: 'septiembre', aportaciones: { septiembre: [{ id: 'a1', importe: 100, fecha: '2026-09-05' }], octubre: [] } };
const p1new = JSON.parse(JSON.stringify(p1base)); p1new.aportaciones.octubre = [{ id: 'a2', importe: 150, fecha: '2026-10-02' }];
seed[LP + 'planRescate_v2_provisiones'] = JSON.stringify([p1base]);
seed[LP + 'planRescate_v2_usos'] = JSON.stringify([{ id: 'u1', provisionId: 'p1', importe: 50, fecha: '2026-09-20', motivo: 'Rescate ITV', tipo: 'temporal' }]);
seed[LP + 'planRescate_v2_movimientos'] = JSON.stringify([m('m1'), m('m2'), m('m3', { origen: 'banco', bancoRef: 'r3', banco: 'Revolut' })]);
seed[LP + 'planRescate_v2_cierres'] = JSON.stringify({});
/* espacio u_ (v94.62) tras el vaciado + un guardado: solo lo nuevo */
seed[LP + U + 'movimientos'] = JSON.stringify([m('m5', { origen: 'banco', bancoRef: 'r5', banco: 'CaixaBank' }), m('L1')]);
seed[LP + U + 'usos'] = JSON.stringify([{ id: 'u3', provisionId: 'p1', importe: 30, fecha: '2026-10-02', motivo: 'Rescate farmacia', tipo: 'temporal' }]);
seed[LP + U + 'provisiones'] = JSON.stringify([p1new]);
seed[LP + U + 'cierres'] = JSON.stringify({ septiembre: '2026-10-01' });
seed[LP + '__ts__' + U + 'provisiones'] = String(Date.parse('2026-10-03T09:00:00Z'));
seed[LP + '__ts__planRescate_v2_provisiones'] = String(Date.parse('2026-10-01T09:00:00Z'));
/* papelera v94.58: lo que se perdió SOLO + un borrado a propósito (m7, vetado) */
const pap = [
  { id: 'pp1', tipo: 'Gasto variable', key: 'planRescate_v2_movimientos', nombre: 'Gasto m6', snapshot: m('m6'), when: AYER_ISO },
  { id: 'pp2', tipo: 'Gasto variable', key: 'planRescate_v2_movimientos', nombre: 'Gasto m7', snapshot: m('m7', { fecha: '2026-10-02', importe: 77 }), when: AYER_ISO },
  { id: 'pp3', tipo: 'Elemento', key: 'planRescate_v2_usos', nombre: 'u2', snapshot: { id: 'u2', provisionId: 'p1', importe: 40, fecha: '2026-10-01', motivo: 'Rescate dentista', tipo: 'temporal' }, when: AYER_ISO },
  { id: 'pp4', tipo: 'Uso hucha', key: 'planRescate_v2_usos', nombre: 'u9', snapshot: { id: 'u9', provisionId: 'p1', importe: 9, fecha: '2026-10-01', motivo: 'Borrado a mano' }, when: AYER_ISO },
  { id: 'pp5', tipo: 'Elemento', key: 'planRescate_v2_usos', nombre: 'u9', snapshot: { id: 'u9', provisionId: 'p1', importe: 9, fecha: '2026-10-01', motivo: 'Borrado a mano' }, when: AYER_ISO },
  { id: 'pp6', tipo: 'Gasto variable', key: 'planRescate_v2_movimientos', nombre: 'viejo', snapshot: m('mOld'), when: '2026-09-15T10:00:00Z' }
];
seed['fluxia_papelera_v2_' + P] = JSON.stringify(pap);
seed['fluxia_gv_borrados_v1'] = JSON.stringify([{ id: 'm7', bancoRef: 'm7', fecha: '2026-10-02', cents: 7700, conc: 'gasto m7', banco: '', concepto: 'Gasto m7', cuando: AYER_ISO }]);
/* otro usuario del dispositivo + legacy crudo viejo */
seed['fluxia_user_usr-inv__planRescate_v2_movimientos'] = JSON.stringify([m('x1')]);
seed['planRescate_v2_movimientos'] = JSON.stringify([m('L1')]);

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext();
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-10-03T10:00:00') });
  await page.route(/^https?:/, r => r.abort());
  const logs = [];
  page.on('pageerror', e => logs.push('PAGEERROR ' + e.message));
  await page.addInitScript(s => { if (!sessionStorage.getItem('__seeded')) { localStorage.clear(); Object.keys(s).forEach(k => localStorage.setItem(k, s[k])); sessionStorage.setItem('__seeded', '1'); } }, seed);
  await page.goto('file://' + FILE);
  const muestras = [];
  for (let t = 0; t < 70; t++) {
    await page.clock.runFor(400); await page.waitForTimeout(40);
    muestras.push(await page.evaluate(() => { try { return { mov: movimientos.length, usos: usosProvisiones.length, prov: provisiones.length }; } catch (e) { return null; } }));
  }
  const st = await page.evaluate(() => ({
    LS: LS_PREFIX, mov: movimientos.map(x => x.id).sort(), usos: usosProvisiones.map(x => x.id).sort(),
    oct: (provisiones.find(p => p.id === 'p1') || {}).aportaciones?.octubre?.length || 0,
    cierreAbierto: !!(document.getElementById('modalOverlay') && document.getElementById('modalOverlay').classList.contains('open') && /Cierre de/.test(document.getElementById('modalOverlay').textContent)),
    informe: JSON.parse(localStorage.getItem('fluxia_v63_informe_usr-nacho1') || 'null'),
    aviso: !!document.getElementById('fxRecV63Aviso')
  }));
  // recarga: estable, sin duplicados, sin cierre
  await page.reload();
  for (let t = 0; t < 70; t++) { await page.clock.runFor(400); await page.waitForTimeout(40); }
  const st2 = await page.evaluate(() => ({ mov: movimientos.map(x => x.id).sort(), usos: usosProvisiones.map(x => x.id).sort(),
    cierreAbierto: !!(document.getElementById('modalOverlay') && document.getElementById('modalOverlay').classList.contains('open') && /Cierre de/.test(document.getElementById('modalOverlay').textContent)) }));
  // borrar un gasto a mano (como el botón) y volver a la app: NO debe volver
  await page.evaluate(() => { const i = movimientos.findIndex(x => x.id === 'm2'); const b = movimientos.splice(i, 1)[0]; try { _fluxiaRegistrarBorradoGV(b); } catch (e) { } _guardarMovimientosTrasBorrado(); });
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  for (let t = 0; t < 30; t++) { await page.clock.runFor(400); await page.waitForTimeout(30); }
  const trasBorrar = await page.evaluate(() => movimientos.map(x => x.id).sort());
  // perfil invitada: no ve nada de Nacho
  await page.evaluate(() => { const a = JSON.parse(localStorage.getItem('fluxia_profiles_v2'))[1]; localStorage.setItem('fluxia_profile_v2', JSON.stringify(a)); });
  await page.reload();
  for (let t = 0; t < 40; t++) { await page.clock.runFor(400); await page.waitForTimeout(30); }
  const inv = await page.evaluate(() => ({ mov: movimientos.map(x => x.id).sort(), usos: usosProvisiones.length }));
  await b.close();

  let ok = 0, ko = 0;
  const check = (n, c, det) => { if (c) { ok++; console.log('✅', n); } else { ko++; console.log('❌', n, det !== undefined ? JSON.stringify(det) : ''); } };
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  check('LS_PREFIX es base (regla v94.52)', st.LS === 'planRescate_v2_', st.LS);
  check('Gastos variables recuperados: m1 m2 m3 (siempre) + m5 (v94.62) + m6 (papelera)', eq(st.mov, ['m1', 'm2', 'm3', 'm5', 'm6']), st.mov);
  check('m7 (borrado a propósito, vetado) NO vuelve', !st.mov.includes('m7'));
  check('L1 (copia cruda ajena) NO entra', !st.mov.includes('L1'));
  check('Papelera antigua (antes de anoche) NO vuelve', !st.mov.includes('mOld'));
  check('Rescates: u1 + u2 (papelera) + u3 (v94.62)', eq(st.usos, ['u1', 'u2', 'u3']), st.usos);
  check('Rescate borrado a mano (u9) NO vuelve', !st.usos.includes('u9'));
  check('Hucha: aportación de octubre de v94.62 conservada', st.oct === 1, st.oct);
  const tras = muestras.slice(5).filter(Boolean);
  check('Nunca se vacían gastos/rescates/huchas tras arrancar (no "se ponen y se quitan")', tras.length > 10 && tras.every(x => x.mov > 0 && x.usos > 0 && x.prov > 0), muestras.filter(x => !x || !x.mov || !x.usos || !x.prov).slice(0, 5));
  check('Cierre de septiembre ya hecho → NO sale al abrir', !st.cierreAbierto);
  check('Informe de recuperación creado + aviso en Inicio', !!(st.informe && st.informe.anadidos && st.informe.anadidos.length >= 3 && st.aviso), st.informe && st.informe.anadidos && st.informe.anadidos.length);
  check('Tras recargar: mismos datos, sin duplicados', eq(st2.mov, st.mov) && eq(st2.usos, st.usos), st2);
  check('Tras recargar: cierre NO sale', !st2.cierreAbierto);
  check('Perfil Invitada: solo sus datos (x1), nada de Nacho', eq(inv.mov, ['x1']) && inv.usos === 0, inv);
  check('Gasto borrado a mano no vuelve al volver a la app', eq(trasBorrar, ['m1', 'm3', 'm5', 'm6']), trasBorrar);
  check('Sin errores JS de página', !logs.length, logs.slice(0, 3));
  console.log(`\n${ok}/${ok + ko}`);
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });

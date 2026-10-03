/* E2E v94.63 (b) · dueño LEGACY + veto banco + cierre una sola vez + «Quitar» con doble confirmación + Sin cuenta no borra */
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const FILE = process.argv[2];
const P = 'usr-legacy', U = 'planRescate_v2_u_' + P + '_';
const m = (id, x) => Object.assign({ id, mes: 'octubre', fecha: '2026-10-02', concepto: 'Gasto ' + id, categoria: 'Otros', importe: 20, origen: 'manual' }, x || {});
const prof = { id: P, name: 'Nacho', createdAt: 1, newUser: false, legacy: true, principal: true, onboardingPending: false };
const seed = {
  fluxia_profile_v2: JSON.stringify(prof), fluxia_profiles_v2: JSON.stringify([prof]),
  planRescate_v2_config_plan: JSON.stringify({ data: { septiembre: { deficit: 0, fondo: 0 }, octubre: { deficit: 0, fondo: 0 } }, meses: ['septiembre', 'octubre'], planAnio: 2026, deficitInicial: 0, fondoObjetivo: 0 }),
  planRescate_v2_ingresos: JSON.stringify([{ id: 'i0', mes: 'septiembre', concepto: 'Nómina', importe: 2000, pagadoEl: '2026-09-01' }, { id: 'i1', mes: 'octubre', concepto: 'Nómina', importe: 2000, pagadoEl: '2026-10-01' }]),
  planRescate_v2_movimientos: JSON.stringify([m('a1'), m('a2', { mes: 'septiembre', fecha: '2026-09-10' })]),
  planRescate_v2_usos: JSON.stringify([{ id: 'r1', provisionId: 'p1', importe: 60, fecha: '2026-09-15', motivo: 'Rescate 1', tipo: 'temporal' }]),
  planRescate_v2_provisiones: JSON.stringify([{ id: 'p1', nombre: 'Hucha', importeMensual: 50, aportaciones: { septiembre: [], octubre: [] } }]),
  [U + 'movimientos']: JSON.stringify([m('a1'), m('a2', { mes: 'septiembre', fecha: '2026-09-10' }), m('n1')]),
  [U + 'usos']: JSON.stringify([{ id: 'r1', provisionId: 'p1', importe: 60, fecha: '2026-09-15', motivo: 'Rescate 1', tipo: 'temporal' }, { id: 'r2', provisionId: 'p1', importe: 25, fecha: '2026-10-02', motivo: 'Rescate 2', tipo: 'temporal' }])
};
(async () => {
  const b = await chromium.launch(); const page = await (await b.newContext()).newPage();
  await page.clock.install({ time: new Date('2026-10-03T10:00:00') });
  await page.route(/^https?:/, r => r.abort());
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  let dialogs = []; page.on('dialog', d => { dialogs.push(d.message()); (global.__resp ? d.accept() : d.dismiss()); });
  await page.addInitScript(s => { if (!sessionStorage.getItem('__s')) { localStorage.clear(); Object.keys(s).forEach(k => localStorage.setItem(k, s[k])); sessionStorage.setItem('__s', '1'); } }, seed);
  const esperar = async n => { for (let t = 0; t < n; t++) { await page.clock.runFor(400); await page.waitForTimeout(30); } };
  const cierre = () => page.evaluate(() => { const o = document.getElementById('modalOverlay'); return !!(o && o.classList.contains('open') && /Cierre de/.test(o.textContent)); });
  await page.goto('file://' + FILE); await esperar(70);
  const a = await page.evaluate(() => ({ mov: movimientos.map(x => x.id).sort(), usos: usosProvisiones.map(x => x.id).sort(), leg: Almacen.esLegacy }));
  /* la oferta de bloqueo (Face ID) tapa la app la 1ª vez: el cierre espera a que se cierre */
  await page.evaluate(() => { const x = document.getElementById('bloqueo'); if (x) x.style.display = 'none'; }); await esperar(8);
  const c1 = await cierre();
  try { await page.evaluate(() => closeModal()); } catch (e) { }
  await page.reload(); await esperar(30); await page.evaluate(() => { const x = document.getElementById('bloqueo'); if (x) x.style.display = 'none'; }); await esperar(20);
  const c2 = await cierre();
  // veto banco
  const veto = await page.evaluate(() => {
    FluxiaGVBorrados.registrar({ id: 'g1', bancoRef: 'B1', fecha: '2026-10-02', importe: 33.5, concepto: 'AMAZON', banco: 'Revolut', origen: 'banco' });
    FluxiaGVBorrados.registrar({ id: 'man1', fecha: '2026-10-02', importe: 44, concepto: 'Cena', origen: 'manual' });
    return {
      mismoRef: FluxiaGVBorrados.debeIgnorarBanco({ id: 'B1', fecha: '2026-10-02', importe: 33.5, concepto: 'AMAZON' }, 'Revolut'),
      reetiquetado: FluxiaGVBorrados.debeIgnorarBanco({ id: 'B1x', fecha: '2026-10-02', importe: 33.5, concepto: 'AMZN MKTP' }, 'Revolut'),
      bancoMismoDiaQueManual: FluxiaGVBorrados.debeIgnorarBanco({ id: 'B9', fecha: '2026-10-02', importe: 44, concepto: 'MERCADONA' }, 'CaixaBank'),
      manualPorId: FluxiaGVBorrados.debeIgnorarBanco({ id: 'man1', fecha: '2026-10-02', importe: 44, concepto: 'Cena' }, '')
    };
  });
  // Quitar recuperado: cancelar → no cambia; aceptar las dos → se quita
  const ix = await page.evaluate(() => JSON.parse(localStorage.getItem('fluxia_v63_informe_usr-legacy')).anadidos.findIndex(x => x.item.id === 'n1'));
  await page.evaluate(() => FluxiaRecV63.verInforme());
  global.__resp = false; dialogs = [];
  await page.click('[data-rec63-quitar="' + ix + '"]'); await esperar(2);
  const trasCancel = await page.evaluate(() => movimientos.some(x => x.id === 'n1'));
  const dlgCancel = dialogs.length;
  global.__resp = true; dialogs = [];
  await page.click('[data-rec63-quitar="' + ix + '"]'); await esperar(2);
  const trasOk = await page.evaluate(() => ({ esta: movimientos.some(x => x.id === 'n1'), vet: FluxiaGVBorrados.debeIgnorarBanco({ id: 'n1' }, '') }));
  const dlgOk = dialogs.length;
  // Sin cuenta en perfil legacy: NO borra el plan crudo
  const sc = await page.evaluate(() => { resetearTodoParaSinCuenta(); return JSON.parse(localStorage.getItem('planRescate_v2_movimientos') || '[]').length; });
  await b.close();
  let ok = 0, ko = 0; const ck = (n, c, d) => { if (c) { ok++; console.log('✅', n); } else { ko++; console.log('❌', n, JSON.stringify(d)); } };
  ck('Dueño legacy: gastos a1 a2 + n1 (v94.62)', JSON.stringify(a.mov) === '["a1","a2","n1"]' && a.leg, a);
  ck('Dueño legacy: rescates r1 + r2', JSON.stringify(a.usos) === '["r1","r2"]', a);
  ck('Cierre de septiembre sale la PRIMERA vez (no estaba hecho)', c1);
  ck('Cierre NO vuelve a salir al reabrir', !c2);
  ck('Veto banco por bancoRef sigue funcionando', veto.mismoRef, veto);
  ck('Veto banco reetiquetado (mismo día+importe+banco) sigue funcionando', veto.reetiquetado, veto);
  ck('Borrar gasto MANUAL ya no veta cargos del banco del mismo día/importe', !veto.bancoMismoDiaQueManual, veto);
  ck('Gasto manual borrado sí queda vetado por su id', veto.manualPorId, veto);
  ck('Quitar: cancelar → no se toca nada', trasCancel && dlgCancel === 1, { trasCancel, dlgCancel });
  ck('Quitar: dos confirmaciones → quitado y vetado', !trasOk.esta && trasOk.vet && dlgOk === 2, { trasOk, dlgOk });
  ck('Sin cuenta en perfil legacy NO borra el plan guardado', sc >= 2, sc);
  ck('Sin errores JS', !errs.length, errs.slice(0, 3));
  console.log(`\n${ok}/${ok + ko}`); process.exit(ko ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });

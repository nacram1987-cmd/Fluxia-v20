'use strict';
// v97.77 (LAB): prueba de extremo a extremo con la página completa. La pantalla «Reglas de clasificación» lista las reglas reales,
// permite limitar la de Ana María a «solo entradas» y el cambio se refleja en la decisión sobre el pago de 19,40 €.
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const req = require('node:module').createRequire(path.join(root, 'auditorias/qa-v97.66/package.json'));
const { JSDOM, VirtualConsole } = req('jsdom');
const { indexedDB, IDBKeyRange } = req('fake-indexeddb');
const html = fs.readFileSync(path.join(root, 'lab/v97.77.html'), 'utf8');
const KEY = html.match(/const CLS_KEY="([^"]+)"/)[1];
const REGLAS = [{ t: ['automocon', 'aljarafe'], tipo: 'real', dir: 'out', ts: 1792072855310 }, { t: ['amortizacion', 'cuenta'], tipo: 'propio', dir: '*', ts: 1791054251809 },
  { t: ['jose', 'ignacio', 'ramos', 'ramirez'], tipo: 'puente', dir: '*', ts: 1791130518460 }, { t: ['ana', 'maria', 'sanchez'], tipo: 'puente', dir: '*', ts: 1791130515045 },
  { t: ['enrique', 'javier', 'sanchez', 'can'], tipo: 'puente', dir: '*', ts: 1791297789552 }];
const errores = [], vc = new VirtualConsole(); vc.on('jsdomError', (e) => errores.push(e.message));
const dom = new JSDOM(html, { url: 'https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.77.html', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
  beforeParse(w) { w.indexedDB = indexedDB; w.IDBKeyRange = IDBKeyRange; w.fetch = async () => { throw new Error('offline'); }; w.localStorage.setItem(KEY, JSON.stringify(REGLAS)); w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} })); } });
const w = dom.window;
setTimeout(() => {
  try {
    assert(w.FluxiaClsReglas9777, 'la pantalla nueva se carga');
    const pago = { concepto: 'Anduriña', contraparte: 'Ana María❤️', importe: -19.4 };
    assert.equal(w.FluxiaCls.regla(pago,'out'), 'puente', 'antes: el pago se descarta como puente');
    w.FluxiaClsReglas9777.abrir();
    const modal = w.document.getElementById('fxClsRulesModal');
    assert(modal && modal.classList.contains('on'), 'el modal se abre');
    const items = [...modal.querySelectorAll('.fx-rule-item')];
    assert.equal(items.length, 5, 'lista las 5 reglas reales');
    const ana = items.find((x) => /Ana Maria Sanchez/.test(x.textContent));
    assert(ana && /Puente/.test(ana.textContent) && /entradas y salidas/.test(ana.textContent), 'Ana María: puente en ambas direcciones');
    ana.querySelector('[data-fxcls-dir="in"]').click();
    assert.equal(w.FluxiaCls.regla(pago,'out'), null, 'después: el pago de 19,40 € ya no es puente');
    assert.equal(w.FluxiaCls.regla(pago,'in'), 'puente', 'las entradas de Ana María siguen siendo puente');
    const tras = [...w.document.getElementById('fxClsRulesModal').querySelectorAll('.fx-rule-item')];
    assert.equal(tras.length, 5, 'sigue habiendo 5 reglas efectivas (la nueva sustituye a la antigua)');
    assert(/solo entradas/.test(tras.find((x) => /Ana Maria Sanchez/.test(x.textContent)).textContent));
    // quitar una regla
    const enr = tras.find((x) => /Enrique Javier/.test(x.textContent)); enr.querySelector('[data-fxcls-quitar]').click();
    assert.equal(w.document.querySelectorAll('#fxClsRulesModal .fx-rule-item').length, 4, 'quitar elimina la regla de la lista');
    assert.equal(w.FluxiaCls.regla({contraparte:'Enrique Javier Sánchez Can'},'out'), null);
    // se guarda en el mismo almacén de siempre, sin borrar nada (compatible con la fusión móvil↔nube)
    const guardado = JSON.parse(w.localStorage.getItem(KEY));
    assert.equal(guardado.length, REGLAS.length + 2, 'las reglas antiguas se conservan; se añaden dos nuevas');
    assert(guardado.slice(0, 2).every((r) => r.sup === true));
    const graves = errores.filter((m) => !/Not implemented|navigation|XMLHttpRequest|offline|getContext|scrollTo|canvas|matchMedia|ResizeObserver|IntersectionObserver/i.test(m));
    assert.equal(graves.length, 0, 'sin errores de JavaScript: ' + graves.slice(0, 3).join(' | '));
    console.log('PASS v97.77 (página completa): pantalla de reglas, limitar a «solo entradas», quitar y compatibilidad de datos');
    process.exit(0);
  } catch (e) { console.error('FAIL', e.message); console.error(errores.slice(0, 4)); process.exit(1); }
}, 2500);

'use strict';
// Fase 1 de reglas por usuario: lógica genérica, sin nombres ni importes personales. Dos usuarios ficticios, sin cruces.
const assert = require('node:assert/strict');
const rules = require('./load-umd.cjs')('../js/fluxia-elite-bank-rules-v1.js');

// 1. una decisión sobre un cargo se convierte en regla con la dirección del importe
let r = rules.ruleFromDecision({ concepto: 'Recibo Tarjeta XYZ 1234', decision: 'propio', importeCents: -47100, ts: 100 });
assert.equal(r.ok, true);
assert.deepEqual(r.rule.t, ['recibo', 'tarjeta', 'xyz']);
assert.equal(r.rule.dir, 'out');
assert.equal(r.rule.tipo, 'propio');

// 2. concepto sin palabras útiles o importe cero: no se crea regla
assert.equal(rules.ruleFromDecision({ concepto: '1234 5678', decision: 'propio', importeCents: -100 }).ok, false);
assert.equal(rules.ruleFromDecision({ concepto: 'Algo', decision: 'propio', importeCents: 0 }).ok, false);
assert.equal(rules.ruleFromDecision({ concepto: 'Algo', decision: 'inventada', importeCents: -100 }).ok, false);

// 3. cuentas: roles válidos y día de cobro obligatorio en tarjetas
assert.equal(rules.validateAccount({ rol: 'corriente' }).ok, true);
assert.equal(rules.validateAccount({ rol: 'tarjeta', diaCobroRecibo: 1 }).ok, true);
assert.equal(rules.validateAccount({ rol: 'tarjeta' }).ok, false, 'una tarjeta necesita su día de cobro');
assert.equal(rules.validateAccount({ rol: 'tarjeta', diaCobroRecibo: 32 }).ok, false);
assert.equal(rules.validateAccount({ rol: 'otra' }).ok, false);

// 4. una regla nueva sustituye a la igual y no borra las demás
const base = [{ t: ['alfa'], tipo: 'propio', dir: '*', ts: 1 }];
const merged = rules.mergeRules(base, { t: ['alfa'], tipo: 'olvidar', dir: '*', ts: 5, sup: true });
assert.equal(merged.length, 1);
assert.equal(merged[0].tipo, 'olvidar');
assert.equal(rules.mergeRules(base, { t: ['beta'], tipo: 'real', dir: 'out', ts: 2 }).length, 2);

// 5. dos usuarios distintos: cada uno con sus reglas, sin mezcla
const userA = rules.mergeRules([], rules.ruleFromDecision({ concepto: 'Cuota Alfa', decision: 'puente', importeCents: 5000, ts: 1 }).rule);
const userB = rules.mergeRules([], rules.ruleFromDecision({ concepto: 'Cuota Beta', decision: 'real', importeCents: -5000, ts: 1 }).rule);
assert.deepEqual(userA.map((x) => x.t), [['cuota', 'alfa']]);
assert.deepEqual(userB.map((x) => x.t), [['cuota', 'beta']]);

console.log('PASS fase 1 reglas por usuario: decisiones a reglas, cuentas con función, sustitución y aislamiento entre usuarios');

// Vinculación automática (fase 1b): importes exactos, parecidos, variables y casos de no pagar dos veces.
const cents = (x) => Math.round(x * 100);
const fijos = [
  { id: 'f-leroy', nombre: 'Compra mensual', importeCents: cents(58.27), pagado: false },
  { id: 'f-seguro', nombre: 'Seguro', importeCents: cents(19.99), pagado: false },
  { id: 'f-tel', nombre: 'Telefono', importeCents: cents(50), pagado: false, variable: true },
];
// exacto y único: entra solo
let s1 = rules.suggestFixedLink({ importeCents: -cents(58.27) }, fijos);
assert.equal(s1.action, 'auto');
assert.equal(s1.fijoId, 'f-leroy');
// 20 € frente a 19,99 €: parecido, se pregunta, nunca se vincula solo
let s2 = rules.suggestFixedLink({ importeCents: -cents(20) }, fijos);
assert.equal(s2.action, 'ask');
assert.equal(s2.reason, 'IMPORTE_PARECIDO');
// fijo de importe variable: dentro del margen se pregunta aunque no sea exacto
let s3 = rules.suggestFixedLink({ importeCents: -cents(53.5) }, fijos);
assert.equal(s3.action, 'ask');
assert.equal(s3.options[0].id, 'f-tel');
// fuera del margen de un fijo variable: nada
assert.equal(rules.suggestFixedLink({ importeCents: -cents(90) }, fijos).action, 'none');
// dos fijos con el mismo importe: se pregunta, no se elige
const dup = [{ id: 'a', importeCents: cents(12), pagado: false }, { id: 'b', importeCents: cents(12), pagado: false }];
assert.equal(rules.suggestFixedLink({ importeCents: -cents(12) }, dup).action, 'ask');
// un fijo ya pagado no se vuelve a pagar
assert.equal(rules.suggestFixedLink({ importeCents: -cents(58.27) }, [{ id: 'x', importeCents: cents(58.27), pagado: true }]).action, 'none');
// traspasos y cargos ya ligados nunca se vinculan
assert.equal(rules.suggestFixedLink({ importeCents: -cents(58.27), tipo: 'traspaso' }, fijos).action, 'none');
assert.equal(rules.suggestFixedLink({ importeCents: -cents(58.27), yaLigado: true }, fijos).action, 'none');
// el margen lo fija el usuario
assert.equal(rules.suggestFixedLink({ importeCents: -cents(90) }, fijos, { variableMarginPct: 80 }).action, 'ask');

console.log('PASS vinculación: exacto único automático; parecido, variable, duplicado y pagado nunca automáticos sin confirmación');

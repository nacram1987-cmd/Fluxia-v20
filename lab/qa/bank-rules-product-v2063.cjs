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

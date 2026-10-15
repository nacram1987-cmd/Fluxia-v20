'use strict';
const assert=require('node:assert/strict');
const {hucha}=require('../js/fluxia-elite-financial-engine-v1.js');
// Screenshot of operational HTML dated 2026-10-15: Tributos historical entries.
// The HTML labels withdrawals as "faltan", i.e. temporary withdrawals outstanding.
const tributos={
 contributions:[130.16,130.16,130.16],
 uses:[
  {tipo:'temporal',importe:240.48,repuesto:0,fecha:'2026-09-01'},
  {tipo:'temporal',importe:150,repuesto:0,fecha:'2026-10-15',destino:'Revolut'}
 ]
};
const result=hucha(tributos);
assert.equal(result.ok,true);
assert.equal(result.contributionsCents,39048n);
assert.equal(result.temporaryCents,39048n);
assert.equal(result.outstandingCents,39048n);
assert.equal(result.availableCents,0n);
// The 150-euro withdrawal is NOT a new income or a variable expense.
// Distinct IDs from legacy revisions must never be added to the operational ledger.
console.log('PASS: operational HTML Tributos balance 0 cents with 39048 outstanding, no duplicate historical uses');

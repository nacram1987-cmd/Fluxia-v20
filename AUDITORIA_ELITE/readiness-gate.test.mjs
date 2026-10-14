import test from 'node:test';
import assert from 'node:assert/strict';
import {assessReadiness} from './readiness-gate.mjs';
const modules=['authentication','dashboard','variables','fixed','provisions','income','shared','financing','banks','notifications','cash','payments','budgets','simulator','analytics','pwa','security','performance'];
test('parity alone cannot certify missing modules',()=>{const r=assessReadiness({certified:true},{});assert.equal(r.ready,false);assert.equal(r.incomplete.length,modules.length)});
test('failed parity blocks even with full coverage',()=>{const r=assessReadiness({certified:false},Object.fromEntries(modules.map(k=>[k,true])));assert.deepEqual(r.blockers,['MOVEMENT_OR_LEDGER_PARITY'])});
test('full parity and coverage is required',()=>assert.equal(assessReadiness({certified:true},Object.fromEntries(modules.map(k=>[k,true]))).ready,true));

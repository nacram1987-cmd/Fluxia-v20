import test from 'node:test';
import assert from 'node:assert/strict';
import {compareSnapshots} from './compare-snapshots.mjs';
const row = (id, amount=750) => ({canonical_id:id,amount_cents:amount,concept:'Gasolinera',category:'Tabaco',status:'active'});
const snap = (movements, ledger={}) => ({user_id:'test-user',profile_id:'test-profile',accounting_month:'2026-10',cutoff:'2026-10-14T12:00:00+02:00',movements,ledger:{income_cents:0,variable_cents:0,fixed_paid_cents:0,provisions_cents:0,shared_cents:0,available_cents:0,...ledger}});
test('identical snapshots certify',()=>assert.equal(compareSnapshots(snap([row('a')]),snap([row('a')])).certified,true));
test('same amount different IDs are not deduplicated',()=>{const r=compareSnapshots(snap([row('a'),row('b')]),snap([row('a')]));assert.deepEqual(r.missing_from_elite,['b']);assert.equal(r.certified,false)});
test('same ID different category fails',()=>{const r=compareSnapshots(snap([row('a')]),snap([{...row('a'),category:'Gasolina'}]));assert.deepEqual(r.same_id_value_mismatch[0].fields,['category'])});
test('ledger cent mismatch fails',()=>{const r=compareSnapshots(snap([]),snap([],{available_cents:1}));assert.equal(r.month_ledger_delta_cents.available_cents,1);assert.equal(r.certified,false)});
test('different profile is blocked',()=>assert.throws(()=>compareSnapshots(snap([]),{...snap([]),profile_id:'other'}),/SCOPE_MISMATCH/));
test('missing ledger blocks certification',()=>assert.equal(compareSnapshots(snap([]),{...snap([]),ledger:{}}).certified,false));
test('duplicate canonical IDs blocked',()=>assert.throws(()=>compareSnapshots(snap([row('a'),row('a')]),snap([])),/duplicate canonical_id/));

test('row from another user blocked',()=>assert.throws(()=>compareSnapshots(snap([{...row('a'),user_id:'intruder'}]),snap([row('a')])),/ROW_SCOPE_MISMATCH/));
test('row from another month blocked',()=>assert.throws(()=>compareSnapshots(snap([{...row('a'),accounting_month:'2026-09'}]),snap([row('a')])),/ROW_SCOPE_MISMATCH/));
test('missing field differs from null',()=>{const r=compareSnapshots(snap([row('a')]),snap([{...row('a'),fixed_link:null}]));assert.deepEqual(r.same_id_value_mismatch[0].fields,['fixed_link'])});
test('unsafe cents rejected',()=>assert.throws(()=>compareSnapshots(snap([row('a',Number.MAX_SAFE_INTEGER+1)]),snap([])),/invalid row/));

test('empty matching snapshots cannot certify production parity',()=>{const r=compareSnapshots(snap([]),snap([]));assert.equal(r.certified,false);assert.equal(r.nonemptyOperationalEvidence,false)});

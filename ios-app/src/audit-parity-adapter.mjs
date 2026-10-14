import {validateSnapshot} from './readonly-finance.mjs';

// Adapter between authenticated native read-only snapshot and the audit gate.
// Totals-only snapshots are NEVER accepted as movement-level parity evidence.
export function buildEliteAuditEnvelope({payload,authenticatedUserId,profileId,cutoff,canonicalMovements}) {
  const validated=validateSnapshot(payload,authenticatedUserId);
  if(typeof profileId!=='string'||!profileId.trim())throw Error('Missing profile');
  if(typeof cutoff!=='string'||!/^\d{4}-\d\d-\d\dT/.test(cutoff)||!Number.isFinite(Date.parse(cutoff))||!/(Z|[+-]\d\d:\d\d)$/.test(cutoff))throw Error('Invalid cutoff');
  if(!Array.isArray(canonicalMovements))throw Error('Canonical movement export required');
  const required=['canonical_id','amount_cents','accounting_month','user_id','profile_id'];
  const ids=new Set();
  const movements=canonicalMovements.map(m=>{
    if(!m||required.some(k=>m[k]===undefined||m[k]===null))throw Error('Incomplete canonical movement');
    if(m.user_id!==authenticatedUserId||m.profile_id!==profileId||m.accounting_month!==validated.month)throw Error('Cross-scope movement blocked');
    if(typeof m.canonical_id!=='string'||!m.canonical_id.trim()||ids.has(m.canonical_id)||!Number.isSafeInteger(m.amount_cents))throw Error('Invalid canonical identity or cents');
    ids.add(m.canonical_id);
    return Object.freeze({...m});
  });
  // Existing native snapshot lacks paid fixed, shared and ledger semantics.
  // Deliberately use null instead of manufacturing values from totals.
  return Object.freeze({
    user_id:authenticatedUserId,profile_id:profileId,accounting_month:validated.month,cutoff,
    movements:Object.freeze(movements),
    ledger:Object.freeze({
      income_cents:validated.totals.income,
      variable_cents:validated.totals.variable,
      fixed_paid_cents:null,
      provisions_cents:validated.totals.provisions,
      shared_cents:null,
      available_cents:validated.totals.available
    }),
    parity_status:'BLOCKED_INCOMPLETE_LEDGER',
    source:validated.source
  });
}

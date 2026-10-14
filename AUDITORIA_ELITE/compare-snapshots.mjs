// Fluxia Élite — auditoría de paridad en modo SOLO LECTURA.
// Entradas: snapshots autorizados del MISMO perfil, mes y corte.
// No deduplica por texto/importe ni altera la nube.
export function compareSnapshots(html, elite) {
  const required = ['user_id','profile_id','accounting_month','cutoff'];
  for (const key of required) {
    if (!html?.[key] || !elite?.[key] || html[key] !== elite[key])
      throw new Error('SNAPSHOT_SCOPE_MISMATCH: ' + key);
  }
  const fields = ['user_id','profile_id','bank_identity','booking_date','operation_date','accounting_month','amount_cents','concept','category','origin','status','fixed_link','excluded','archived','tombstone_version'];
  const index = (snapshot, label) => {
    if (!Array.isArray(snapshot.movements)) throw new Error(label + ': movements missing');
    const m = new Map();
    for (const row of snapshot.movements) {
      if (!row || typeof row.canonical_id !== 'string' || !row.canonical_id.trim() || !Number.isSafeInteger(row.amount_cents)) throw new Error(label + ': invalid row');
      for (const key of ['user_id','profile_id','accounting_month']) {
        if (row[key] != null && row[key] !== snapshot[key]) throw new Error(label + ': ROW_SCOPE_MISMATCH ' + key);
      }
      if (m.has(row.canonical_id)) throw new Error(label + ': duplicate canonical_id ' + row.canonical_id);
      m.set(row.canonical_id, row);
    }
    return m;
  };
  const a = index(html, 'HTML'), b = index(elite, 'ELITE');
  const missing_from_elite = [], unexpected_in_elite = [], same_id_value_mismatch = [];
  for (const [id, original] of a) {
    if (!b.has(id)) { missing_from_elite.push(id); continue; }
    const current = b.get(id);
    const differences = fields.filter(f => original[f] !== current[f]);
    if (differences.length) same_id_value_mismatch.push({canonical_id:id, fields:differences});
  }
  for (const id of b.keys()) if (!a.has(id)) unexpected_in_elite.push(id);
  const bank_identity_collisions = [];
  for (const [label, m] of [['HTML',a],['ELITE',b]]) {
    const identities = new Map();
    for (const row of m.values()) {
      if (!row.bank_identity) continue;
      if (identities.has(row.bank_identity) && identities.get(row.bank_identity) !== row.canonical_id)
        bank_identity_collisions.push({source:label, bank_identity:row.bank_identity, ids:[identities.get(row.bank_identity),row.canonical_id]});
      else identities.set(row.bank_identity,row.canonical_id);
    }
  }
  const ledgerKeys = ['income_cents','variable_cents','fixed_paid_cents','provisions_cents','shared_cents','available_cents'];
  const month_ledger_delta_cents = {};
  for (const key of ledgerKeys) {
    const x=html.ledger?.[key], y=elite.ledger?.[key];
    month_ledger_delta_cents[key] = Number.isSafeInteger(x)&&Number.isSafeInteger(y) ? y-x : null;
  }
  const nonemptyOperationalEvidence = a.size > 0 && b.size > 0;
  const certified = nonemptyOperationalEvidence && !missing_from_elite.length && !unexpected_in_elite.length &&
    !same_id_value_mismatch.length && !bank_identity_collisions.length &&
    Object.values(month_ledger_delta_cents).every(v=>v===0);
  return {certified, nonemptyOperationalEvidence, missing_from_elite, unexpected_in_elite, same_id_value_mismatch,
    bank_identity_collisions, month_ledger_delta_cents,
    html_count:a.size, elite_count:b.size, scope:{profile_id:html.profile_id, accounting_month:html.accounting_month, cutoff:html.cutoff}};
}

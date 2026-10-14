// Strict readiness gate: a matching subset is not full financial certification.
export function assessReadiness(comparison, coverage) {
  const required = ['authentication','dashboard','variables','fixed','provisions','income','shared','financing','banks','notifications','cash','payments','budgets','simulator','analytics','pwa','security','performance'];
  const incomplete = required.filter(k=>coverage?.[k] !== true);
  const blockers = [];
  if (comparison?.certified !== true) blockers.push('MOVEMENT_OR_LEDGER_PARITY');
  if (incomplete.length) blockers.push('INCOMPLETE_MODULE_COVERAGE');
  return {ready: blockers.length===0, blockers, incomplete};
}

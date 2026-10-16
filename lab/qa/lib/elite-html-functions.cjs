'use strict';
// Carga las funciones REALES del HTML de Élite (no copias) en un contexto aislado de vm.
// Lo usan la suite v2.0.25 y la herramienta privada de conciliación: una sola fórmula, un solo sitio.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const loadUmd = require('../load-umd.cjs');

const DEFAULT_HTML = path.join(__dirname, '../../fluxia-elite-safari-datos-reales.html');

function between(html, start, end) {
  const a = html.indexOf(start);
  const b = html.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error('Sección no encontrada en el HTML: ' + start);
  return html.slice(a, b);
}
function line(html, start) {
  const a = html.indexOf(start);
  if (a < 0) throw new Error('Línea no encontrada en el HTML: ' + start);
  return html.slice(a, html.indexOf('\n', a));
}

const MODS = [
  { id: 'inicio', title: 'Inicio' },
  { id: 'ingresos', title: 'Ingresos', key: 'planRescate_v2_ingresos' },
  { id: 'fijos', title: 'Fijos', key: 'planRescate_v2_fijos' },
  { id: 'variables', title: 'Variables', key: 'planRescate_v2_movimientos' },
  { id: 'huchas', title: 'Huchas', key: 'planRescate_v2_provisiones' },
  { id: 'compartidos', title: 'Compartidos', key: 'planRescate_v2_compartidos' },
  { id: 'financiaciones', title: 'Financiaciones', key: 'planRescate_v2_financiaciones' },
];

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
    _map: map,
  };
}

function loadEliteFunctions(overrides = {}, htmlPath = DEFAULT_HTML) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const reconciliation = loadUmd('../js/fluxia-elite-reconciliation-v1.js');
  const financialEngine = loadUmd('../js/fluxia-elite-financial-engine-v1.js');
  const bankAdapter = loadUmd('../js/fluxia-elite-bank-adapter-v1.js');
  const bankConnector = loadUmd('../js/fluxia-elite-bank-connector-v1.js');
  const storage = overrides.localStorage || memoryStorage();
  const context = {
    console, Intl, BigInt, Date, Math, JSON, Map, Set, Array, Object, String, Number, Promise,
    mods: MODS, selectedMonth: '2026-10', owner: 'owner-a', activeProfile: 'p_usr-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa__',
    items: {}, extraFinance: {}, backupFinance: null, cloudFinanceSnapshot: null, remotePreflightResult: null, cloudReadAt: '',
    sourceUpdated: {}, localStorage: storage,
    window: { FluxiaEliteReconciliation: reconciliation, FluxiaEliteFinancialEngine: financialEngine, FluxiaEliteBankAdapter: bankAdapter, FluxiaEliteBankConnector: bankConnector },
    canon: (m) => { const a = context.items[m.key]; return Array.isArray(a) ? a : null; },
    money: (v) => (typeof v === 'number' && isFinite(v) ? v.toFixed(2) + ' €' : null),
    ...overrides,
  };
  context.localStorage = storage;
  const sources = [
    line(html, 'const field='),
    line(html, 'const MONTHS='),
    between(html, 'const actualChargeDate=obj=>', '\nconst chargeMeta='),
    between(html, 'function recordMonth(obj){', '\nfunction isFixedLinkedMovement('),
    between(html, 'function temporaryUseOutstanding(use){', '\nfunction reconstructedHuchaLedger('),
    between(html, 'function exactHuchaUsageLink(usage,huchas){', '\nfunction canonicalMovementId('),
    between(html, 'function huchaMonthlyContributions(hucha){', '\n// Misma precedencia de iconoProvision'),
    between(html, 'function huchaContributionSnapshot(hucha,period){', '\nfunction huchaFinancialSnapshot('),
    between(html, 'function huchaFinancialSnapshot(hucha,period,uses,allHuchas){', '\nfunction appendHuchaFinancialSummary('),
    between(html, 'function availableCertificationReport(){', '\nfunction renderAvailableCertification('),
    between(html, 'const recordAmount=obj=>{', '\nconst datedRows='),
    between(html, 'function validatePrivateBackup(backup,profile){', '\nfunction latestWalletMovementDate('),
  ];
  vm.createContext(context);
  const expose = ';globalThis.__api={availableComputeFrom,availableCalculationReport,availableCertificationReport,buildCertificationEvidence,htmlSnapshotState,availableAccountingMonth,availableVariableDisposition,huchaFinancialSnapshot,MONTHS,monthStatus,reconStorageSignature,validatePrivateBackup,readBackupFinancialModules,readPrivateBackupSources};';
  vm.runInContext(sources.join('\n') + expose, context, { filename: 'elite-html-functions' });
  return { html, context, api: context.__api, reconciliation, financialEngine, bankAdapter, bankConnector, storage, between, line };
}

module.exports = { loadEliteFunctions, memoryStorage, MODS, between, line, DEFAULT_HTML };

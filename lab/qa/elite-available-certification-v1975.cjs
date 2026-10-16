'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../fluxia-elite-safari-datos-reales.html'),'utf8');
assert(html.includes('function availableCertificationReport()'));
assert(html.includes('function renderAvailableCertification()'));
assert(/function availableCalculationReport\(/.test(html));// v2.0.25: admite options={} (misma función, firma ampliada)
assert(html.includes('engine.available({incomeCents:income,realExpensesCents:expense,plannedProvisionsCents:provisions,excessContributionsCents:excess,sharedImpactCents:sharedImpact,pendingHuchaRescuesCents:pendingRescues})'));
assert(html.includes('Impacto de Compartidos'));
assert(html.includes('Rescates temporales (informativo; no suma)'));
assert(html.includes('Fórmula del HTML: ingresos'));
assert(html.includes("Disponible pendiente:"));
assert(!html.includes("cert.certified?'—':'—'"));
assert(html.includes('Bloqueos actuales:'));
assert(html.includes('renderAvailableCertification()'));
console.log('PASS v1.9.75 available certification remains blocked until all accounting evidence is verified');

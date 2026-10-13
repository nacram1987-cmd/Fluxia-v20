import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url).pathname;
const webFile = join(root, 'www/index.html');
const approvalFile = join(root, 'audited-bundle.json');
if (!existsSync(webFile) || !existsSync(approvalFile)) {
  throw new Error('iOS release blocked: audited web bundle and approval manifest required');
}
const html = readFileSync(webFile);
const manifest = JSON.parse(readFileSync(approvalFile, 'utf8'));
const actual = createHash('sha256').update(html).digest('hex');
if (!/^[a-f0-9]{64}$/.test(manifest.sha256 ?? '') || actual !== manifest.sha256) {
  throw new Error('iOS release blocked: web bundle checksum mismatch');
}
if (manifest.financialQA !== 'passed' || manifest.securityQA !== 'passed' || manifest.performanceQA !== 'passed') {
  throw new Error('iOS release blocked: financial, security and performance QA required');
}
if (!manifest.sourceCommit || !manifest.auditor || !manifest.auditReport) {
  throw new Error('iOS release blocked: missing source and audit traceability');
}
console.log('Bundle SHA256 verified:', actual);
console.log('Audit record:', manifest.auditReport);
console.log('Reminder: manifest records approval; device QA must still be verified separately.');

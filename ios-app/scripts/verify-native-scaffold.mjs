import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const cfg = readFileSync(resolve(root, 'capacitor.config.ts'), 'utf8');
const policy = readFileSync(resolve(root, 'VERSIONADO_APP.md'), 'utf8');
assert.match(cfg, /appId:\s*'com\.fluxia\.elite\.beta'/);
assert.match(cfg, /appName:\s*'Fluxia BETA'/);
assert.match(cfg, /webDir:\s*'www'/);
assert.ok(pkg.dependencies['@capacitor/ios']);
assert.ok(pkg.dependencies['@capacitor/core']);
assert.match(policy, /99\.9/);
assert.ok(existsSync(resolve(root, 'scripts/verify-web-bundle.mjs')));
console.log('OK: Capacitor iOS scaffold and independent version policy verified.');
console.log('NOT VERIFIED: native Xcode build, real login, banks, financial QA or TestFlight.');

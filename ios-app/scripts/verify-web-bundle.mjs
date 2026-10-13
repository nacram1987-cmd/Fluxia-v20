import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url).pathname;
const path = join(root, 'www/index.html');
if (!existsSync(path)) throw new Error('Missing bundled index.html');
const html = readFileSync(path, 'utf8');
if (!html.includes('FLUXIA_IOS_AUDITED_BUNDLE')) {
  throw new Error('Unverified iOS web bundle: replace placeholder only after financial, security and performance QA');
}
const sha = createHash('sha256').update(html).digest('hex');
console.log('Audited bundle marker found; SHA256:', sha);
console.log('IMPORTANT: marker is a gate, not proof of financial or iOS QA.');

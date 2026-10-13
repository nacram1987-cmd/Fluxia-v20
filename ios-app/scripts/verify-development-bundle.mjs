import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const html=readFileSync(resolve(root,'www/index.html'),'utf8');
for(const marker of ['native-development-only','synthetic-no-banking','App LAB 1.5'])if(!html.includes(marker))throw Error('Development bundle is not a safe synthetic LAB 1.5 bundle: '+marker);
if(/<script[^>]+src=["']https?:\/\//i.test(html))throw Error('Remote script prohibited in native development bundle');
console.log('LAB 1.5: synthetic development bundle validated. NOT audited for real finances, login or banking.');

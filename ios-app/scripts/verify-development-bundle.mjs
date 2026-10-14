import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const html=readFileSync(resolve(root,'www/index.html'),'utf8');
for(const marker of ['native-and-web-preview-lab-1.6','synthetic-no-banking','Vista previa LAB 1.6','DATOS FICTICIOS','cloudSignInButton','cloudReadButton','fluxiaEliteSessionProvider']){
  if(!html.includes(marker))throw Error('Unsafe or outdated LAB 1.6 bundle: '+marker);
}
if(/<script[^>]+src=["']https?:\/\//i.test(html))throw Error('Remote script prohibited in native development bundle');
console.log('LAB 1.6: synthetic display and authenticated read-only entry points detected; no real finance parity or banking certified.');

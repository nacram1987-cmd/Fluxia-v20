import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const html=readFileSync(resolve(root,'www/index.html'),'utf8');
for(const marker of ['native-and-web-preview-lab-1.6','synthetic-no-banking','Vista previa LAB 1.6','DATOS FICTICIOS','No introduzcas credenciales']){
  if(!html.includes(marker))throw Error('Unsafe or outdated LAB 1.6 bundle: '+marker);
}
if(/<script[^>]+src=["']https?:\/\//i.test(html))throw Error('Remote script prohibited in native development bundle');
console.log('LAB 1.6: synthetic development bundle validated. NOT audited for real finances, login or banking.');

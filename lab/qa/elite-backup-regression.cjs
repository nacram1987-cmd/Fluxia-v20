'use strict';
// Checks for private, same-profile cash preview. No files uploaded or cloud writes.
const assert=require('node:assert/strict');
const api=require('../js/fluxia-elite-backup-v1.js');
const id='usr-4da6c558-634d-4ae8-8a36-6d3be0e2fd39';
const other='usr-5da6c558-634d-4ae8-8a36-6d3be0e2fd39';
const key='fluxia_user_'+id+'__v2_efectivo';
const doc={
 v:'fluxia-perfil-v1',when:'2026-10-14T14:00:00.000Z',profile:{id},
 prefix:'v2_u_'+id+'_',
 keys:{[key]:JSON.stringify({saldo:44.20,movimientos:[{id:'e1',tipo:'entrada',importe:44.2,fecha:'2026-10-14'}]})},
 credentials:'never display this',bankSession:'do not include'
};
let n=0;function run(name,fn){fn();console.log('PASS',++n,name)}
run('valid same-profile wallet imported',()=>assert.equal(api.inspect(JSON.stringify(doc),id).wallet.saldo,44.2));
run('keeps export timestamp',()=>assert.equal(api.inspect(JSON.stringify(doc),id).when,doc.when));
run('only exposes whitelisted wallet snapshot metadata',()=>assert.deepEqual(Object.keys(api.inspect(JSON.stringify(doc),id)).sort(),['profileID','sourceKey','wallet','when']));
run('never imports other profile even with matching key',()=>assert.throws(()=>api.inspect(JSON.stringify(doc),other)));
run('refuses global legacy wallet key',()=>assert.throws(()=>api.inspect(JSON.stringify({...doc,keys:{v2_efectivo:doc.keys[key]}}),id)));
run('refuses invalid profile schema',()=>assert.throws(()=>api.inspect(JSON.stringify({...doc,v:'unrelated-profile'}),id)));
run('refuses malformed JSON',()=>assert.throws(()=>api.inspect('{invalid',id)));
run('refuses empty file',()=>assert.throws(()=>api.inspect('',id)));
run('refuses excessive file size',()=>assert.throws(()=>api.inspect('a'.repeat(8*1024*1024+1),id)));
run('refuses invalid active profile id',()=>assert.throws(()=>api.inspect(JSON.stringify(doc),'root')));
run('refuses missing key map',()=>assert.throws(()=>api.inspect(JSON.stringify({...doc,keys:null}),id)));
run('refuses malformed wallet record',()=>assert.throws(()=>api.inspect(JSON.stringify({...doc,keys:{[key]:'no-json'}}),id)));
run('refuses wallet array',()=>assert.throws(()=>api.inspect(JSON.stringify({...doc,keys:{[key]:'[]'}}),id)));
run('accepts copy with no timestamp but flags unknown',()=>assert.equal(api.inspect(JSON.stringify({...doc,when:null}),id).when,null));
run('accepts alternative profile-scoped key',()=>assert(api.inspect(JSON.stringify({...doc,keys:{['v2_u_'+id+'_efectivo']:doc.keys[key]}}),id).wallet.movimientos.length===1));
run('no mutation of input JSON',()=>{const before=JSON.stringify(doc);api.inspect(before,id);assert.equal(JSON.stringify(doc),before)});
console.log('RESULT',n,'/ 16 same-profile local backup checks');

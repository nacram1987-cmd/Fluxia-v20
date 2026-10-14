import test from 'node:test';
import assert from 'node:assert/strict';
import {installCloudStatus} from '../src/cloud-status-ui.mjs';
const user='11111111-1111-4111-8111-111111111111';
function fixture(){
 const button={disabled:false,handler:null,addEventListener(_event,fn){this.handler=fn}};
 const target={textContent:''};
 const root={getElementById(id){return id==='cloudReadButton'?button:id==='cloudReadStatus'?target:null}};
 return {button,target,root};
}
test('no session means no request and no financial disclosure',async()=>{
 const f=fixture();let calls=0;
 assert.equal(installCloudStatus({...f,reader:async()=>{calls++}}),true);
 await f.button.handler();
 assert.equal(calls,0);
 assert.match(f.target.textContent,/Sin conexión verificada/);
 assert.equal(f.button.disabled,false);
});
test('verified session displays only record count, not raw data',async()=>{
 const f=fixture();
 installCloudStatus({...f,sessionProvider:async()=>({supabaseUrl:'https://example.supabase.co',publishableKey:'pk',accessToken:'token',expectedUserId:user}),reader:async()=>({user_id:user,parity_status:'NOT_CERTIFIED',rows:{fluxia_datos:[{v:'private-secret'}],planrescate_v2:[]}})});
 await f.button.handler();
 assert.match(f.target.textContent,/1 registros/);
 assert.doesNotMatch(f.target.textContent,/private-secret/);
});
test('mismatched account response fails closed',async()=>{
 const f=fixture();
 installCloudStatus({...f,sessionProvider:async()=>({supabaseUrl:'https://example.supabase.co',publishableKey:'pk',accessToken:'token',expectedUserId:user}),reader:async()=>({user_id:'different',parity_status:'NOT_CERTIFIED',rows:{fluxia_datos:[],planrescate_v2:[]}})});
 await f.button.handler();
 assert.match(f.target.textContent,/Sin conexión verificada/);
});

test('switching accounts invalidates in-flight response and hides prior status',async()=>{
 const f=fixture();const listeners={};
 f.root.addEventListener=(name,cb)=>{listeners[name]=cb};
 let resolve;
 const pending=new Promise(r=>{resolve=r});
 installCloudStatus({...f,sessionProvider:async()=>({supabaseUrl:'https://example.supabase.co',publishableKey:'pk',accessToken:'token',expectedUserId:user}),reader:async()=>pending});
 const request=f.button.handler();
 await new Promise(r=>setImmediate(r));
 listeners['fluxia:session-changed']();
 resolve({user_id:user,parity_status:'NOT_CERTIFIED',rows:{fluxia_datos:[{v:'secret'}],planrescate_v2:[]}});
 await request;
 assert.match(f.target.textContent,/Sesión cambiada/);
 assert.doesNotMatch(f.target.textContent,/1 registros|secret/);
 assert.equal(f.button.disabled,false);
});

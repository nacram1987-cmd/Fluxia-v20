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

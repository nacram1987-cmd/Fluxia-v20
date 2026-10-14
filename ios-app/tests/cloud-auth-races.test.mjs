import test from 'node:test';
import assert from 'node:assert/strict';
import {createCloudSessionProvider} from '../src/cloud-auth.mjs';
const config={supabaseUrl:'https://example.supabase.co',publishableKey:'example-public'};
test('a late login cannot restore a signed-out session',async()=>{
 let finish;
 const pending=new Promise(resolve=>{finish=resolve});
 const auth=createCloudSessionProvider({...config,fetchImpl:async()=>pending});
 const login=auth.signIn({email:'test@example.com',password:'example-password'});
 auth.signOut();
 finish({ok:true,json:async()=>({access_token:'example-token',expires_in:3600,user:{id:'example-user'}})});
 await assert.rejects(login,/Session changed/);
 assert.equal(await auth.getSession(),null);
});
test('expired sessions are rejected without refresh fallback',async()=>{
 const auth=createCloudSessionProvider({...config,fetchImpl:async()=>({ok:true,json:async()=>({access_token:'example-token',expires_in:1,user:{id:'example-user'}})})});
 await auth.signIn({email:'test@example.com',password:'example-password'});
 assert.equal(await auth.getSession(),null);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {createCloudSessionProvider} from '../src/cloud-auth.mjs';
const config={supabaseUrl:'https://example.supabase.co',publishableKey:'example-public'};
test('session is memory-only and signout clears identity',async()=>{const auth=createCloudSessionProvider({...config,fetchImpl:async()=>({ok:true,json:async()=>({access_token:'example-token',expires_in:3600,user:{id:'user-a'}})})});assert.equal(await auth.getSession(),null);await auth.signIn({email:'example@example.com',password:'example-password'});assert.equal((await auth.getSession()).expectedUserId,'user-a');auth.signOut();assert.equal(await auth.getSession(),null)});
test('rejects missing public configuration',()=>assert.throws(()=>createCloudSessionProvider({...config,publishableKey:''}),/Publishable key/));

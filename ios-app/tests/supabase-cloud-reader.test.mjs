import test from 'node:test';
import assert from 'node:assert/strict';
import {readFluxiaCloudRows} from '../src/supabase-cloud-reader.mjs';
const user='11111111-1111-4111-8111-111111111111';
const args={supabaseUrl:'https://example.supabase.co',publishableKey:'test-public-key',accessToken:'test-access-token',expectedUserId:user};
function mock(id=user, data=[]){return async (url,init)=>({ok:true,json:async()=>String(url).includes('/auth/v1/user')?{id}:data, status:200})}
test('reads existing tables using GET only',async()=>{const calls=[];const result=await readFluxiaCloudRows({...args,fetchImpl:async(u,i)=>{calls.push([u,i]);return mock()(u,i)}});assert.equal(result.parity_status,'NOT_CERTIFIED');assert.equal(calls.length,3);assert.ok(calls.every(([,i])=>i.method==='GET'));assert.ok(calls.slice(1).every(([u])=>u.includes('user_id=eq.')))});
test('rejects mismatched auth identity',async()=>assert.rejects(readFluxiaCloudRows({...args,fetchImpl:mock('22222222-2222-4222-8222-222222222222')}),/identity mismatch/));
test('rejects rows belonging to other account',async()=>assert.rejects(readFluxiaCloudRows({...args,fetchImpl:mock(user,[{user_id:'other'}])}),/identity violation/));
test('rejects non-HTTPS endpoint',async()=>assert.rejects(readFluxiaCloudRows({...args,supabaseUrl:'http://example.com',fetchImpl:mock()}),/Invalid Supabase URL/));

test('rejects repeated records across cloud pages',async()=>{const row={user_id:user,clave:'same-key',v:'{}'};const fetchImpl=async(u)=>({ok:true,json:async()=>String(u).includes('/auth/v1/user')?{id:user}:String(u).includes('fluxia_datos')?[row,row]:[]});await assert.rejects(readFluxiaCloudRows({...args,fetchImpl}),/Duplicate cloud record/)});

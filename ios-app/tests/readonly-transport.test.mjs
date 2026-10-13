import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchReadOnlySnapshot} from '../src/readonly-transport.mjs';
const payload=(userId='a',month='2026-10')=>({schemaVersion:1,userId,month,totals:{income:'0.00',fixed:'0.00',variable:'0.00',provisions:'0.00',extraContributions:'0.00',available:'0.00'}});
const options={endpoint:'https://example.test/api/finance/snapshot',accessToken:'test-token',expectedUserId:'a',month:'2026-10'};
test('read-only request uses GET, no cache, bearer and validates response',async()=>{
  let call;
  const result=await fetchReadOnlySnapshot({...options,fetchImpl:async(url,init)=>{call={url,init};return {ok:true,json:async()=>payload()};}});
  assert.equal(result.totals.available,0);
  assert.equal(call.init.method,'GET');
  assert.equal(call.init.cache,'no-store');
  assert.equal(call.init.credentials,'omit');
  assert.equal(call.init.headers.Authorization,'Bearer test-token');
  assert.equal(new URL(call.url).searchParams.get('month'),'2026-10');
});
test('reject HTTP and missing token before sending request',async()=>{
  let count=0;const fetchImpl=async()=>{count++;};
  await assert.rejects(fetchReadOnlySnapshot({...options,endpoint:'http://example.test',fetchImpl}),/HTTPS/);
  await assert.rejects(fetchReadOnlySnapshot({...options,accessToken:'',fetchImpl}),/token/);
  assert.equal(count,0);
});
test('reject cross-account response and incorrect month',async()=>{
  await assert.rejects(fetchReadOnlySnapshot({...options,fetchImpl:async()=>({ok:true,json:async()=>payload('b')})}),/Cross-account/);
  await assert.rejects(fetchReadOnlySnapshot({...options,fetchImpl:async()=>({ok:true,json:async()=>payload('a','2026-09')})}),/month/);
});
test('reject failed or expired sessions without falling back to demo data',async()=>{
  await assert.rejects(fetchReadOnlySnapshot({...options,fetchImpl:async()=>({ok:false,status:401})}),/failed/);
});

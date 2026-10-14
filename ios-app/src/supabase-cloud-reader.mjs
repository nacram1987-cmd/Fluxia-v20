// Fluxia Élite: authenticated Supabase Data API read-only bridge.
// No service-role keys, no writes, no bank sync, no persistence.
export async function readFluxiaCloudRows({supabaseUrl,publishableKey,accessToken,expectedUserId,fetchImpl=fetch,signal}) {
  let url;
  try { url=new URL(supabaseUrl); } catch { throw Error('Invalid Supabase URL'); }
  if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/' || !url.hostname.endsWith('.supabase.co'))throw Error('Invalid Supabase URL');
  if(!/^[a-f0-9-]{36}$/i.test(expectedUserId))throw Error('Authenticated UUID required');
  if(typeof publishableKey!=='string'||!publishableKey.trim()||typeof accessToken!=='string'||!accessToken.trim())throw Error('Authenticated credentials required');
  const root=url.origin;
  const headers={apikey:publishableKey,Authorization:'Bearer '+accessToken,Accept:'application/json'};
  const auth=await fetchImpl(root+'/auth/v1/user',{method:'GET',headers,credentials:'omit',cache:'no-store',redirect:'error',signal});
  if(!auth.ok)throw Error('Authentication verification failed');
  const user=await auth.json();
  if(user.id!==expectedUserId)throw Error('Authenticated identity mismatch');
  const tables=[['fluxia_datos','user_id,clave,v,t,updated_at'],['planrescate_v2','id,user_id,clave,v,t,updated_at']];
  const result={};
  for(const [table,columns] of tables){
    const rows=[];let offset=0;const limit=500;const seen=new Set();
    while(true){
      const endpoint=new URL(root+'/rest/v1/'+table);
      endpoint.searchParams.set('select',columns);
      endpoint.searchParams.set('user_id','eq.'+expectedUserId);
      endpoint.searchParams.set('order',table==='fluxia_datos'?'clave.asc':'id.asc');
      endpoint.searchParams.set('limit',String(limit));
      endpoint.searchParams.set('offset',String(offset));
      const res=await fetchImpl(endpoint.toString(),{method:'GET',headers,credentials:'omit',cache:'no-store',redirect:'error',signal});
      if(!res.ok)throw Error('Cloud read failed: '+table);
      const batch=await res.json();
      if(!Array.isArray(batch)||batch.some(row=>row.user_id!==expectedUserId))throw Error('Cloud identity violation');
      for(const row of batch){const key=table==='fluxia_datos'?row.clave:row.id;if(!key||seen.has(key))throw Error('Duplicate cloud record');seen.add(key)}
      rows.push(...batch);
      if(batch.length<limit)break;
      offset+=batch.length;
      if(offset>=100000)throw Error('Cloud pagination safety limit');
    }
    result[table]=rows;
  }
  return Object.freeze({source:'supabase-authenticated-readonly',user_id:expectedUserId,rows:Object.freeze(result),parity_status:'NOT_CERTIFIED'});
}

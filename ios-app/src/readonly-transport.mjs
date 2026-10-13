import {validateSnapshot} from './readonly-finance.mjs';

// Transport contract only: no production URL, tokens or account identifiers embedded.
export async function fetchReadOnlySnapshot({endpoint,accessToken,expectedUserId,month,fetchImpl=fetch,signal}){
  if(typeof endpoint!=='string'||!endpoint.startsWith('https://'))throw Error('HTTPS endpoint required');
  const url=new URL(endpoint);
  if(url.username||url.password||url.hash)throw Error('Unsafe endpoint');
  if(!/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(month))throw Error('Invalid month');
  if(typeof accessToken!=='string'||!accessToken.trim())throw Error('Missing access token');
  if(typeof expectedUserId!=='string'||!expectedUserId.trim())throw Error('Missing authenticated user');
  url.searchParams.set('month',month);
  const response=await fetchImpl(url.toString(),{
    method:'GET',redirect:'error',cache:'no-store',credentials:'omit',
    headers:{Authorization:`Bearer ${accessToken}`,Accept:'application/json'},
    signal
  });
  if(!response.ok)throw Error('Read-only snapshot request failed');
  const payload=await response.json();
  if(payload.month!==month)throw Error('Unexpected snapshot month');
  return validateSnapshot(payload,expectedUserId);
}

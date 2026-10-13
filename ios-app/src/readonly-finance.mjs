// Fluxia Élite native LAB: read-only financial snapshot boundary.
// No network, bank tokens, credentials, mutations, or persistent user data here.
const MONEY=/^-?\d{1,12}(?:\.\d{1,2})?$/;
export function cents(value){
  if(typeof value!=='string'||!MONEY.test(value))throw Error('Invalid money amount');
  const negative=value.startsWith('-');
  const [whole,frac='']=value.replace('-','').split('.');
  const n=Number(whole)*100+Number(frac.padEnd(2,'0'));
  if(!Number.isSafeInteger(n))throw Error('Money overflow');
  return negative?-n:n;
}
export function validateSnapshot(payload,expectedUserId){
  if(!expectedUserId||typeof expectedUserId!=='string')throw Error('Missing authenticated user');
  if(!payload||typeof payload!=='object'||Array.isArray(payload))throw Error('Invalid snapshot');
  if(payload.schemaVersion!==1)throw Error('Unsupported snapshot schema');
  if(payload.userId!==expectedUserId)throw Error('Cross-account snapshot blocked');
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(payload.month))throw Error('Invalid month');
  const keys=['income','fixed','variable','provisions','extraContributions','available'];
  const totals={};
  for(const k of keys)totals[k]=cents(payload.totals?.[k]);
  // Available is never calculated from imported bank transactions in the native LAB.
  // Backend remains authoritative until the financial engine is audited.
  return Object.freeze({schemaVersion:1,userId:expectedUserId,month:payload.month,totals:Object.freeze(totals),source:'authenticated-cloud-readonly'});
}
export function createReadOnlySession(){
  let userId=null,snapshot=null;
  return Object.freeze({
    signIn(id){if(typeof id!=='string'||!id.trim())throw Error('Invalid user');userId=id;snapshot=null;},
    accept(payload){if(!userId)throw Error('Not authenticated');snapshot=validateSnapshot(payload,userId);return snapshot;},
    signOut(){userId=null;snapshot=null;},
    getSnapshot(){return snapshot;},
    getUserId(){return userId;}
  });
}

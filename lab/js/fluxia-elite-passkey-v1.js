(function(root){
 'use strict';
 const PREFIX='fluxia_elite_passkey_v1_';
 function supported(){return !!(root&&root.isSecureContext&&root.PublicKeyCredential&&root.navigator?.credentials&&root.crypto?.getRandomValues)}
 function b64(buf){const bytes=new Uint8Array(buf);let s='';for(const byte of bytes)s+=String.fromCharCode(byte);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
 function bytes(text){return new TextEncoder().encode(text)}
 function key(userId){return PREFIX+String(userId||'').replace(/[^a-zA-Z0-9_-]/g,'_')}
 function read(userId){try{return JSON.parse(localStorage.getItem(key(userId))||'null')}catch{return null}}
 function has(userId){return !!read(userId)?.id}
 async function platformAvailable(){if(!supported()||!root.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable)return false;return root.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(()=>false)}
 async function register(userId){
  if(!supported())throw Error('Este navegador no permite Face ID/passkeys en contexto seguro.');
  const available=await platformAvailable();if(!available)throw Error('No se ha detectado un autenticador biométrico disponible.');
  const credential=await root.navigator.credentials.create({publicKey:{challenge:root.crypto.getRandomValues(new Uint8Array(32)),rp:{name:'Fluxia Élite',id:root.location.hostname},user:{id:root.crypto.getRandomValues(new Uint8Array(16)),name:String(userId),displayName:'Fluxia'},pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{authenticatorAttachment:'platform',residentKey:'required',requireResidentKey:true,userVerification:'required'},attestation:'none'}});
  if(!credential?.rawId)throw Error('Face ID no ha devuelto una credencial válida.');
  const saved={id:b64(credential.rawId),userId:String(userId),createdAt:new Date().toISOString()};localStorage.setItem(key(userId),JSON.stringify(saved));return saved
 }
 async function authenticate(userId){
  const saved=read(userId);if(!saved?.id)return false;if(!supported())return false;
  const raw=Uint8Array.from(atob(saved.id.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
  const credential=await root.navigator.credentials.get({publicKey:{challenge:root.crypto.getRandomValues(new Uint8Array(32)),allowCredentials:[{type:'public-key',id:raw}],userVerification:'required'},mediation:'optional'});
  return !!credential
 }
 function remove(userId){try{localStorage.removeItem(key(userId))}catch{}}
 const api={version:'1.0.0',supported,platformAvailable,has,register,authenticate,remove};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.FluxiaElitePasskey=api;
})(typeof globalThis!=='undefined'?globalThis:this);

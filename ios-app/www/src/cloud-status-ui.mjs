import {readFluxiaCloudRows} from './supabase-cloud-reader.mjs';
// Read-only cloud status: do not cache data or expose raw finance records in the UI.
export function installCloudStatus({root=document,sessionProvider,reader=readFluxiaCloudRows}={}){
  const target=root.getElementById('cloudReadStatus');
  const button=root.getElementById('cloudReadButton');
  if(!target||!button)return false;
  let generation=0;
  let activeController=null;
  function invalidate(){
    generation++;
    activeController?.abort();
    activeController=null;
    target.textContent='Sesión cambiada. Datos financieros ocultos.';
    button.disabled=false;
  }
  // The host MUST signal sign-out/account changes. Never display an old response after it.
  root.addEventListener?.('fluxia:session-changed',invalidate);
  button.addEventListener('click',async()=>{
    if(button.disabled)return;
    const current=++generation;
    activeController?.abort();
    const controller=new AbortController();
    activeController=controller;
    button.disabled=true;
    target.textContent='Verificando sesión y leyendo datos…';
    try{
      if(typeof sessionProvider!=='function')throw Error('No authenticated session');
      const session=await sessionProvider();
      if(current!==generation)return;
      if(!session||!session.supabaseUrl||!session.publishableKey||!session.accessToken||!session.expectedUserId)throw Error('No authenticated session');
      const result=await reader({...session,signal:controller.signal});
      if(current!==generation||controller.signal.aborted)return;
      if(result.user_id!==session.expectedUserId||result.parity_status!=='NOT_CERTIFIED')throw Error('Cloud identity violation');
      const count=result.rows.fluxia_datos.length+result.rows.planrescate_v2.length;
      target.textContent='Lectura protegida completada: '+count+' registros. Conciliación pendiente; no se ha modificado ningún dato.';
    }catch{
      if(current===generation)target.textContent='Sin conexión verificada. No se han mostrado ni modificado datos financieros.';
    }finally{
      if(current===generation){activeController=null;button.disabled=false;}
    }
  });
  return true;
}

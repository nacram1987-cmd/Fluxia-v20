import {readFluxiaCloudRows} from './supabase-cloud-reader.mjs';
// The native host must supply a verified, ephemeral session; no login form or stored tokens.
export function installCloudStatus({root=document,sessionProvider,reader=readFluxiaCloudRows}={}){
  const target=root.getElementById('cloudReadStatus');
  const button=root.getElementById('cloudReadButton');
  if(!target||!button)return false;
  button.addEventListener('click',async()=>{
    button.disabled=true;
    target.textContent='Verificando sesión y leyendo datos…';
    try {
      if(typeof sessionProvider!=='function')throw Error('No hay sesión autenticada disponible');
      const session=await sessionProvider();
      if(!session||!session.supabaseUrl||!session.publishableKey||!session.accessToken||!session.expectedUserId)throw Error('No hay sesión autenticada disponible');
      const result=await reader(session);
      if(result.user_id!==session.expectedUserId||result.parity_status!=='NOT_CERTIFIED')throw Error('Respuesta de nube no verificada');
      const count=result.rows.fluxia_datos.length+result.rows.planrescate_v2.length;
      target.textContent='Lectura protegida completada: '+count+' registros. Conciliación pendiente; no se ha modificado ningún dato.';
    }catch{
      target.textContent='Sin conexión verificada. No se han mostrado ni modificado datos financieros.';
    }finally{button.disabled=false;}
  });
  return true;
}

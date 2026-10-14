// Authenticated Supabase session provider, no service key and no token persistence.
// Supabase project URL and public publishable key are configuration, not credentials.
export function createCloudSessionProvider({supabaseUrl,publishableKey,fetchImpl=fetch,dispatchEvent=()=>{}}){
  if(typeof supabaseUrl!=='string'||!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(supabaseUrl))throw Error('Invalid Supabase project URL');
  if(typeof publishableKey!=='string'||!publishableKey.trim())throw Error('Publishable key required');
  let session=null,version=0;
  const emit=()=>dispatchEvent('fluxia:session-changed');
  return Object.freeze({
    async signIn({email,password}){
      if(typeof email!=='string'||!email.includes('@')||typeof password!=='string'||!password)throw Error('Email and password required');
      const myVersion=++version;session=null;emit();
      const response=await fetchImpl(supabaseUrl.replace(/\/$/,'')+'/auth/v1/token?grant_type=password',{
        method:'POST',headers:{apikey:publishableKey,'Content-Type':'application/json'},body:JSON.stringify({email,password}),
        credentials:'omit',cache:'no-store',redirect:'error'
      });
      if(!response.ok)throw Error('Authentication failed');
      const result=await response.json();
      if(myVersion!==version)throw Error('Session changed');
      if(!result.access_token||!result.user?.id||!result.expires_in)throw Error('Incomplete auth response');
      session={accessToken:result.access_token,expectedUserId:result.user.id,expiresAt:Date.now()+result.expires_in*1000};
      emit();
      return result.user.id;
    },
    async getSession(){
      if(!session)return null;
      if(Date.now()+30000>=session.expiresAt){session=null;version++;emit();return null;}
      return {supabaseUrl,publishableKey,accessToken:session.accessToken,expectedUserId:session.expectedUserId};
    },
    signOut(){session=null;version++;emit();},
    getUserId(){return session?.expectedUserId??null}
  });
}

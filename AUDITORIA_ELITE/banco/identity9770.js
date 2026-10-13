// Namespace at the bank boundary. Existing references and financial amounts are
// never rewritten. Ambiguous legacy ownership becomes an explicit conflict.
Object.defineProperty(window,"FluxiaBankIdentity9770",{configurable:true,get:function(){var engine=(function(){
  function bank(x){return String(x||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'')}
  function key(m){if(String(m.id||m.bancoRef||'').indexOf('fxbank9770:')===0)return String(m.id||m.bancoRef);return m.bancoIdentity||'fxbank9770:'+JSON.stringify([m.provider||'enablebanking',bank(m.banco),String(m.accountKey||m.accountId||'legacy-bank'),String(m.stableRef||m.bancoStableRef||m.legacyId||m.bancoRef||m.id||'')])}
  function rows(){var out=[];try{if(typeof movimientos!=='undefined')out=out.concat(movimientos||[]);if(typeof ingresosItems!=='undefined')out=out.concat(ingresosItems||[])}catch(_){}return out}
  function read(key,fallback){try{var v=typeof Almacen!=='undefined'?Almacen.getItem(key):null;if(v==null)v=localStorage.getItem(key);return v==null?fallback:JSON.parse(v)}catch(_){return fallback}}
  var aliasRaw=null,aliasCache={};
  function aliasKey(){return 'v2_bank_identity_aliases9770_'+String(window.FLUXIA_PROFILE&&FLUXIA_PROFILE.id||'')}
  function aliases(){var value=read(aliasKey(),{}),raw=JSON.stringify(value);if(raw!==aliasRaw){aliasRaw=raw;aliasCache=value||{}}return aliasCache}
  function identity(record){return record&&record.bancoIdentity||(aliases()[String(record&&record.id||'')]||{}).identity||''}
  function account(record){return record&&record.bancoAccountKey||(aliases()[String(record&&record.id||'')]||{}).accountKey||''}
  function removed(){try{return window.FluxiaGVBorrados&&FluxiaGVBorrados.leer?FluxiaGVBorrados.leer():[]}catch(_){return[]}}
  function plan(batch,records){records=records||rows();var aliasMap=aliases();function identityOf(x){return x&&x.bancoIdentity||(aliasMap[String(x&&x.id||'')]||{}).identity||''}var assignments=[],conflicts=[],items=[],groups=new Map(),fallbackCounts=new Map();
    (batch||[]).forEach(function(m){if(!m)return;var group=bank(m.banco)+'|'+String(m.legacyId||m.id),set=groups.get(group)||new Set;set.add(key(m));groups.set(group,set);if(m.idAuthority==='fallback')fallbackCounts.set(key(m),(fallbackCounts.get(key(m))||0)+1)});
    (batch||[]).forEach(function(original){if(!original)return;var m=Object.assign({},original),raw=String(m.legacyId||m.id||''),identity=key(m);m.legacyId=raw;m.bancoIdentity=identity;
      if(m.idAuthority==='fallback'&&(fallbackCounts.get(identity)||0)>1){conflicts.push({identity:identity,reason:'ambiguous-provider-fallback',movement:m});return}
      if(!raw){conflicts.push({identity:identity,reason:'provider-reference-missing',movement:m});return}
      if(records.some(function(x){return x&&!identityOf(x)&&String(x.bancoRef||'')===raw&&(!bank(x.banco)||bank(x.banco)==='banco')})){conflicts.push({identity:identity,reason:'legacy-bank-unknown',movement:m});return}
      var scoped=records.filter(function(x){return x&&identityOf(x)===identity});
      var legacy=records.filter(function(x){return x&&!identityOf(x)&&String(x.bancoRef||'')===raw&&bank(x.banco)===bank(m.banco)});
      var hit=scoped.length===1?scoped[0]:null;
      if(!hit&&m.accountKeyKind==='provider-uid'&&records.some(function(x){return x&&(x.bancoAccountKeyKind||(aliasMap[String(x.id)]||{}).kind)==='provider-uid'&&(x.bancoLegacyId||(aliasMap[String(x.id)]||{}).raw)===raw&&bank(x.banco)===bank(m.banco)&&identityOf(x)!==identity})){conflicts.push({identity:identity,reason:'account-reconsent-needs-review',movement:m});return}
      if(scoped.length>1||(legacy.length&&(legacy.length!==1||(groups.get(bank(m.banco)+'|'+raw)||new Set).size!==1))){conflicts.push({identity:identity,reason:'legacy-account-ambiguous',movement:m});return}
      if(!hit&&legacy.length===1){hit=legacy[0];assignments.push({record:hit,identity:identity,accountKey:m.accountKey||m.accountId||'',provider:m.provider||'enablebanking',kind:m.accountKeyKind||'legacy-bank',stable:m.stableRef||raw,raw:raw})}
      // Preserve an existing linked legacy reference; new payments use scoped IDs.
      m.id=hit?String(hit.bancoRef):identity;
      items.push(m);
    });return{items:items,assignments:assignments,conflicts:conflicts};
  }
  function apply(p){if(!p.assignments.length)return;var payload={version:9770,at:Date.now(),profile:String(window.FLUXIA_PROFILE&&FLUXIA_PROFILE.id||''),before:p.assignments.map(function(a){return JSON.parse(JSON.stringify(a.record))})};
    if(typeof Almacen!=='undefined'&&Almacen.setItem){var checkpoint='v2_bank_identity_checkpoint9770_'+String(payload.at),serialized=JSON.stringify(payload);Almacen.setItem(checkpoint,serialized);if(Almacen.getItem(checkpoint)!==serialized)throw Error('No se pudo respaldar la identidad bancaria; sincronización detenida')}
    var updated=Object.assign({},aliases());p.assignments.forEach(function(a){updated[String(a.record.id)]={identity:a.identity,accountKey:a.accountKey,stable:a.stable,provider:a.provider,kind:a.kind,raw:a.raw}});var registry=JSON.stringify(updated);if(typeof Almacen!=='undefined'&&Almacen.setItem)Almacen.setItem(aliasKey(),registry);else localStorage.setItem(aliasKey(),registry);aliasRaw=registry;aliasCache=updated;
  }
  function handles(m){return !!(m&&(m.bancoIdentity||String(m.id||m.bancoRef||'').indexOf('fxbank9770:')===0))}
  function ignored(m){if(!m)return false;var id=String(m.bancoIdentity||m.id||m.bancoRef||''),raw=String(m.legacyId||m.bancoLegacyId||''),b=bank(m.banco),entries=removed(),black=read('v2_borrados_blacklist',[]);
    if(Array.isArray(black)&&black.indexOf(id)>=0)return true;
    for(var i=0;i<entries.length;i++){var e=entries[i],snap=e&&e.snapshot||{};if(!e)continue;
      var archivedIdentity=identity(snap)||identity({id:e.id});if(archivedIdentity){if(archivedIdentity===id)return true;continue}
      if(String(e.bancoRef||'')===id||String(e.id||'')===id)return true;
      if(raw&&(String(e.bancoRef||'')===raw||String(e.id||'')===raw)&&(!bank(snap.banco||e.banco)||bank(snap.banco||e.banco)===b))return true;
    }
    // Legacy bare vetoes with no matching snapshot cannot be safely reassigned.
    if(raw&&Array.isArray(black)&&black.indexOf(raw)>=0&&!entries.some(function(e){return e&&(String(e.bancoRef||'')===raw||String(e.id||'')===raw)}))return true;
    return false;
  }
  function stamp(record,m){if(!record||!m)return;record.bancoIdentity=m.bancoIdentity||key(m);record.bancoAccountKey=m.accountKey||m.accountId||'';record.bancoStableRef=m.stableRef||m.legacyId||m.id;record.bancoProvider=m.provider||'enablebanking';record.bancoAccountKeyKind=m.accountKeyKind||'legacy-bank';record.bancoLegacyId=m.legacyId||m.id}
  function conflicts(p){if(!p.conflicts.length)return;try{if(typeof Almacen!=='undefined')Almacen.setItem('v2_bank_identity_conflicts9770',JSON.stringify(p.conflicts))}catch(_){}try{var host=document.getElementById('fluxiaMsgImport');if(host){host.textContent=p.conflicts.length+' cargo(s) requieren identificar la cuenta de un registro antiguo; no se han fusionado ni borrado.';host.className='fluxia-banco-msg error'}}catch(_){} }
  return{key:key,identity:identity,account:account,plan:plan,apply:apply,ignored:ignored,handles:handles,stamp:stamp,conflicts:conflicts};
})();Object.defineProperty(window,"FluxiaBankIdentity9770",{value:engine,configurable:true});return engine}});

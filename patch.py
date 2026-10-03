#!/usr/bin/env python3
# v94.63 · parches quirúrgicos sobre el index v94.62 real (cada uno exact-match + assert)
import sys, io
SRC = sys.argv[1]; DST = sys.argv[2]
s = io.open(SRC, encoding='utf-8').read()
n_ok = 0
def rep(old, new, count=1, tag=''):
    global s, n_ok
    c = s.count(old)
    assert c == count, 'PATCH %s: esperado %d coincidencias, hay %d' % (tag, count, c)
    s = s.replace(old, new)
    n_ok += 1
    print('OK', tag)

# ── P1 · Almacen: tiempos remotos, info de perfil y recuperación SOLO dentro del mismo perfil ──
rep("""  const fallos = {};       // reintentos por clave
""", """  const fallos = {};       // reintentos por clave
  const _remotoT = {};     // v94.63 · marca de tiempo de cada documento remoto (para resolver conflictos)
""", tag='P1a remotoT')

rep("""  function nuestra(k){ return /^(planRescate|tmd_|bk_)/.test(k); }
""", """  function nuestra(k){ return /^(planRescate|tmd_|bk_)/.test(k); }
  /* v94.63 · La recuperación «entre prefijos» SOLO mira claves de ESTE perfil (nunca de otro usuario
     del dispositivo ni del espacio planRescate_v2_u_* de v94.55–v94.62). Antes cogía la lista más
     larga de CUALQUIER clave → datos de otro perfil o copias viejas aparecían y desaparecían. */
  function _mismoPerfilK(raw){
    try{
      if (!raw) return false;
      if (ES_LEGACY) return raw.indexOf('fluxia_user_') !== 0 && raw.indexOf('planRescate_v2_u_') !== 0;
      return raw.indexOf(LOCAL_PREFIX) === 0 && raw.indexOf(LOCAL_PREFIX + 'planRescate_v2_u_') !== 0;
    }catch(e){ return false; }
  }
""", tag='P1b mismoPerfil')

rep("""          var rawK = localStorage.key(i);
          if (!rawK) continue;
          // match exact suffix after __ or exact key
""", """          var rawK = localStorage.key(i);
          if (!rawK) continue;
          if (!_mismoPerfilK(rawK)) continue; /* v94.63 */
          // match exact suffix after __ or exact key
""", tag='P1c fallback')

rep("""        if (x && typeof x.v === 'string'){ remoto[d.id] = x.v; remotoMeta[d.id] = x; }
""", """        if (x && typeof x.v === 'string'){ remoto[d.id] = x.v; remotoMeta[d.id] = x; _remotoT[d.id] = Number(x.t) || 0; }
""", tag='P1d remotoT set')

rep("""    get estado(){ return estado; },
    get ultimaSync(){ return ultima; },
""", """    get estado(){ return estado; },
    get ultimaSync(){ return ultima; },
    /* v94.63 */
    get esLegacy(){ return ES_LEGACY; },
    get localPrefix(){ return LOCAL_PREFIX; },
    get perfilId(){ return PERFIL_LOCAL; },
    tsDe(k){ let l = 0; try{ l = Number(lsGet('__ts__' + String(k)) || 0); }catch(e){} return Math.max(l, Number(_remotoT[k] || 0)); },
""", tag='P1e getters')

# ── P2 · Prefijo SIEMPRE base (regla v94.52 del PROMPT MAESTRO) ──
rep("""    var sid = String(pr.id).replace(/[^a-zA-Z0-9_-]/g,'').slice(0, 40) || 'x';
    LS_PREFIX = base + 'u_' + sid + '_';
    try{
      if (fluxiaEsPerfilAislado(pr)){""", """    /* v94.63 · REGLA v94.52 RESTAURADA: LS_PREFIX SIEMPRE base. El aislamiento entre usuarios ya lo
       hace Almacen (claves fluxia_user_<id>__ en el móvil + planUsuarios/<id> en la nube).
       El espacio planRescate_v2_u_<id>_ de v94.55–v94.62 partía los datos en dos (mitad en cada sitio):
       ahora solo se LEE para recuperar (FluxiaRecV63), nunca se escribe. */
    LS_PREFIX = base;
    return LS_PREFIX;
    var sid = String(pr.id).replace(/[^a-zA-Z0-9_-]/g,'').slice(0, 40) || 'x';
    try{
      if (fluxiaEsPerfilAislado(pr)){""", tag='P2a prefijo base')

rep("""    if (!pr || !pr.id){
      LS_PREFIX = base + 'anon_';
      return LS_PREFIX;
    }""", """    if (!pr || !pr.id){
      LS_PREFIX = base; /* v94.63: sin perfil = base (Almacen ya separa por perfil) */
      return LS_PREFIX;
    }""", tag='P2b anon')

rep("""  }catch(e){
    LS_PREFIX = 'planRescate_v2_anon_';
    return LS_PREFIX;
  }""", """  }catch(e){
    LS_PREFIX = 'planRescate_v2_';
    return LS_PREFIX;
  }""", tag='P2c catch')

rep("""function fluxiaMigrarOwnerSiHaceFalta(sid){
  try{""", """function fluxiaMigrarOwnerSiHaceFalta(sid){
  /* v94.63 · DESACTIVADA: copiaba claves crudas planRescate_v2_* (que pueden ser de otro perfil)
     al espacio u_ y dejaba dos versiones del plan. La recuperación la hace FluxiaRecV63. */
  return;
  try{""", tag='P2d migrar off')

rep("""function fluxiaForzarVacioSiAislado(){
  try{
    var pr = window.FLUXIA_PROFILE;""", """function fluxiaForzarVacioSiAislado(){
  /* v94.63 · DESACTIVADA. Causa raíz de «gastos variables se ponen y se quitan», rescates perdidos y
     disponible falso al abrir: 400 ms después de cargar ponía movimientos/huchas/rescates a [] en
     memoria (también al dueño si su perfil quedó marcado «aislado» al terminar el onboarding); luego
     AntiCero o la nube los volvían a meter, y cualquier guardado intermedio pisaba lo guardado. */
  return false;
  try{
    var pr = window.FLUXIA_PROFILE;""", tag='P2e vacio off')

# dueño (para claves de banco por perfil)
rep("""window.fluxiaForzarVacioSiAislado = fluxiaForzarVacioSiAislado;
window.fluxiaEsPerfilAislado = fluxiaEsPerfilAislado;""", """window.fluxiaForzarVacioSiAislado = fluxiaForzarVacioSiAislado;
window.fluxiaEsPerfilAislado = fluxiaEsPerfilAislado;
/* v94.63 · ¿Es el dueño histórico del dispositivo? (perfil legacy, principal ⭐, dueño registrado o único usuario) */
function fluxiaEsDueno(pr){
  try{
    pr = pr || window.FLUXIA_PROFILE;
    if (!pr || !pr.id) return false;
    if (pr.legacy || pr.principal) return true;
    if (localStorage.getItem('fluxia_owner_profile_id_v1') === String(pr.id)) return true;
    var arr = JSON.parse(localStorage.getItem('fluxia_profiles_v2') || '[]') || [];
    var reales = arr.filter(function(x){ return x && x.id && !x.onboardingPending && !x.onboardingSkipped; });
    return reales.length === 1 && String(reales[0].id) === String(pr.id);
  }catch(e){ return false; }
}
window.fluxiaEsDueno = fluxiaEsDueno;""", tag='P2f esDueno')

# Crear usuario: NO escribir arrays vacíos con LS_PREFIX (ahora es base → borraría el plan del dueño)
rep("""    try{
      /* Vaciar namespace del nuevo usuario por si quedó basura */
      var pref = (typeof LS_PREFIX==='string'&&LS_PREFIX) ? LS_PREFIX : ('planRescate_v2_u_'+String(pr.id).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,40)+'_');
      ['ingresos','fijos','movimientos','provisiones','financiaciones','compartidos','usos','historico','presupuestos','config_plan','efectivo'].forEach(function(s){
        try{ localStorage.setItem(pref+s, s==='config_plan'?'{}':'[]'); }catch(e){}
      });""", """    try{
      /* v94.63 · ELIMINADO el vaciado con LS_PREFIX: con prefijo base escribía [] en planRescate_v2_*
         crudas (= plan del dueño legacy). Un usuario nuevo ya empieza vacío en su propio espacio de Almacen. */""", tag='P2g nuevo usuario')

# ── P3 · Sin cuenta: jamás vaciar el espacio crudo (legacy) ni el plan del dueño ──
rep("""      if (typeof guardarLS === 'function'){
        ['ingresos','fijos','movimientos','provisiones','financiaciones','compartidos','usos','historico','presupuestos'].forEach(function(s){
          try{ guardarLS('planRescate_v2_'+s, []); }catch(e){}
        });
      }""", """      /* v94.63 · Solo se vacía si el espacio es SOLO de este perfil (no legacy) y no es el dueño con datos.
         Antes de vaciar, copia interna (fluxia_pre_import_v1_<id>) por si hay que restaurar. */
      var _espacioPropio = (typeof Almacen !== 'undefined') && !Almacen.esLegacy && !!Almacen.localPrefix;
      var _duenoConDatos = false;
      try{ _duenoConDatos = (typeof fluxiaEsDueno === 'function' && fluxiaEsDueno(FLUXIA_PROFILE)) && ((Array.isArray(movimientos)&&movimientos.length) || (Array.isArray(ingresosItems)&&ingresosItems.length) || (Array.isArray(provisiones)&&provisiones.length)); }catch(e){}
      if (typeof guardarLS === 'function' && _espacioPropio && !_duenoConDatos){
        try{
          var _prevSC = {};
          ['ingresos','fijos','movimientos','provisiones','financiaciones','compartidos','usos','historico','presupuestos'].forEach(function(s){
            try{ var v = Almacen.getItem(claveLS('planRescate_v2_'+s)); if (v && v !== '[]') _prevSC[s] = v; }catch(e){}
          });
          if (Object.keys(_prevSC).length) localStorage.setItem('fluxia_pre_import_v1_'+_pid, JSON.stringify({cuando:new Date().toISOString(),motivo:'sin_cuenta_v94.63',claves:_prevSC}));
        }catch(e){}
        ['ingresos','fijos','movimientos','provisiones','financiaciones','compartidos','usos','historico','presupuestos'].forEach(function(s){
          try{ guardarLS('planRescate_v2_'+s, []); }catch(e){}
        });
      }""", tag='P3 sin cuenta')

# ── P4 · AntiCero: solo claves de ESTE perfil (antes cogía la lista más larga de cualquier clave) ──
rep("""  // ── Recuperar datos de CUALQUIER clave localStorage relacionada ──
  function escanearListas(){
    var out = { movimientos:[], ingresos:[], fijos:[], provisiones:[], financiaciones:[], compartidos:[], config:null };
    try{
      for (var i=0;i<localStorage.length;i++){
        var k = localStorage.key(i);
        if (!k) continue;""", """  // ── Recuperar datos de las claves de ESTE perfil (v94.63: antes de CUALQUIER clave) ──
  function _fxClaveDeEstePerfil(k){
    try{
      if (!k || k.indexOf('planRescate_v2_u_') >= 0) return false;
      if (typeof Almacen === 'undefined') return false;
      if (Almacen.esLegacy) return k.indexOf('planRescate_v2_') === 0;
      var lp = Almacen.localPrefix || '';
      return !!lp && k.indexOf(lp + 'planRescate_v2_') === 0;
    }catch(e){ return false; }
  }
  function escanearListas(){
    var out = { movimientos:[], ingresos:[], fijos:[], provisiones:[], financiaciones:[], compartidos:[], config:null };
    try{
      for (var i=0;i<localStorage.length;i++){
        var k = localStorage.key(i);
        if (!k) continue;
        if (!_fxClaveDeEstePerfil(k)) continue; /* v94.63 */""", tag='P4 anticero')

# ── P5 · Cierre de mes: marca robusta + esperar a datos reales ──
rep("""function _cierres(){ try{ return cargarLS(CLAVE_CIERRES, {}) || {}; }catch(e){ return {}; } }""",
"""function _cierresLocalKey(){ try{ return 'fluxia_cierres_vistos_v63_' + ((window.FLUXIA_PROFILE && FLUXIA_PROFILE.id) ? String(FLUXIA_PROFILE.id) : 'x'); }catch(e){ return 'fluxia_cierres_vistos_v63_x'; } }
function _cierres(){
  /* v94.63 · cierres = nube/almacén ∪ marca local del dispositivo (no vuelve a salir aunque la nube tarde) */
  var o = {};
  try{ var a = cargarLS(CLAVE_CIERRES, {}) || {}; Object.keys(a).forEach(function(k){ o[k] = a[k]; }); }catch(e){}
  try{ var l = JSON.parse(localStorage.getItem(_cierresLocalKey()) || '{}') || {}; Object.keys(l).forEach(function(k){ if (!o[k]) o[k] = l[k]; }); }catch(e){}
  return o;
}""", tag='P5a cierres')

rep("""  const c = _cierres(); c[mes] = hoyISO(); guardarLS(CLAVE_CIERRES, c);""",
"""  const c = _cierres(); c[mes] = c[mes] || hoyISO(); guardarLS(CLAVE_CIERRES, c);
  try{ localStorage.setItem(_cierresLocalKey(), JSON.stringify(c)); }catch(e){}""", tag='P5b marcar')

rep("""    const mes = mesAnteriorPlan();
    if (!mes || _cierres()[mes]) return;""", """    /* v94.63 · solo con los datos reales ya cargados (nube lista y recuperación hecha) */
    try{ if (typeof Almacen !== 'undefined' && Almacen.estado === 'cargando' && intentos < 40){ setTimeout(()=>comprobarCierreMes(intentos + 1), 750); return; } }catch(e){}
    const mes = mesAnteriorPlan();
    if (!mes || _cierres()[mes]) return;
    try{ const sk = 'fx_cierre_auto_' + mes; if (sessionStorage.getItem(sk) === '1') return; sessionStorage.setItem(sk, '1'); }catch(e){}""", tag='P5c comprobar')

rep("""    setTimeout(()=>comprobarCierreMes(0), 2500);""",
"""    setTimeout(()=>{ try{ var _pl = (window.FluxiaRecV63 && FluxiaRecV63.listo) ? FluxiaRecV63.listo : Promise.resolve(); _pl.then(()=>comprobarCierreMes(0), ()=>comprobarCierreMes(0)); }catch(e){ comprobarCierreMes(0); } }, 2500);""", tag='P5d boot cierre')

# ── P6 · Banco→fijo: reglas/revisados de antes de v94.57 siguen valiendo (no repreguntar) ──
rep("""  function leerReglas(){ try{ return JSON.parse(localStorage.getItem(REGLAS_KEY())||'{}')||{}; }catch(e){ return {}; } }""",
"""  function leerReglas(){
    var r = {};
    try{ r = JSON.parse(localStorage.getItem(REGLAS_KEY())||'{}')||{}; }catch(e){ r = {}; }
    /* v94.63 · el dueño conserva lo aprendido antes de v94.57 (clave sin perfil) */
    try{
      if (typeof fluxiaEsDueno === 'function' && fluxiaEsDueno()){
        var g = JSON.parse(localStorage.getItem('fluxia_banco_reglas_fijos_v1')||'{}')||{};
        Object.keys(g).forEach(function(k){ if (!r[k]) r[k] = g[k]; });
      }
    }catch(e){}
    return r;
  }""", tag='P6a reglas')

rep("""  function leerRev(){ try{ var a=JSON.parse(localStorage.getItem(REV_KEY())||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }""",
"""  function leerRev(){
    var a = [];
    try{ a = JSON.parse(localStorage.getItem(REV_KEY())||'[]'); if (!Array.isArray(a)) a = []; }catch(e){ a = []; }
    /* v94.63 · los ya revisados antes de v94.57 no se vuelven a preguntar (solo son ids: inofensivo) */
    try{ var g = JSON.parse(localStorage.getItem('fluxia_banco_fijos_rev_v1')||'[]'); if (Array.isArray(g) && g.length){ var s = {}; a.forEach(function(x){ s[x]=1; }); g.forEach(function(x){ if (!s[x]){ s[x]=1; a.push(x); } }); } }catch(e){}
    return a;
  }""", tag='P6b rev')

# ── P7 · Conexiones/bancos conocidos: el dueño no pierde los suyos por el cambio de clave de v94.60 ──
rep("""  function leerConexiones(){
    try{ const a=JSON.parse(localStorage.getItem(CX_KEY())||'[]'); return Array.isArray(a)?a:[]; }catch(_){ return []; }""",
"""  function leerConexiones(){
    try{
      const a=JSON.parse(localStorage.getItem(CX_KEY())||'[]');
      if (Array.isArray(a) && a.length) return a;
      /* v94.63 · solo el dueño: leer (sin borrar) la caché global anterior a v94.60 */
      if (typeof fluxiaEsDueno==='function' && fluxiaEsDueno()){
        const g=JSON.parse(localStorage.getItem('fluxia_banco_conexiones_v1')||'[]');
        if (Array.isArray(g) && g.length) return g;
      }
      return Array.isArray(a)?a:[];
    }catch(_){ return []; }""", tag='P7a conexiones')

rep("""    try{ const o=JSON.parse(localStorage.getItem(KNOWN_KEY())||'null'); if(o&&typeof o==='object') return o; }catch(_){}""",
"""    try{ const o=JSON.parse(localStorage.getItem(KNOWN_KEY())||'null'); if(o&&typeof o==='object') return o; }catch(_){}
    /* v94.63 · dueño: conservar los cortes de cada banco de antes de v94.60 (si no, el corte pasaba a HOY) */
    try{
      if (typeof fluxiaEsDueno==='function' && fluxiaEsDueno()){
        const g=JSON.parse(localStorage.getItem('fluxia_bancos_conocidos_v62')||'null');
        if (g && typeof g==='object' && Object.keys(g).length){ try{ localStorage.setItem(KNOWN_KEY(), JSON.stringify(g)); }catch(_){} return g; }
      }
    }catch(_){}""", tag='P7b conocidos')

# ── P8 · Doble confirmación en borrados nuevos de v94.58–v94.61 (PRINCIPIO #14) ──
rep("""          var ok = confirm('¿Borrar esta aportación? Se guardará en la papelera.');""",
"""          var ok = window.fxConfirm2 ? window.fxConfirm2('¿Borrar esta aportación? Se guardará en la papelera.') : false;""", tag='P8a aport')
rep("""        if (!confirm('¿Borrar este movimiento?')) return;""",
"""        if (!(window.fxConfirm2 && window.fxConfirm2('¿Borrar este movimiento de la hucha? Se guardará en la papelera.'))) return;""", tag='P8b uso')
rep("""      if(!confirm('¿Eliminar esta aportación? Irá a la papelera.')) return;""",
"""      if(!(window.fxConfirm2 && window.fxConfirm2('¿Eliminar esta aportación? Irá a la papelera.'))) return;""", tag='P8c aport60')
rep("""    if(v) v.onclick=function(){ if(confirm('¿Vaciar papelera? No se puede deshacer.')){ vaciar(); pintarUI(); } };""",
"""    if(v) v.onclick=function(){ if(window.fxConfirm2 && window.fxConfirm2('¿Vaciar papelera? No se puede deshacer.')){ vaciar(); pintarUI(); } };""", tag='P8d vaciar')
rep("""    box.querySelectorAll('[data-fx-del]').forEach(function(b){ b.onclick=function(){ borrarDef(b.getAttribute('data-fx-del')); pintarUI(); }; });""",
"""    box.querySelectorAll('[data-fx-del]').forEach(function(b){ b.onclick=function(){ if(!(window.fxConfirm2 && window.fxConfirm2('¿Borrar definitivamente este elemento de la papelera?'))) return; borrarDef(b.getAttribute('data-fx-del')); pintarUI(); }; });""", tag='P8e borrarDef')

# ── P9 · Exportar «solo este perfil»: leer su espacio real de Almacen ──
rep("""        if (k.indexOf(pref)===0 || (pref==='planRescate_v2_' && /^planRescate_v2_[^u]/.test(k) && k.indexOf('planRescate_v2_u_')<0)){""",
"""        /* v94.63: el plan vive en el espacio de Almacen del perfil (fluxia_user_<id>__) o crudo si es legacy */
        try{ if (typeof Almacen!=='undefined' && !Almacen.esLegacy && Almacen.localPrefix && k.indexOf(Almacen.localPrefix)===0){ data.keys[k] = localStorage.getItem(k); continue; } }catch(_e){}
        if (k.indexOf(pref)===0 || (pref==='planRescate_v2_' && /^planRescate_v2_[^u]/.test(k) && k.indexOf('planRescate_v2_u_')<0)){""", tag='P9 export')

# ── P10 · post-load v94.62: ya no vacía nada ──
rep("""/* v94.62 · Tras cargar: si perfil aislado → plan a 0 en memoria (nunca toca datos del dueño) */
(function(){
  function run(){""", """/* v94.62 · Tras cargar: si perfil aislado → plan a 0 en memoria (nunca toca datos del dueño)
   v94.63 · NEUTRALIZADO: migrar y vaciar están desactivados (ver fluxiaForzarVacioSiAislado). */
(function(){
  return;
  function run(){""", tag='P10 postload off')


# ── P11 · v91.5 «recuperación total»: SOLO claves de este perfil y SOLO si la lista está VACÍA ──
rep("""        var k = localStorage.key(i);
        if (!k) continue;
        var raw = localStorage.getItem(k);
        if (!raw || raw.length < 3) continue;""", """        var k = localStorage.key(i);
        if (!k) continue;
        /* v94.63 · antes cogía la lista MÁS LARGA de cualquier clave (otro usuario, espacio u_, copias
           viejas) y SUSTITUÍA la actual si era más corta → borrar un gasto lo hacía volver y lo nuevo
           desaparecía. Ahora: solo claves de este perfil. */
        try{
          if (k.indexOf('planRescate_v2_u_') >= 0) continue;
          if (typeof Almacen === 'undefined') continue;
          if (Almacen.esLegacy){ if (k.indexOf('fluxia_user_') === 0) continue; }
          else if (!Almacen.localPrefix || k.indexOf(Almacen.localPrefix) !== 0) continue;
        }catch(_k){ continue; }
        var raw = localStorage.getItem(k);
        if (!raw || raw.length < 3) continue;""", tag='P11a collectBest')
rep("""        if (!Array.isArray(cur) || cur.length < arr.length){
          try{ eval(gName + ' = arr'); }catch(e){}""", """        if (!Array.isArray(cur) || cur.length === 0){ /* v94.63: solo si está VACÍA (antes: si era más corta) */
          try{ eval(gName + ' = arr'); }catch(e){}""", tag='P11b solo vacia')


# ── P12 · Veto de borrados: un gasto MANUAL borrado solo se veta por su id (no por fecha+importe) ──
rep("""      banco: ban,
      concepto: String(mv.concepto||'').slice(0,80),
      cuando: new Date().toISOString()
    };
    var list = leer();""", """      banco: ban,
      concepto: String(mv.concepto||'').slice(0,80),
      cuando: new Date().toISOString(),
      /* v94.63 · manual = no viene del banco: solo se veta por su id */
      manual: !(mv.origen === 'banco' || mv.bancoRef)
    };
    var list = leer();""", tag='P12a manual')
rep("""    if(entry.id) pushBl(entry.id);
    if(f && cents){""", """    if(entry.id) pushBl(entry.id);
    if(f && cents && !entry.manual){ /* v94.63: huellas fecha+importe solo para cargos del banco */""", tag='P12b huellas')
rep("""    if(x.bancoRef && mid && (mid.indexOf(x.bancoRef)>=0 || x.bancoRef.indexOf(mid)>=0)) return true;
    var f = String(m.fecha||'').slice(0,10);""", """    if(x.bancoRef && mid && (mid.indexOf(x.bancoRef)>=0 || x.bancoRef.indexOf(mid)>=0)) return true;
    /* v94.63 · Borrado de un gasto MANUAL (marcado, o registro antiguo sin cargo de banco: bancoRef==id y sin banco):
       solo coincide por id. Antes «misma fecha + mismo importe» quitaba también cargos reales del banco. */
    if (x.manual || (x.id && x.bancoRef === x.id && !x.banco)) return false;
    var f = String(m.fecha||'').slice(0,10);""", tag='P12c match')

io.open(DST, 'w', encoding='utf-8').write(s)
print('PARCHES OK:', n_ok)

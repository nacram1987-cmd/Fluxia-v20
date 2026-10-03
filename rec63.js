/* ═══════════════════════════════════════════════════════════════════════════
   v94.63 · FluxiaRecV63 · RECUPERACIÓN DE DATOS PARTIDOS ENTRE v94.55 Y v94.62
   Qué pasó (verificado en el código de v94.62):
   1) LS_PREFIX pasó a planRescate_v2_u_<id>_ → el plan se escribía en un sitio nuevo y el de
      siempre (planRescate_v2_*) quedaba congelado. Dos versiones del plan.
   2) fluxiaForzarVacioSiAislado() ponía movimientos, huchas y rescates a [] 400 ms después de abrir
      (también al dueño: el onboarding le marcaba «aislado»). AntiCero/nube los volvían a meter.
      Si entre medias se guardaba algo (p. ej. un cargo del banco), lo anterior salía de la lista
      y solo quedaba en la papelera.
   Qué hace (aditivo, nunca borra):
   · Une el espacio u_ de ESTE perfil con el de siempre (por id; si el mismo id está en los dos,
     gana la versión con fecha de guardado más reciente).
   · Ignora lo vetado (gastos borrados a mano / del banco, presupuestos borrados) y lo que en
     realidad es de OTRO perfil del dispositivo.
   · Devuelve desde la papelera los rescates y gastos variables que se perdieron SOLOS desde
     anoche (no los que borraste tú con el botón).
   · Copia previa en fluxia_v63_pre_<id> + informe con botón «Quitar» por elemento.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  var VENTANA_DESDE = Date.parse('2026-10-02T18:00:00Z');   /* «desde anoche» (v94.54 en adelante) */
  var LISTAS = ['ingresos','fijos','movimientos','provisiones','financiaciones','compartidos','usos','historico','presupuestos'];
  var NOMBRE = { ingresos:'Ingresos', fijos:'Gastos fijos', movimientos:'Gastos variables', provisiones:'Huchas',
    financiaciones:'Financiaciones', compartidos:'Compartidos', usos:'Rescates de hucha', historico:'Reposiciones de hucha', presupuestos:'Presupuestos' };

  function pid(){ try{ return (window.FLUXIA_PROFILE && FLUXIA_PROFILE.id) ? String(FLUXIA_PROFILE.id) : ''; }catch(e){ return ''; } }
  function sid(){ return pid().replace(/[^a-zA-Z0-9_-]/g,'').slice(0,40); }
  function Alm(){ try{ return (typeof Almacen !== 'undefined') ? Almacen : null; }catch(e){ return null; } }
  function hash(s){ s = String(s == null ? '' : s); var h = 5381; for (var i=0;i<s.length;i++){ h = ((h<<5) + h + s.charCodeAt(i)) | 0; } return s.length + ':' + (h>>>0).toString(36); }
  function parse(raw){ try{ return raw ? JSON.parse(raw) : null; }catch(e){ return null; } }
  function lsJ(k, def){ try{ var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? def : v; }catch(e){ return def; } }
  function lsSetJ(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; } }
  function idOf(x){ return (x && typeof x === 'object' && x.id != null) ? String(x.id) : null; }
  function firma(x){ try{ return JSON.stringify(x); }catch(e){ return ''; } }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]; }); }
  function eurTxt(n){ try{ return (typeof eur === 'function') ? eur(Number(n)||0, 2) : ((Number(n)||0).toFixed(2) + ' €'); }catch(e){ return String(n); } }
  function nombreDe(x){ if (!x || typeof x !== 'object') return '—'; return String(x.concepto || x.nombre || x.motivo || x.categoria || x.persona || x.provisionNombre || x.id || '—'); }

  function vetadoMov(m){
    try{
      if (!window.FluxiaGVBorrados || !FluxiaGVBorrados.debeIgnorarBanco) return false;
      var probe = { id: m.bancoRef || m.id, fecha: m.fecha, importe: m.importe, concepto: m.concepto, banco: m.banco || '' };
      return !!FluxiaGVBorrados.debeIgnorarBanco(probe, m.banco || '');
    }catch(e){ return false; }
  }
  function presBorrados(){ var a = lsJ('fluxia_presupuestos_borrados_v1', []); return Array.isArray(a) ? a.map(String) : []; }

  /* ids que pertenecen a OTRO perfil del dispositivo (o al espacio crudo legacy si yo no soy legacy):
     si algo del espacio u_ solo coincide con eso, es una copia ajena (v94.62 copiaba claves crudas) */
  function idsAjenos(S){
    var out = {}, A = Alm(); if (!A) return out;
    var lp = A.localPrefix || '';
    try{
      for (var i=0;i<localStorage.length;i++){
        var k = localStorage.key(i); if (!k) continue;
        var ajena = false;
        if (k === 'planRescate_v2_' + S && !A.esLegacy) ajena = true;
        else if (k.indexOf('fluxia_user_') === 0 && /__planRescate_v2_[a-z]+$/.test(k) && k.slice(-('__planRescate_v2_' + S).length) === '__planRescate_v2_' + S && (A.esLegacy || k.indexOf(lp) !== 0)) ajena = true;
        if (!ajena) continue;
        var arr = parse(localStorage.getItem(k));
        if (Array.isArray(arr)) arr.forEach(function(x){ var id = idOf(x); if (id) out[id] = 1; });
      }
    }catch(e){}
    return out;
  }

  function leerBase(S){ var A = Alm(); try{ var r = A ? A.getItem(claveLS('planRescate_v2_' + S)) : null; return { raw: r, val: parse(r) }; }catch(e){ return { raw:null, val:null }; } }
  function leerU(S){
    var A = Alm(), s = sid(); if (!A || !s) return { raw:null, val:null, k:null };
    var k = 'planRescate_v2_u_' + s + '_' + S;
    var r = null; try{ r = A.getItem(k); }catch(e){}
    return { raw: r, val: parse(r), k: k };
  }

  function unirLista(S, base, u, uMasNuevo, ajenos, inf){
    var out = base.slice(), byId = {}, byRef = {}, firmas = {}, blp = (S === 'presupuestos') ? presBorrados() : [];
    out.forEach(function(x, i){ var id = idOf(x); if (id) byId[id] = i; if (x && x.bancoRef) byRef[String(x.bancoRef)] = i; firmas[firma(x)] = 1; });
    var cambios = 0;
    u.forEach(function(x){
      if (!x || typeof x !== 'object') return;
      var id = idOf(x);
      if (S === 'movimientos' && vetadoMov(x)){ inf.omitidos++; return; }
      if (S === 'presupuestos' && blp.indexOf(String(x.categoria)) >= 0){ inf.omitidos++; return; }
      if (id && byId[id] != null){
        var actual = out[byId[id]];
        if (uMasNuevo && firma(actual) !== firma(x)){
          inf.actualizados.push({ S: S, antes: actual, ahora: x });
          out[byId[id]] = x; cambios++;
        }
        return;
      }
      if (x.bancoRef && byRef[String(x.bancoRef)] != null) return;        /* mismo cargo del banco con otro id */
      if (!id && firmas[firma(x)]) return;
      if (id && ajenos[id]){ inf.omitidos++; return; }                     /* copia de otro perfil */
      out.push(x); cambios++;
      if (id) byId[id] = out.length - 1;
      if (x.bancoRef) byRef[String(x.bancoRef)] = out.length - 1;
      inf.anadidos.push({ S: S, item: x, origen: 'v94.55–62' });
    });
    return { lista: out, cambios: cambios };
  }

  /* Papelera: lo que se perdió SOLO (autoDiff) desde anoche. No lo borrado a mano. */
  function entradasPapelera(){
    var p = pid(), res = [], vistos = {};
    function add(e){ if (!e) return; var k = e.id || firma(e).slice(0,200); if (vistos[k]) return; vistos[k] = 1; res.push(e); }
    try{ (lsJ('fluxia_papelera_v2_' + p, []) || []).forEach(add); }catch(e){}
    try{ var A = Alm(); var r = A && A.getItem('fluxia_papelera_v2_' + p); var a = parse(r); if (Array.isArray(a)) a.forEach(add); }catch(e){}
    var v1 = [];
    try{ v1 = lsJ('fluxia_papelera_v1_' + p, []) || []; }catch(e){}
    return { v2: res, v1: Array.isArray(v1) ? v1 : [] };
  }
  function recuperarDePapelera(listas, inf){
    var pap = entradasPapelera(), explicitosUso = {}, cambios = { usos:0, movimientos:0 };
    pap.v2.forEach(function(e){ if (e && e.tipo === 'Uso hucha' && e.snapshot && e.snapshot.id != null) explicitosUso[String(e.snapshot.id)] = 1; });
    function enVentana(t){ var n = (typeof t === 'number') ? t : Date.parse(t || ''); return !isNaN(n) && n >= VENTANA_DESDE; }
    function meter(S, it){
      if (!it || typeof it !== 'object') return;
      var lst = listas[S]; if (!Array.isArray(lst)) return;
      var id = idOf(it);
      if (id && lst.some(function(x){ return idOf(x) === id; })) return;
      if (it.bancoRef && lst.some(function(x){ return x && x.bancoRef && String(x.bancoRef) === String(it.bancoRef); })) return;
      if (S === 'movimientos' && vetadoMov(it)){ inf.omitidos++; return; }
      if (S === 'usos' && id && explicitosUso[id]) return;
      lst.push(it); cambios[S]++;
      inf.anadidos.push({ S: S, item: it, origen: 'papelera' });
    }
    pap.v2.forEach(function(e){
      if (!e || !e.snapshot || !enVentana(e.when)) return;
      var key = String(e.key || '');
      if (/planRescate_v2_usos$/.test(key) && e.tipo !== 'Uso hucha') meter('usos', e.snapshot);
      else if (/planRescate_v2_movimientos$/.test(key) && e.tipo === 'Gasto variable') meter('movimientos', e.snapshot);
    });
    pap.v1.forEach(function(e){
      if (!e || !enVentana(e.borradoEn)) return;
      var it = (e.item && e.item.item) ? e.item.item : e.item;
      if (e.tipo === 'movimiento') meter('movimientos', it);
    });
    return cambios;
  }

  var _corriendo = false, _resolverListo = null, _yaListo = false;
  var listo = new Promise(function(res){ _resolverListo = res; });
  function marcarListo(){ if (_yaListo) return; _yaListo = true; try{ _resolverListo(); }catch(e){} }
  setTimeout(marcarListo, 25000);

  function ejecutar(opts){
    opts = opts || {};
    if (_corriendo) return null;
    var p = pid(), A = Alm();
    if (!p || !A) return null;
    try{ if (window.FLUXIA_PROFILE && FLUXIA_PROFILE.newUser && FLUXIA_PROFILE.onboardingPending) return null; }catch(e){}
    _corriendo = true;
    var inf = { cuando: new Date().toISOString(), version: (window.FLUXIA_VERSION || ''), anadidos: [], actualizados: [], omitidos: 0 };
    var hechos = lsJ('fluxia_v63_merge_' + p, {}) || {};
    var listas = {}, raws = {}, tocadas = {};
    try{
      var esDuenoP = (typeof fluxiaEsDueno === 'function') ? fluxiaEsDueno() : false;
      LISTAS.forEach(function(S){
        var b = leerBase(S); raws[S] = b.raw;
        listas[S] = Array.isArray(b.val) ? b.val.slice() : [];
        var u = leerU(S);
        if (!u.raw || u.raw === '[]' || u.raw === 'null') return;
        var h = hash(u.raw);
        if (!opts.forzar && hechos[S] === h) return;
        var uArr = Array.isArray(u.val) ? u.val : [];
        var tsB = 0, tsU = 0;
        try{ tsB = A.tsDe(claveLS('planRescate_v2_' + S)); tsU = A.tsDe(u.k); }catch(e){}
        var uMasNuevo = tsU > tsB;
        var r = unirLista(S, listas[S], uArr, uMasNuevo, esDuenoP && A.esLegacy ? {} : idsAjenos(S), inf);
        listas[S] = r.lista; if (r.cambios) tocadas[S] = 1;
        hechos[S] = h;
      });
      /* objetos: cierres (unión) y efectivo (el más reciente, sin perder movimientos del otro) */
      try{
        var ck = 'planRescate_v2_cierres', cb = parse(A.getItem(claveLS(ck))) || {}, cu = parse(A.getItem('planRescate_v2_u_' + sid() + '_cierres')) || {}, cc = 0;
        Object.keys(cu).forEach(function(m){ if (!cb[m]){ cb[m] = cu[m]; cc++; } });
        if (cc){ guardarLS(ck, cb); }
        try{ var lk = 'fluxia_cierres_vistos_v63_' + p, l = lsJ(lk, {}) || {}; Object.keys(cb).forEach(function(m){ if (!l[m]) l[m] = cb[m]; }); lsSetJ(lk, l); }catch(e){}
      }catch(e){}
      try{
        var ekB = claveLS('planRescate_v2_efectivo'), ekU = 'planRescate_v2_u_' + sid() + '_efectivo';
        var eB = parse(A.getItem(ekB)), rawEU = A.getItem(ekU), eU = parse(rawEU);
        if (eU && typeof eU === 'object' && Array.isArray(eU.movimientos) && hechos.efectivo !== hash(rawEU)){
          var nuevoU = A.tsDe(ekU) > A.tsDe(ekB);
          var gana, otro;
          if (nuevoU || !eB){ gana = JSON.parse(JSON.stringify(eU)); otro = eB || { movimientos: [] }; }
          else { gana = JSON.parse(JSON.stringify(eB)); otro = eU; }
          if (!Array.isArray(gana.movimientos)) gana.movimientos = [];
          var ids = {}; gana.movimientos.forEach(function(x){ var id = idOf(x); if (id) ids[id] = 1; });
          (otro.movimientos || []).forEach(function(x){ var id = idOf(x); if (id && !ids[id]){ gana.movimientos.push(x); ids[id] = 1; inf.anadidos.push({ S:'efectivo', item:x, origen:'v94.55–62' }); } });
          if (firma(gana) !== firma(eB)){ raws.efectivo = A.getItem(ekB); tocadas.efectivo = 1; listas.efectivo = gana; }
          hechos.efectivo = hash(rawEU);
        }
      }catch(e){}
      /* papelera: una sola vez por perfil */
      if (opts.forzar || !localStorage.getItem('fluxia_v63_pap_' + p)){
        var pc = recuperarDePapelera(listas, inf);
        if (pc.usos) tocadas.usos = 1;
        if (pc.movimientos) tocadas.movimientos = 1;
        try{ localStorage.setItem('fluxia_v63_pap_' + p, new Date().toISOString()); }catch(e){}
      }
      var claves = Object.keys(tocadas);
      if (claves.length){
        /* copia previa (se conservan las 3 últimas) */
        try{
          var pre = lsJ('fluxia_v63_pre_' + p, []); if (!Array.isArray(pre)) pre = [];
          var snap = { cuando: inf.cuando, claves: {} };
          claves.forEach(function(S){ snap.claves[S] = raws[S] || null; });
          pre.unshift(snap); lsSetJ('fluxia_v63_pre_' + p, pre.slice(0, 3));
        }catch(e){}
        try{ window._FLUXIA_SIN_PAPELERA = true; }catch(e){}
        try{
          claves.forEach(function(S){ guardarLS('planRescate_v2_' + S, listas[S]); });
        }finally{ try{ window._FLUXIA_SIN_PAPELERA = false; }catch(e){} }
        try{ if (typeof cargarTodo === 'function') cargarTodo(); }catch(e){ console.warn('[v94.63] cargarTodo', e); }
        try{ if (typeof renderAll === 'function') renderAll(); }catch(e){}
        if (inf.anadidos.length || inf.actualizados.length){
          var prev = lsJ('fluxia_v63_informe_' + p, null);
          if (prev && Array.isArray(prev.anadidos)){ inf.anadidos = prev.anadidos.concat(inf.anadidos); inf.actualizados = (prev.actualizados || []).concat(inf.actualizados); inf.omitidos += (prev.omitidos || 0); }
          inf.visto = false;
          lsSetJ('fluxia_v63_informe_' + p, inf);
          try{ if (typeof mostrarToast === 'function') mostrarToast('🛟 Datos recuperados: ' + resumenTxt(inf), 'var(--teal)', 4500); }catch(e){}
        }
      }
      lsSetJ('fluxia_v63_merge_' + p, hechos);
    }catch(e){ console.warn('[v94.63] recuperación', e); }
    finally{ _corriendo = false; }
    try{ pintarAviso(); }catch(e){}
    return inf;
  }

  function contar(inf){
    var c = {};
    (inf.anadidos || []).forEach(function(a){ c[a.S] = (c[a.S] || 0) + 1; });
    return c;
  }
  function resumenTxt(inf){
    var c = contar(inf), partes = [];
    Object.keys(c).forEach(function(S){ partes.push(c[S] + ' ' + (NOMBRE[S] || S).toLowerCase()); });
    if ((inf.actualizados || []).length) partes.push(inf.actualizados.length + ' actualizados');
    return partes.join(' · ') || 'nada que recuperar';
  }

  function pintarAviso(){
    var p = pid(); if (!p) return;
    var inf = lsJ('fluxia_v63_informe_' + p, null);
    var box = document.getElementById('fxRecV63Aviso');
    if (!inf || inf.visto || !((inf.anadidos || []).length || (inf.actualizados || []).length)){ if (box) box.remove(); return; }
    var anc = document.getElementById('dashAvisosInicio'), pan = document.getElementById('panel-resumen');
    if (!anc && !pan) return;
    if (!box || !box.isConnected){
      if (box) box.remove();
      box = document.createElement('div'); box.id = 'fxRecV63Aviso';
      box.style.cssText = 'margin:0 0 12px;padding:12px 14px;border-radius:14px;border:1px solid rgba(14,124,144,.25);border-left:4px solid var(--teal);background:var(--surface);font-size:.84rem;';
      /* fuera de #dashAvisosInicio (se repinta entero) → justo antes, como hermano */
      if (anc && anc.parentNode) anc.parentNode.insertBefore(box, anc);
      else pan.insertBefore(box, pan.firstChild);
    }
    box.innerHTML = '<b>🛟 Recuperado tras el fallo de v94.55–v94.62</b><div style="margin-top:4px;color:var(--ink);">' + esc(resumenTxt(inf)) + '</div>' +
      '<div style="font-size:.75rem;color:var(--muted);margin-top:4px;">Revisa la lista: si algo lo habías borrado tú a propósito, quítalo desde aquí.</div>' +
      '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">' +
      '<button type="button" id="fxRecV63Ver" style="border:0;background:var(--teal);color:#fff;border-radius:10px;padding:8px 12px;font-weight:700;font-size:.78rem;cursor:pointer;min-height:40px;">Ver detalle</button>' +
      '<button type="button" id="fxRecV63Ok" style="border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:10px;padding:8px 12px;font-weight:650;font-size:.78rem;cursor:pointer;min-height:40px;">Entendido</button></div>';
    document.getElementById('fxRecV63Ver').onclick = verInforme;
    document.getElementById('fxRecV63Ok').onclick = function(){ inf.visto = true; lsSetJ('fluxia_v63_informe_' + p, inf); box.remove(); };
  }

  function listaGlobal(S){
    try{
      if (S === 'movimientos') return movimientos;
      if (S === 'ingresos') return ingresosItems;
      if (S === 'fijos') return gastosFijosItems;
      if (S === 'provisiones') return provisiones;
      if (S === 'financiaciones') return financiaciones;
      if (S === 'compartidos') return gastosCompartidos;
      if (S === 'usos') return usosProvisiones;
      if (S === 'historico') return historicoReposiciones;
      if (S === 'presupuestos') return presupuestos;
    }catch(e){}
    return null;
  }
  function guardarS(S){
    try{
      if (S === 'movimientos') return _guardarMovimientosTrasBorrado();
      if (S === 'usos' || S === 'historico') return guardarUsos();
      var mapa = { ingresos:'guardarIngresos', fijos:'guardarFijos', provisiones:'guardarProvisiones', financiaciones:'guardarFinanciaciones', compartidos:'guardarCompartidos', presupuestos:'guardarPresupuestos' };
      var fn = window[mapa[S]]; if (typeof fn === 'function') return fn();
      var lst = listaGlobal(S); if (lst) guardarLS('planRescate_v2_' + S, lst);
    }catch(e){ console.warn('[v94.63] guardar', S, e); }
  }
  /* Quitar un elemento recuperado (doble confirmación · PRINCIPIO #14). Va a la papelera como cualquier borrado. */
  function quitarRecuperado(i){
    var p = pid(), inf = lsJ('fluxia_v63_informe_' + p, null); if (!inf) return;
    var a = (inf.anadidos || [])[i]; if (!a) return;
    if (!(window.fxConfirm2 && window.fxConfirm2('¿Quitar «' + nombreDe(a.item) + '» (' + (NOMBRE[a.S] || a.S) + ')?\n\nSolo si lo habías borrado tú a propósito. Irá a la papelera.'))) return;
    var id = idOf(a.item);
    if (a.S === 'efectivo'){
      try{ efectivo.movimientos = (efectivo.movimientos || []).filter(function(x){ return idOf(x) !== id; }); guardarEfectivo(); }catch(e){}
    } else {
      var lst = listaGlobal(a.S);
      if (lst && id){
        var ix = lst.findIndex(function(x){ return idOf(x) === id; });
        if (ix >= 0){
          var quitado = lst.splice(ix, 1)[0];
          if (a.S === 'movimientos'){ try{ if (window._fluxiaRegistrarBorradoGV) _fluxiaRegistrarBorradoGV(quitado); }catch(e){} }
          guardarS(a.S);
        }
      }
    }
    inf.anadidos.splice(i, 1);
    lsSetJ('fluxia_v63_informe_' + p, inf);
    try{ renderAll(); }catch(e){}
    try{ if (typeof mostrarToast === 'function') mostrarToast('Quitado: ' + nombreDe(a.item), 'var(--teal)', 2400); }catch(e){}
    verInforme(); pintarAviso();
  }
  /* Volver a la versión anterior de un elemento actualizado (doble confirmación) */
  function usarAnterior(i){
    var p = pid(), inf = lsJ('fluxia_v63_informe_' + p, null); if (!inf) return;
    var a = (inf.actualizados || [])[i]; if (!a) return;
    if (!(window.fxConfirm2 && window.fxConfirm2('¿Volver a la versión anterior de «' + nombreDe(a.antes) + '»?'))) return;
    var lst = listaGlobal(a.S), id = idOf(a.antes);
    if (lst && id){
      var ix = lst.findIndex(function(x){ return idOf(x) === id; });
      if (ix >= 0){ lst[ix] = a.antes; guardarS(a.S); }
    }
    inf.actualizados.splice(i, 1);
    lsSetJ('fluxia_v63_informe_' + p, inf);
    try{ renderAll(); }catch(e){}
    verInforme(); pintarAviso();
  }

  function verInforme(){
    var p = pid(), inf = lsJ('fluxia_v63_informe_' + p, null);
    var box = document.getElementById('fxRecV63Modal');
    if (!box){
      box = document.createElement('div'); box.id = 'fxRecV63Modal';
      box.style.cssText = 'position:fixed;inset:0;z-index:60070;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center;padding:12px;';
      document.body.appendChild(box);
    }
    box.style.display = 'flex';
    var h = '<div style="background:var(--surface);border-radius:18px 18px 12px 12px;max-width:520px;width:100%;max-height:82vh;overflow:auto;padding:16px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><b>🛟 Recuperación v94.63</b><button type="button" id="fxRecV63Cerrar" style="border:none;background:none;font-size:1.3rem;cursor:pointer;">×</button></div>';
    if (!inf || (!(inf.anadidos || []).length && !(inf.actualizados || []).length)){
      h += '<p style="font-size:.84rem;color:var(--muted);">No había nada que recuperar en este perfil.</p>';
    } else {
      h += '<p style="font-size:.78rem;color:var(--muted);margin:0 0 10px;">Se ha unido lo que v94.55–v94.62 guardó aparte con tu plan de siempre, y se ha devuelto lo que se perdió solo desde anoche. ' +
        'Omitidos por estar vetados o ser de otro usuario: ' + (inf.omitidos || 0) + '.</p>';
      var grupos = {};
      (inf.anadidos || []).forEach(function(a, i){ (grupos[a.S] = grupos[a.S] || []).push({ a: a, i: i }); });
      Object.keys(grupos).forEach(function(S){
        h += '<div style="font-weight:700;margin:10px 0 4px;">' + esc(NOMBRE[S] || S) + ' · ' + grupos[S].length + '</div>';
        grupos[S].forEach(function(g){
          var it = g.a.item || {};
          h += '<div style="padding:8px 0;border-top:1px solid var(--line);display:flex;justify-content:space-between;gap:8px;align-items:center;">' +
            '<div style="min-width:0;font-size:.82rem;"><div style="font-weight:650;">' + esc(nombreDe(it)) + '</div>' +
            '<div style="font-size:.72rem;color:var(--muted);">' + esc(String(it.fecha || it.mes || '')) + (it.importe != null ? ' · ' + esc(eurTxt(it.importe)) : '') + ' · desde ' + esc(g.a.origen) + '</div></div>' +
            '<button type="button" data-rec63-quitar="' + g.i + '" style="flex-shrink:0;border:1px solid var(--wine);color:var(--wine);background:transparent;border-radius:8px;padding:6px 10px;font-size:.75rem;cursor:pointer;">Quitar</button></div>';
        });
      });
      if ((inf.actualizados || []).length){
        h += '<div style="font-weight:700;margin:12px 0 4px;">Actualizados a la versión más reciente · ' + inf.actualizados.length + '</div>';
        inf.actualizados.forEach(function(a, i){
          h += '<div style="padding:8px 0;border-top:1px solid var(--line);display:flex;justify-content:space-between;gap:8px;align-items:center;">' +
            '<div style="min-width:0;font-size:.82rem;"><div style="font-weight:650;">' + esc(nombreDe(a.ahora)) + '</div><div style="font-size:.72rem;color:var(--muted);">' + esc(NOMBRE[a.S] || a.S) + '</div></div>' +
            '<button type="button" data-rec63-anterior="' + i + '" style="flex-shrink:0;border:1px solid var(--line);color:var(--ink);background:transparent;border-radius:8px;padding:6px 10px;font-size:.75rem;cursor:pointer;">Usar la anterior</button></div>';
        });
      }
    }
    h += '<button type="button" id="fxRecV63Otra" style="margin-top:14px;width:100%;border:1px solid var(--teal);background:transparent;color:var(--teal);border-radius:10px;padding:10px;font-weight:700;cursor:pointer;">Buscar otra vez</button></div>';
    box.innerHTML = h;
    document.getElementById('fxRecV63Cerrar').onclick = function(){ box.style.display = 'none'; };
    document.getElementById('fxRecV63Otra').onclick = function(){ ejecutar({ forzar: true }); verInforme(); };
    box.querySelectorAll('[data-rec63-quitar]').forEach(function(b){ b.onclick = function(){ quitarRecuperado(parseInt(b.getAttribute('data-rec63-quitar'), 10)); }; });
    box.querySelectorAll('[data-rec63-anterior]').forEach(function(b){ b.onclick = function(){ usarAnterior(parseInt(b.getAttribute('data-rec63-anterior'), 10)); }; });
  }

  function cuandoDatosListos(cb){
    var t0 = Date.now();
    (function mirar(){
      var A = Alm();
      var ok = A && A.estado !== 'cargando';
      if (ok || Date.now() - t0 > 20000) return cb();
      setTimeout(mirar, 300);
    })();
  }
  function arrancar(){
    cuandoDatosListos(function(){
      try{ ejecutar(); }catch(e){}
      marcarListo();
      /* si la nube llega más tarde con otra versión del espacio u_, se vuelve a unir (idempotente por hash) */
      try{ var A = Alm(); if (A && A.onEstado) A.onEstado(function(e){ if (e === 'nube') setTimeout(function(){ try{ ejecutar(); }catch(_){} }, 1500); }); }catch(e){}
    });
  }
  window.FluxiaRecV63 = { ejecutar: ejecutar, verInforme: verInforme, listo: listo, _unirLista: unirLista, _VENTANA: VENTANA_DESDE };
  if (document.readyState === 'complete') setTimeout(arrancar, 600);
  else window.addEventListener('load', function(){ setTimeout(arrancar, 600); });
  document.addEventListener('visibilitychange', function(){ if (!document.hidden) setTimeout(function(){ try{ pintarAviso(); }catch(e){} }, 500); });
})();

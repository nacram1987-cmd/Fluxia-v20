/* test_v948.js · reglas v94.8 (ejecutar en consola de la app o con vm si hay harness) */
(function(){
  var ok=0, fail=0, log=[];
  function check(name, cond, detail){ if(cond){ ok++; log.push('✅ '+name); } else { fail++; log.push('❌ '+name+(detail?(' · '+detail):'')); } }

  // 1) ingresosTotal solo cobrados
  check('ingresosCobradosDe existe', typeof ingresosCobradosDe === 'function');
  check('ingresosPrevistosTotal existe', typeof ingresosPrevistosTotal === 'function');
  check('ingresosTotal existe', typeof ingresosTotal === 'function');

  // 2) limpiarCobrosFuturos
  check('limpiarCobrosFuturos existe', typeof limpiarCobrosFuturos === 'function');

  // 3) reset
  check('resetearTodoParaSinCuenta existe', typeof resetearTodoParaSinCuenta === 'function');

  // 4) Simulación local de total
  if (typeof ingresosCobradosDe === 'function' && Array.isArray(ingresosItems)) {
    var mes = (typeof mesSeleccionado !== 'undefined') ? mesSeleccionado : 'octubre';
    var cob = ingresosCobradosDe(mes).reduce(function(s,it){return s+(it.importe||0);},0);
    var tot = ingresosTotal(mes);
    check('ingresosTotal === suma cobrados', Math.abs(cob-tot)<0.001, cob+' vs '+tot);
  }

  // 5) Versión
  check('versión v94.8-LAB', String(window.FLUXIA_VERSION||'').indexOf('94.8')>=0, window.FLUXIA_VERSION);

  console.log(log.join('\n'));
  console.log('RESULTADO: '+(fail===0?'✅ v94.8 OK':'❌ fallos '+fail)+' · '+ok+' ok / '+fail+' fail');
  return {ok:ok, fail:fail, log:log};
})();

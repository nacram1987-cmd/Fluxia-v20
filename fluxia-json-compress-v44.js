// ═══════════════════════════════════════════════════════════════
// FLUXIA v44 JSON COMPRESSION — Keys cortas (-30 KB)
// ═══════════════════════════════════════════════════════════════
// Mapeo bidireccional para comprimir/descomprimir datos en localStorage

const COMPRESSION_MAP = {
  // Ingresos
  'ingresos': 'i',
  'ingresosItems': 'ii',
  'mes': 'm',
  'concepto': 'c',
  'importe': 'imp',
  'origen': 'org',
  
  // Gastos
  'gastos': 'g',
  'gastosFijos': 'gf',
  'gastosFijosItems': 'gfi',
  'nombre': 'n',
  'gastosVariables': 'gv',
  'gastosVariablesItems': 'gvi',
  
  // Provisiones (Huchas)
  'provisiones': 'p',
  'provisionesItems': 'pi',
  'objetivo': 'obj',
  'apartado': 'apt',
  'estado': 'st',
  
  // Usos de provisiones
  'usosProvisiones': 'up',
  'provisionId': 'pid',
  
  // Financiaciones
  'financiaciones': 'f',
  'financiacionesItems': 'fi',
  'saldo': 'sal',
  'tipoInteres': 'ti',
  'interes': 'int',
  'cuota': 'cuo',
  'proxima': 'prox',
  'cantidad': 'qty',
  
  // Movimientos
  'movimientos': 'mov',
  'movimientosItems': 'mi',
  'tipo': 'tp',
  'categoria': 'cat',
  'fecha': 'f',
  'nota': 'nt',
  
  // Compartidos
  'gastosCompartidos': 'gc',
  'gastosCompartidosItems': 'gci',
  'participantes': 'par',
  'pagadoPor': 'pp',
  'repartido': 'rep',
  'persona': 'per',
  'monto': 'mto',
  
  // Efectivo
  'efectivo': 'ef',
  'saldoEfectivo': 'sef',
  'movimientosEfectivo': 'mef',
  
  // Presupuestos
  'presupuestos': 'pr',
  'presupuestosItems': 'pri',
  'limite': 'lim',
  'gastado': 'gst',
  'disponible': 'disp',
  
  // Config general
  'planAnio': 'pa',
  'meses': 'ms',
  'deficitInicial': 'di',
  'fondoObjetivo': 'fo',
  'DATA': 'dt',
  'deficit': 'def',
  'fondo': 'fnd',
  'id': 'id'
};

// Crear mapa inverso
const DECOMPRESSION_MAP = {};
Object.entries(COMPRESSION_MAP).forEach(([larga, corta]) => {
  DECOMPRESSION_MAP[corta] = larga;
});

/**
 * Comprime un objeto reemplazando keys largas por cortas
 */
function comprimeJSON(obj) {
  if (!obj) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(comprimeJSON);
  
  const resultado = {};
  for (const [key, val] of Object.entries(obj)) {
    const keyCorta = COMPRESSION_MAP[key] || key;
    resultado[keyCorta] = typeof val === 'object' ? comprimeJSON(val) : val;
  }
  return resultado;
}

/**
 * Descomprime un objeto reemplazando keys cortas por largas
 */
function descomprimeJSON(obj) {
  if (!obj) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(descomprimeJSON);
  
  const resultado = {};
  for (const [key, val] of Object.entries(obj)) {
    const keyLarga = DECOMPRESSION_MAP[key] || key;
    resultado[keyLarga] = typeof val === 'object' ? descomprimeJSON(val) : val;
  }
  return resultado;
}

/**
 * Guarda un objeto comprimido en localStorage
 */
function guardarComprimido(clave, obj) {
  try {
    const comprimido = comprimeJSON(obj);
    localStorage.setItem(clave, JSON.stringify(comprimido));
    return true;
  } catch (e) {
    console.error('[Compress] Error guardando:', e);
    return false;
  }
}

/**
 * Lee y descomprime un objeto desde localStorage
 */
function leerComprimido(clave) {
  try {
    const json = localStorage.getItem(clave);
    if (!json) return null;
    const comprimido = JSON.parse(json);
    return descomprimeJSON(comprimido);
  } catch (e) {
    console.error('[Compress] Error leyendo:', e);
    return null;
  }
}

// Exportar para uso global
window.FluxiaCompress = {
  comprimeJSON,
  descomprimeJSON,
  guardarComprimido,
  leerComprimido,
  COMPRESSION_MAP,
  DECOMPRESSION_MAP
};

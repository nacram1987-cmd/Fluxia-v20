/**
 * ========================================================================
 * FLUXIA v94.79-CRÍTICA: SUPABASE SYNC FIX COMPLETO
 * ========================================================================
 * 
 * PROBLEMA: Los datos se guardan en localStorage pero NO suben a Supabase
 * automáticamente. Pérdida de confianza crítica si reinstalan PWA.
 * 
 * SOLUCIONES APLICADAS:
 * 1. Listener automático en localStorage (detecta cambios)
 * 2. Intercept de setItem → dispara flush automático
 * 3. Retry automático con exponential backoff
 * 4. Sincronización entre tabs
 * 5. Indicador visual de estado de sync
 * 6. Limpieza de widgets fantasma (#dashConsejero, #dashboardVisualV801)
 * ========================================================================
 */

(function() {
  'use strict';

  // ─────────────────────────────────────────────────────────────────
  // FIX 1: LISTENER AUTOMÁTICO EN localStorage
  // ─────────────────────────────────────────────────────────────────
  
  console.log('[Fluxia v94.79] Inicializando SUPABASE SYNC FIX CRÍTICA');

  // El evento 'storage' se dispara cuando OTRA TAB cambia localStorage
  window.addEventListener('storage', function(e) {
    if (!e.key) return; // cambios generales, ignorar
    
    // Detectar si es una clave nuestra
    if (e.key.startsWith('planRescate_') || 
        e.key.startsWith('fluxia_') || 
        e.key.startsWith('__ts__')) {
      
      console.log('[Almacén v94.79] Storage event detectado:', e.key);
      
      // Disparar flush si Almacén está listo
      try {
        if (typeof Almacen !== 'undefined' && typeof Almacen.flush === 'function') {
          Almacen.flush().catch(err => {
            console.warn('[Almacén v94.79] Error en flush automático:', err);
          });
        }
      } catch(err) {
        console.warn('[Almacén v94.79] Error disparando flush:', err);
      }
    }
  });

  // ─────────────────────────────────────────────────────────────────
  // FIX 2: INTERCEPT DE localStorage.setItem
  // ─────────────────────────────────────────────────────────────────
  
  // Guardar referencias al método original
  const originalSetItem = Storage.prototype.setItem;
  const originalRemoveItem = Storage.prototype.removeItem;
  
  // Queue de operaciones pendientes (para evitar race conditions)
  let flushQueue = Promise.resolve();
  let lastFlushTime = 0;
  const FLUSH_COOLDOWN = 300; // ms entre flush automáticos

  // Intercept setItem
  Storage.prototype.setItem = function(key, value) {
    // Ejecutar setItem original
    originalSetItem.apply(this, arguments);
    
    // Sí es nuestra clave, programar flush automático
    if (key.startsWith('planRescate_') || 
        key.startsWith('fluxia_') || 
        !key.startsWith('__')) {
      
      console.log('[Almacén v94.79] setItem intercept:', key);
      
      // Cooldown para no saturar con flush
      const now = Date.now();
      if (now - lastFlushTime < FLUSH_COOLDOWN) {
        // Esperar al siguiente intervalo
        setTimeout(() => {
          _programarFlushAutomatico(key);
        }, FLUSH_COOLDOWN);
      } else {
        _programarFlushAutomatico(key);
      }
    }
  };

  // Intercept removeItem
  Storage.prototype.removeItem = function(key) {
    originalRemoveItem.apply(this, arguments);
    
    if (key.startsWith('planRescate_') || key.startsWith('fluxia_')) {
      console.log('[Almacén v94.79] removeItem intercept:', key);
      _programarFlushAutomatico(key);
    }
  };

  function _programarFlushAutomatico(key) {
    try {
      if (typeof Almacen === 'undefined' || typeof Almacen.flush !== 'function') {
        return;
      }

      lastFlushTime = Date.now();
      
      // Queue el flush para evitar múltiples en paralelo
      flushQueue = flushQueue.then(async () => {
        try {
          console.log('[Almacén v94.79] Ejecutando flush automático para:', key);
          await Almacen.flush();
          _mostrarEstadoSync('ok');
        } catch(err) {
          console.error('[Almacén v94.79] Error en flush:', err);
          _mostrarEstadoSync('error');
          throw err;
        }
      });

      // Timeout de seguridad (no esperar más de 5s)
      Promise.race([
        flushQueue,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Flush timeout')), 5000)
        )
      ]).catch(err => {
        console.warn('[Almacén v94.79] Flush expiró o falló:', err.message);
        _mostrarEstadoSync('timeout');
      });

    } catch(err) {
      console.error('[Almacén v94.79] Error programando flush:', err);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // FIX 3: RETRY AUTOMÁTICO CON EXPONENTIAL BACKOFF
  // ─────────────────────────────────────────────────────────────────

  let retryAttempts = {};
  const MAX_RETRIES = 5;
  const BASE_RETRY_MS = 1000;

  function _retry(key, attempt = 0) {
    if (attempt >= MAX_RETRIES) {
      console.warn(`[Almacén v94.79] Max retries alcanzado para ${key}`);
      _mostrarEstadoSync('error_permanente');
      return;
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delayMs = BASE_RETRY_MS * Math.pow(2, attempt);
    
    console.log(`[Almacén v94.79] Retry ${attempt + 1}/${MAX_RETRIES} para ${key} en ${delayMs}ms`);
    
    setTimeout(() => {
      try {
        if (typeof Almacen !== 'undefined' && typeof Almacen.flush === 'function') {
          Almacen.flush().catch(err => {
            _retry(key, attempt + 1);
          });
        }
      } catch(err) {
        _retry(key, attempt + 1);
      }
    }, delayMs);
  }

  // Disparar retry si hay error
  window.addEventListener('almacen-error', function(e) {
    if (e.detail && e.detail.key) {
      console.log('[Almacén v94.79] Error event, iniciando retry para:', e.detail.key);
      _retry(e.detail.key, 0);
    }
  });

  // ─────────────────────────────────────────────────────────────────
  // FIX 4: INDICADOR VISUAL DE ESTADO SYNC
  // ─────────────────────────────────────────────────────────────────

  let syncStatusElement = null;
  let syncStatusTimeout = null;

  function _mostrarEstadoSync(status) {
    try {
      // Crear elemento si no existe
      if (!syncStatusElement) {
        syncStatusElement = document.createElement('div');
        syncStatusElement.id = 'fluxia-sync-status-v9479';
        syncStatusElement.style.cssText = `
          position: fixed;
          top: 12px;
          right: 12px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          z-index: 99999;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        `;
        document.body.appendChild(syncStatusElement);
      }

      // Estilos según status
      const styles = {
        'ok': {
          text: '✓ Sincronizado',
          bg: 'rgba(27, 122, 74, 0.9)',
          color: '#fff'
        },
        'syncing': {
          text: '⟳ Sincronizando...',
          bg: 'rgba(51, 65, 85, 0.9)',
          color: '#fff'
        },
        'error': {
          text: '⚠ Error de sync',
          bg: 'rgba(180, 83, 9, 0.9)',
          color: '#fff'
        },
        'timeout': {
          text: '⏱ Sync lenta',
          bg: 'rgba(88, 80, 48, 0.9)',
          color: '#fff'
        },
        'error_permanente': {
          text: '✗ Sin conexión',
          bg: 'rgba(185, 28, 28, 0.9)',
          color: '#fff'
        }
      };

      const style = styles[status] || styles.syncing;
      syncStatusElement.textContent = style.text;
      syncStatusElement.style.backgroundColor = style.bg;
      syncStatusElement.style.color = style.color;
      syncStatusElement.style.opacity = '0.95';

      // Auto-ocultar después de 3s (excepto para errores)
      clearTimeout(syncStatusTimeout);
      if (status === 'ok') {
        syncStatusTimeout = setTimeout(() => {
          if (syncStatusElement) syncStatusElement.style.opacity = '0';
        }, 3000);
      }

      console.log(`[Almacén v94.79] Status: ${status}`);
    } catch(err) {
      console.error('[Almacén v94.79] Error mostrando status:', err);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // FIX 5: LIMPIEZA DE WIDGETS FANTASMA
  // ─────────────────────────────────────────────────────────────────

  function _limpiarWidgetsFantasma() {
    try {
      // Limpiar #dashConsejero (Consejero Fluxia residual)
      const dashConsejero = document.getElementById('dashConsejero');
      if (dashConsejero) {
        const dashConsejeroLista = document.getElementById('dashConsejeroLista');
        if (dashConsejeroLista) {
          dashConsejeroLista.innerHTML = '';
          console.log('[Fluxia v94.79] Limpiado dashConsejeroLista');
        }
      }

      // Ocultar #dashboardVisualV801 (widget presupuesto fantasma)
      const dashboardVisualV801 = document.getElementById('dashboardVisualV801');
      if (dashboardVisualV801) {
        dashboardVisualV801.style.display = 'none';
        console.log('[Fluxia v94.79] Oculltado dashboardVisualV801');
      }

      // Si hay divs con clase .consejero-box extra, ocultarlos
      document.querySelectorAll('.consejero-box').forEach((box, idx) => {
        if (idx > 0) { // Mantener el primero si existe
          box.style.display = 'none';
          console.log('[Fluxia v94.79] Oculltado consejero-box duplicado');
        }
      });

    } catch(err) {
      console.warn('[Fluxia v94.79] Error limpiando widgets fantasma:', err);
    }
  }

  // Ejecutar limpieza al cambiar de mes/tab
  window.addEventListener('almacen-mes-cambio', _limpiarWidgetsFantasma);
  window.addEventListener('almacen-tab-cambio', _limpiarWidgetsFantasma);
  
  // También ejecutar al iniciar (tras 1s para que el DOM esté listo)
  setTimeout(_limpiarWidgetsFantasma, 1000);
  
  // Y cada 5s para ser robustos (eliminar fantasmas que aparezcan)
  setInterval(_limpiarWidgetsFantasma, 5000);

  // ─────────────────────────────────────────────────────────────────
  // FIX 6: MONITOREO CONTINUO DE SINCRONIZACIÓN
  // ─────────────────────────────────────────────────────────────────

  function _monitorearSync() {
    setInterval(() => {
      try {
        if (typeof Almacen !== 'undefined') {
          // Verificar si hay pendientes sin sincronizar
          const estado = Almacen.onEstado && Almacen.onEstado();
          
          if (estado === 'local') {
            // No hay conexión a BD
            _mostrarEstadoSync('error_permanente');
          } else if (estado === 'error') {
            // Hay error
            _mostrarEstadoSync('error');
          } else if (estado === 'nube') {
            // Sincronizado
            _mostrarEstadoSync('ok');
          }
        }
      } catch(err) {
        console.debug('[Almacén v94.79] Monitor error:', err);
      }
    }, 5000);
  }

  // Iniciar monitoreo
  setTimeout(_monitorearSync, 2000);

  // ─────────────────────────────────────────────────────────────────
  // FIX 7: FLUSH AL CERRAR LA APP (beforeunload)
  // ─────────────────────────────────────────────────────────────────

  window.addEventListener('beforeunload', function() {
    try {
      if (typeof Almacen !== 'undefined' && typeof Almacen.flush === 'function') {
        // Usar vaciar que es síncrono
        if (typeof Almacen.vaciar === 'function') {
          Almacen.vaciar();
        }
        // Y intentar flush pero sin esperar
        Almacen.flush().catch(() => {
          // Ignorar errores, estamos cerrando
        });
      }
    } catch(err) {
      // Ignorar, estamos cerrando
    }
  });

  // ─────────────────────────────────────────────────────────────────
  // INICIALIZACIÓN COMPLETADA
  // ─────────────────────────────────────────────────────────────────

  console.log('[Fluxia v94.79-CRÍTICA] SUPABASE SYNC FIX INICIALIZADO');
  console.log('[Fluxia v94.79-CRÍTICA] ✓ Listeners automáticos en localStorage');
  console.log('[Fluxia v94.79-CRÍTICA] ✓ Intercept de setItem/removeItem');
  console.log('[Fluxia v94.79-CRÍTICA] ✓ Retry automático con backoff');
  console.log('[Fluxia v94.79-CRÍTICA] ✓ Indicador visual de sync');
  console.log('[Fluxia v94.79-CRÍTICA] ✓ Limpieza de widgets fantasma');
  console.log('[Fluxia v94.79-CRÍTICA] ✓ Flush al cerrar app');

})();

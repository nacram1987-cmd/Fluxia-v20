// ═══════════════════════════════════════════════════════════════
// FLUXIA v44 LAZY SUPABASE LOADER — Carga solo cuando se necesita
// ═══════════════════════════════════════════════════════════════
// Ahorra ~40 KB en startup. Supabase se carga solo cuando:
// 1. Usuario intenta sincronizar
// 2. Usuario abre formulario de login nube
// 3. Temporizador de sync automático (15 min)

let SUPABASE_CARGADO = false;
let SUPABASE_CARGANDO = false;
const SUPABASE_RETRY_MS = 3000;

/**
 * Carga la librería de Supabase (SOLO UNA VEZ)
 */
async function cargarSupabase() {
  if (SUPABASE_CARGADO) return true;
  if (SUPABASE_CARGANDO) {
    // Esperar a que termine la carga en curso
    return new Promise((res) => {
      const check = setInterval(() => {
        if (SUPABASE_CARGADO) { clearInterval(check); res(true); }
      }, 100);
      setTimeout(() => { clearInterval(check); res(false); }, 30000);
    });
  }
  
  SUPABASE_CARGANDO = true;
  
  try {
    // 1. Cargar Supabase desde CDN
    if (typeof window.supabase === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.async = true;
      script.onload = () => {
        SUPABASE_CARGADO = true;
        SUPABASE_CARGANDO = false;
        console.log('[Supabase] Librería cargada desde CDN');
      };
      script.onerror = () => {
        SUPABASE_CARGANDO = false;
        console.error('[Supabase] Error cargando desde CDN');
      };
      document.head.appendChild(script);
      
      // Esperar a que el script termine de cargar
      return new Promise((res) => {
        const check = setInterval(() => {
          if (SUPABASE_CARGADO || typeof window.supabase !== 'undefined') {
            clearInterval(check);
            SUPABASE_CARGADO = true;
            res(true);
          }
        }, 200);
        setTimeout(() => { clearInterval(check); res(false); }, 15000);
      });
    }
    
    SUPABASE_CARGADO = true;
    return true;
  } catch (e) {
    SUPABASE_CARGANDO = false;
    console.error('[Supabase] Error en carga:', e);
    return false;
  }
}

/**
 * Obtener cliente Supabase (con carga lazy)
 */
async function obtenerClienteSupabase() {
  if (!await cargarSupabase()) {
    throw new Error('No se pudo cargar Supabase');
  }
  
  if (typeof window.supabase === 'undefined') {
    throw new Error('Supabase no está disponible');
  }
  
  // Singleton: crear cliente una sola vez
  if (!window._FLUXIA_SB_CLIENT) {
    const { createClient } = window.supabase;
    window._FLUXIA_SB_CLIENT = createClient(
      'https://kylduzmrfbubeamfrbbr.supabase.co',
      'sb_publishable_5hX9-6-J7MlJfvmeWZcz5w_U-KlTCaj'
    );
  }
  
  return window._FLUXIA_SB_CLIENT;
}

/**
 * Hook para sincronizar automáticamente cada N minutos
 * (solo si Supabase se ha usado alguna vez)
 */
function iniciarSyncAutomatico(intervaloMs = 15 * 60 * 1000) {
  // Verificar si el usuario tiene credenciales guardadas
  const tieneCredenciales = () => {
    try {
      const sbAuth = localStorage.getItem('sb_auth_v2');
      return !!sbAuth;
    } catch { return false; }
  };
  
  if (!tieneCredenciales()) return; // No sincronizar si no hay credenciales
  
  setInterval(async () => {
    try {
      // Cargar Supabase en background
      if (!SUPABASE_CARGADO) {
        await cargarSupabase();
      }
      
      // Intentar sync
      if (typeof window.FluxiaNube !== 'undefined' && window.FluxiaNube.sync) {
        console.log('[Sync] Auto-sync ejecutándose...');
        await window.FluxiaNube.sync();
      }
    } catch (e) {
      // Silenciar errores en sync automático
      console.log('[Sync] Auto-sync skipped:', e.message);
    }
  }, intervaloMs);
}

/**
 * Precargar Supabase después de 5 segundos en idle
 * (optimización: preparar para posible sync)
 */
function precargaSupabasaEnIdle() {
  let idleTimer;
  const onActivity = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!SUPABASE_CARGADO && !SUPABASE_CARGANDO) {
        console.log('[Supabase] Precargando en idle...');
        cargarSupabase().catch(e => console.log('[Supabase] Precarga fallida:', e));
      }
    }, 5000);
  };
  
  // Eventos de actividad del usuario
  ['touchstart', 'mousedown', 'keydown', 'scroll'].forEach(e => {
    document.addEventListener(e, onActivity, { passive: true });
  });
  
  onActivity(); // Iniciar el timer
}

// Exportar interfaz pública
window.FluxiaLazySupabase = {
  cargarSupabase,
  obtenerClienteSupabase,
  iniciarSyncAutomatico,
  precargaSupabasaEnIdle,
  estaDisponible: () => SUPABASE_CARGADO || typeof window.supabase !== 'undefined'
};

// Auto-iniciar: precarga en idle + sync automático
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    precargaSupabasaEnIdle();
    iniciarSyncAutomatico();
  });
} else {
  precargaSupabasaEnIdle();
  iniciarSyncAutomatico();
}

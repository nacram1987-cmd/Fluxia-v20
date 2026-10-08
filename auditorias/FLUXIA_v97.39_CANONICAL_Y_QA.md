# Fluxia v97.39-LAB — reparación canónica

**Causa raíz:** el Service Worker podía responder a las rutas `lab-v97-*.html` con un `index.html` anterior. El `index.html` estable aún contenía el banner de versión `v97.28 LAB` y la lógica antigua de sugerencias bancarias. Crear más archivos LAB no cambiaba la aplicación realmente ejecutada en Safari.

**Cambios:** primera actualización del `index.html` principal, ajuste de ambos Service Workers a navegación fresca con fallback offline, `manifest.webmanifest` con URL de arranque canónica (ID de PWA conservado); filtro de fijos con evidencia textual/semántica incluso si hay regla antigua incorrecta, y `Nunca más` no elimina el cargo. Sin barras flotantes de versión. Disponible e Imprimir sin modificaciones.

**QA local ejecutado:** sintaxis de 163 scripts; cola antigua de Apple/Loterías pagado; importe idéntico sin correspondencia; regla aprendida incorrecta; `Nunca más` sin borrar ni duplicar; reimportación sin repregunta; navegador SW simulado con raíz/índice y LAB independientes; respaldo offline. **No se pudo probar la UI iOS Safari en este entorno**; la confirmación funcional del teléfono sigue pendiente.

**SHA de `main/index.html`:** `771198c4918c27392be42ef97bf8999d5860a6e9`.

**Respaldo GitHub:** `respaldo-estable-antes-v97-39-20261008` — conserva índice anterior SHA `893cb27a229fd34c76396fd257acb040a1850d49`. Ningún usuario, movimiento o registro financiero se ha eliminado como parte de este despliegue.

**URL de prueba prevista:** https://nacram1987-cmd.github.io/Fluxia-v20/index.html?v=97.39

**No promocionar a ESTABLE** hasta prueba confirmada en Safari/PWA por usuario.
# Fluxia v97.67-LAB — navegación y composición móvil

**Origen obligatorio:** v97.66 aceptada, con respaldo `baseline-v97.66-performance`.
**Estado:** candidato LAB, nunca sustituye PWA ESTABLE automáticamente.

## Cambios precisos
1. En la primera visita a una pestaña sin caché de render, evita calcular antes de pintar una firma completa que de todos modos debe generarse al finalizar el render.
2. Evita reprogramar una tarea de panel antiguo al cerrar el menú como parte de `goToTab`. El cierre manual conserva la reanudación normal.
3. Retira la aceleración GPU persistente de todos los paneles `.panel` y conserva el estilo y contenido.
4. La entrada estable `index.html` y el banco (script 97) no se modifican.

## Preservaciones
- Sin cambios en cifras, importes, Disponible, Variables, huchas, gastos, ingresos, usuario, autenticación, DB, Supabase, SW/manifest de la PWA instalada.
- Navegación canónica, panel activo, perfil, firma completa, invalidación por almacenamiento y edición in-place.
- Ningún listener adicional ni nueva tarea recurrente.

## Auditoría y aceptación
Ejecutar `node auditorias/qa-v97.66/verify-baseline.cjs`, `npm --prefix auditorias/qa-v97.66 test` tras instalar dependencias y `node auditorias/qa-v97.67/regression-lab.cjs`.
El test LAB verifica por igualdad exacta del archivo que SOLO hay cambios especificados, hace parsing JS, compara módulo bancario, recuento de firmas en primera carga, invalidación de importe, menú, Variables y totales.
**Pendiente:** benchmark físico de iPhone Safari/PWA con datos reales; JSDOM no mide pintura real ni garantiza cero latencia.

## Canales
- LAB (versión independiente): https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.67.html?v=97.67
- ESTABLE/PWA (sin modificación): https://nacram1987-cmd.github.io/Fluxia-v20/
- BASE v97.66: https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.66.html

No limpiar caché ni reinstalar la PWA para probar LAB. No promover sin validación y petición explícita «con labora».

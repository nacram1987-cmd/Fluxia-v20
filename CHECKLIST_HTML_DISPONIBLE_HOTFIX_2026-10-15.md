# Fluxia HTML — cambios del hotfix de Disponible

**Canal:** HTML/PWA. Este cambio no es Élite.

**Base observada:** entrada LAB servida y metadatos de la raíz observados como v97.66. Hay ficheros históricos con otros números, y `lab/v97.73.html` observado localmente contiene metadatos v97.72; por eso este parche se identifica como hotfix y no se asigna una nueva numeración v97.x hasta reconciliar la secuencia.

## Cambios

- El Disponible incluye rescates temporales de hucha aún pendientes de reponer.
- Usa la fecha real del rescate para asignarlo al mes correcto.
- Añade solo el importe pendiente: `máximo(0, importe − repuesto)`, a céntimos.
- Una reposición reduce el aumento pendiente; al quedar repuesto completamente, deja de sumar.
- Usos definitivos y rescates de otros meses no cambian el Disponible seleccionado.
- Recalcular la pantalla no vuelve a sumar el rescate.
- No cambia variables, movimientos bancarios, datos guardados ni la versión raíz estable. Usa un service worker nuevo y aislado solo para esta LAB; deja intacto el worker compartido de los artefactos protegidos de Élite.

## Verificación

- Regresión dirigida: **10 casos aprobados**, incluido −200 € + 100 € = −100 €.
- Verificador de base: **6 archivos inmutables v97.66 aprobados**.
- Sintaxis del test: aprobada.
- Suite completa `npm test --prefix auditorias/qa-v97.66`: **aprobada**. Incluye 400 movimientos sintéticos, menú/navegación, invalidación, perfil, invariantes de bancos y los diez casos de rescate. Se usaron dependencias ya instaladas en otro checkout local; no se cambió la lockfile.
- Rendimiento físico Safari/PWA: pendiente.
- Pages: cambio escrito por API en la rama efectiva. El workflow completo de QA y deploy está ejecutándose; enlace público y PWA LAB quedan pendientes de verificación HTTP tras el resultado. La raíz/PWA estable no se modifica.

## Bancos

La conexión bancaria no se ha cambiado. Último estado revisado: Revolut sincronizado el 15/10/2026; CaixaBank con autorización vigente, pero bloqueado por límite diario del proveedor (HUB046). Los movimientos cargados siguen disponibles; no hace falta reconectar.

## Rollback

Restaurar la copia anterior de `lab/index.html`, `lab/manifest.webmanifest` y `lab/fluxia-sw.js` desde Git. La raíz/PWA estable no recibió cambios.

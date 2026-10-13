# Cierre v97.71-LAB — pendiente de gates

## Incidente y causa raíz

El controlador de Papelera infería un borrado comparando la lista anterior con cada nueva lista guardada. Una hidratación parcial, restauración o sincronización con datos incompletos podía tratar cargos válidos (por ejemplo ITV) como eliminados. Además, el recuperador v63 podía reinsertar automáticamente cargos antiguos de Papelera al iniciar.

El matcher de fijos exigía pistas de comercio; `Apple.com/bill` no contiene «Apple TV» y el cargo de 2,99 € no alcanzaba puntuación aunque pudiera existir un fijo del mismo importe. Asociar solo por importe es inseguro cuando hay cargos ambiguos, así que ahora se solicita confirmación únicamente para un candidato único.

## Cambios

- Desactivada la inferencia de papelera desde diferencias de listas.
- El hook de borrado explícito añade la instantánea a Papelera; el API existente es idempotente por ID.
- Desactivada la recuperación automática; queda la recuperación manual individual.
- Empates de matching no eligen candidato. Igual importe y comercio desconocido produce pregunta, no pago automático.
- No se cambió ninguna fórmula de Disponible, regla contable o fila financiera existente.

## Verificación ejecutada hasta ahora

Gates locales completados: baseline v97.66 y 7 SHA protegidos; QA v97.66 (168 scripts, funciones financieras/persistencia/navegación sin cambios; 20 ciclos); finanzas y tombstones; 14 regresiones bancarias ampliadas; lifecycle (10 llamadas concurrentes, una llamada al proveedor, sin escrituras obsoletas); avisos repetidos y aislamiento; perfiles A/B; 6/6 invariantes de papelera/fijos. Las pruebas no escriben al banco o nube reales.

Rendimiento JSDOM/Node, 10 rondas intercaladas, 400 movimientos: v97.71 vs v97.68 mediana de construcción 642,78 vs 625,46 ms (+2,8%); DOMContentLoaded 784,14 vs 800,35 ms; navegación cálida 0,187 vs 0,195 ms; render frío 14,21 vs 15,49 ms; panel banco 0,997 vs 1,204 ms. Ninguna mediana excede el gate de +15%. Una ronda aislada de render frío dio 64,23 ms; no se repite en la mediana y queda como variabilidad host. No es métrica de Safari/iPhone.

Publicada: commit `5402dc85cac93b4b743e174bfd178d577803f79a`; workflow `38423064015` finalizó SUCCESS y el smoke comparó respuestas HTTP byte a byte, incluidas ambas páginas LAB y manifiestos/iconos. ZIP prerelease `v97.71-LAB` con SHA-256 `f0f85ebfc85f4cbecf7c6cc073015bef107370bfcd5d72c340db21e218da61eb`. La estable sigue intacta.

LAB: https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.71.html
PWA LAB aislada: https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.71/index.html
ESTABLE: https://nacram1987-cmd.github.io/Fluxia-v20/
Referencia v97.68: https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.68.html

## Riesgos / rollback

- Valkiria requiere referencias estables de la sincronización real; no fusionar por fecha/importe/concepto.
- Safari/iPhone físico, proveedor PSD2 real y sesión de banco siguen sin ensayar.
- Rollback de la candidata: volver a v97.70 o v97.68, dejando estable intacta. No borrar filas para revertir.

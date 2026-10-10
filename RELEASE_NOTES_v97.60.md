# Fluxia v97.60 — menú y logo

Se sustituye la apertura en pointerdown por una única activación click, evitando cambiar el objetivo táctil mientras el dedo sigue pulsando. Un gesto cancelado no abre el menú. Se conserva el mismo botón, sin clones ni listeners de apertura duplicados.

El logo oficial vuelve a Inicio usando goToTab; también admite Enter y Espacio. Menú y campana tienen área mínima 44×44 px; la marca, altura mínima 44 px. aria-expanded refleja la apertura y cierre.

PWA y LAB mantienen ámbitos y cachés separados. No reinstalar ni borrar datos. Cerrar y volver a abrir tras recibir la actualización.

Sin cambios en servidor bancario, conciliación, cálculos, almacenamiento, perfiles ni autenticación.

Verificación: 20 ciclos sintéticos, gestos cancelados, logo SVG, teclado, 167 scripts válidos; 13 funciones financieras/persistencia y 4 funciones bancarias idénticas por AST. Worker: identidad instalada preservada, shell fresco antes de activar, fallo conserva worker previo, LAB/API/POST no interceptados.

Chrome remoto con CSS raíz y almacenamiento aislado: hit-test correcto, abrir menú → Ingresos → logo → Inicio. No prueba iPhone/Safari ni cuenta bancaria real; no se publican cifras de INP o velocidad máxima.

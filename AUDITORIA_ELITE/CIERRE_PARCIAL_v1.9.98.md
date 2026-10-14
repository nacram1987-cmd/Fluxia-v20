# Fluxia Élite v1.9.98 · corrección del control de publicación

Fecha: 15/10/2026. Rama `pages-v9731-real-final`. La versión estable no se ha modificado.

## Hallazgo y corrección

`PROTECTED_SHA256.txt` fue creado para v97.66 y sigue intacto. Su primera fila asumía que `index.html` aún tenía los bytes históricos. El HTML estable actual fue modificado en un commit previo (`145560c16df8c0ce0902daacbb20ffb634a04bc7`) y su hash es `9a3f0c37b07d4acb3d87ab5611817b36e0d500cf662ea3f2182eef22a45406f0`.

El workflow Élite ahora comprueba por separado seis referencias históricas v97.66 y la estable actual mediante `STABLE_AT_v1.9.98_SHA256.txt`. Se conserva el manifiesto original, no se altera `index.html` y se elimina el paso automático que podía volver a publicar el release histórico `v97.73-LAB` tras probar una versión Élite posterior. El despliegue automático de GitHub Pages basado en la rama aún puede producirse independientemente de este workflow: no equivale a certificación financiera.

La primera ejecución completa después de levantar esa barrera encontró otra deriva legítima: `lab/v97.72/index.html` recibió después dos hotfixes visuales (`121549b…` y `dd8aa41…`). La construcción original de v97.72 no puede reproducir esos bytes. Se comprueba ahora su SHA exacto aprobado (`LAB_v97.72_HOTFIX_SHA256.txt`) mientras los demás artefactos siguen comparándose con el generador; no se editó el HTML histórico ni se quitó la comparación del resto.

La cabecera usa una campana SVG reconocible, sin punto dorado de “no leído” ficticio. Logo y nombre continúan agrupados en el centro; Salir sigue en Ajustes. Se preservó un snapshot exacto de v1.9.98.

La batería antigua de QA tenía un fallo de infraestructura: intentaba cargar módulos UMD `.js` con `require()` desde un repositorio declarado `type: module`. Se añadió un cargador de test en el mismo realm y se actualizó el fake DOM de la prueba de pantallas; **no se retiró ninguna assertion financiera**. Las pruebas sintéticas de CSV (16), paridad (10), cartera (20), copia privada (16) y navegación/logout (17) se ejecutaron y pasaron localmente.

La regresión protegida `auditorias/qa-v97.66` también pasó: 168 scripts parseados, 20 ciclos de menú y 400 filas sintéticas de Variables; no equivale a una medición física en iPhone.

## No certificado

- No hay cotejo al mismo corte de HTML y Élite con registros privados y banco verificable.
- No se han efectuado pruebas físicas Safari/iPhone ni tests de cuentas A/B con JWT diferentes.
- Bancos: la importación contable continúa bloqueada frente a conflictos de identidad y tombstones pendientes. No se ha escrito en datos reales.
- Supabase: no hay migración, cambio de política ni revocación de sesión del lado servidor en esta versión. El refresh token sigue en `localStorage`; XSS/CSP y diseño de sesión permanecen abiertos.
- El workflow histórico completo podría revelar fallos adicionales más allá de la antigua barrera SHA. No declarar verde hasta ver una ejecución completa exitosa.
- Al reanudar la secuencia local, `shared-month-v9773-regression.cjs` exige 168 bloques y una única diferencia frente a v97.72, pero el archivo histórico v97.73 vigente contiene 169 bloques y múltiples cambios posteriores. La assertion original permanece; esta regresión histórica sigue roja y requiere una baseline del commit original separada de los hotfixes posteriores, sin borrar controles.

## Siguiente puerta

Primero cerrar QA completo sin falsear referencias. Después, paridad exacta por ID/céntimo y aislamiento con cuentas sintéticas; solo entonces evaluar habilitar banco → libro contable y avanzar a v1.9.99. Reservar v2.0.00 para una transición sustentada por pruebas, no solo por numeración.

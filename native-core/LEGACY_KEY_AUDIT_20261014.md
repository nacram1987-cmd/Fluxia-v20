# Auditoría de claves legacy — 14 octubre 2026

Inspección de solo lectura de la estructura de `public.fluxia_datos` (sin extraer importes ni valores `v`).

## Hallazgo
La tabla contiene simultáneamente claves de módulos como `planRescate_v2_ingresos`, `planRescate_v2_movimientos`, `planRescate_v2_fijos`, `planRescate_v2_provisiones`, `planRescate_v2_compartidos` y `planRescate_v2_financiaciones`, así como variantes prefijadas por perfiles legacy, espejos, backups, papelera y cierres.

## Riesgo
No hay equivalencia garantizada entre `auth.uid()` y el identificador de perfil legacy. Una lectura por usuario autenticado no basta para decidir qué variante es la fuente vigente. Importar global y perfil simultáneamente puede duplicar datos.

## Puerta de implementación
1. Identificar en el HTML actual el selector exacto de perfil, su mapeo a `auth.uid()`, el orden de precedencia y los filtros de tombstones.
2. Comparar hashes/cantidades y totales de las claves candidatas para dos meses sin exponer datos privados.
3. Construir adaptadores específicos de módulo. Nunca unir automáticamente versiones globales y prefijadas.
4. Confirmar igualdad de saldos antes de activar el dashboard real.
5. No crear ni modificar registros de producción durante la auditoría.

## Identidad
La app nativa se denomina **Fluxia Élite BETA**, con logo oficial HTML; la PWA instalada sigue siendo **Fluxia BETA**.

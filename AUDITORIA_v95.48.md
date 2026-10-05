# Auditoría v95.48-LAB

## Causa raíz corregida
Las v95.45-v95.47 trataban `x.actuales.length > 0` como prueba de que TODO el perfil ya estaba migrado. Un namespace parcial podía contener Fijos pero no Ingresos/Variables, o viceversa. La recuperación adicional de Fijos agravaba la asimetría.

## Corrección
Validación independiente por bloque crítico, fuente legacy exacta de la misma identidad autenticada, no sobrescritura de destinos no vacíos y verificación readback.

## Riesgo residual
Si una clave ya no existe ni en el namespace actual ni en las filas legacy de esa cuenta Supabase, esta migración no inventa datos. Será necesaria recuperación manual desde backup/exportación.

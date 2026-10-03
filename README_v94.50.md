# v94.50-LAB

## Sin cuenta ya no carga tus datos
**Causa:** todos los perfiles compartían las mismas claves `planRescate_v2_*` en el móvil.
**Fix:** prefijo por perfil (`planRescate_v2_<id>_`) excepto perfil **legacy/principal** (el tuyo histórico).
Usuario nuevo + Sin cuenta → almacenamiento vacío propio + sin bancos heredados.

## UI = foto Dashboard
Héroes: degradado crema→cian y número **teal** grande en todas las pestañas.

## Cómo probar Sin cuenta
1. Crear usuario nuevo (ej. Pepe)
2. Sin cuenta → confirmar
3. Debe verse **0 €**, **0 bancos**, sin Ana/compartidos
4. Tu usuario Nacho sigue intacto al volver a él

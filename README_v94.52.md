# v94.52-LAB · URGENTE integridad de datos

## Qué falló
El reset de «Sin cuenta» podía borrar claves `planRescate_v2_*` **globales** (el plan de tu sesión real) si el prefijo no llevaba id de perfil.

## Qué hace esta versión
- **Ya no borra** esas claves al usar Sin cuenta
- Prefijo fijo histórico otra vez
- Perfil nuevo vacío = flag de sesión, sin tocar tu disco
- **Restaurar copia interna** si existe `fluxia_pre_import_v1_*`

## Qué hacer TÚ ahora
1. Sube v94.52
2. Entra con **tu usuario** (Nacho)
3. Si el plan está vacío o faltan huchas:
   - Mira si sale el botón **↩ Restaurar copia interna** en Inicio
   - O Ajustes → **Copia cifrada / Restaurar**
   - O en consola Safari: `fluxiaRestaurarPreImport()`
4. **No uses Sin cuenta** en el mismo móvil hasta confirmar que tu plan está bien

## Guardado
El guardado no se desactivó a propósito; el daño venía del **borrado masivo de keys**. Con el prefijo estable, `guardarLS` vuelve a escribir donde siempre.

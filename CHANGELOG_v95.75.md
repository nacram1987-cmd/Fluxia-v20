# Fluxia v95.75-LAB

## Reparación de recuperación cloud entre namespaces del mismo perfil
- Diagnóstico confirmado en Supabase: el perfil correcto `usr-068a...` tenía `v2_ingresos`, `v2_provisiones` y `v2_usos` como lápidas en el namespace `profile:<id>:*`, mientras que las copias vivas del MISMO perfil seguían intactas en `p_<id>__*`.
- v95.75 añade un fallback de lectura estrictamente same-profile y same-UUID (RLS), solo para esos tres bloques y solo cuando al menos 2 de ellos presentan el patrón lápida+nube legacy viva. No usa "lista más larga", no lee otro perfil y no borra ni mueve filas.
- Gastos fijos y variables continúan leyendo el namespace actual, evitando sustituir datos más recientes por copias legacy.
- Se corrige la traducción de `same_password` y se fuerza la visibilidad de los errores de autenticación.
- PWA: manifest y Service Worker propios v95.75; deja de registrar el SW histórico v95.65.
- v95.39 ESTABLE: intacta.

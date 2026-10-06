# Fluxia v95.69-LAB

- Recuperación cloud corregida cuando una misma cuenta Supabase contiene varios namespaces `profile:usr-*`.
- Selección segura por contenido: 4 bases financieras, volumen de registros y actualización.
- Auto-selección únicamente si un perfil es inequívocamente dominante; en caso ambiguo se aborta sin escribir datos.
- No borra, mueve ni modifica filas de `fluxia_datos`; la detección es de solo lectura.
- Mantiene v95.39 ESTABLE fuera de esta entrega.

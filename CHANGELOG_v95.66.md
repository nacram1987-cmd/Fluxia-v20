# Fluxia v95.66-LAB

- Corrige el bloqueo del recovery de v95.65: `openFormModal` se estaba invocando con una firma antigua/incompatible.
- El reset abre ahora un formulario real de nueva contraseña.
- Tras actualizar la contraseña, reconstruye el perfil únicamente desde las filas visibles para la cuenta autenticada por RLS.
- No modifica la estable v95.39.

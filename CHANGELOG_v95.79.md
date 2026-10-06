# CHANGELOG · v95.79-LAB

- Corregida la regresión real de caché/PWA: un bloque legacy seguía registrando `fluxia-sw-v95.65.js` sobre el mismo scope.
- Todos los registros principales de Service Worker apuntan ahora a `fluxia-sw-v95.79.js`.
- Añadida aplicación previa al render del canon de Huchas mientras la migración v95.79 no esté confirmada en nube.
- Migración limitada al perfil histórico recuperado; no afecta usuarios nuevos ni otros perfiles.
- Nuevo marcador `v2_huchas_rebase_v9579_cloud_ok`.
- Recuperación de contraseña redirigida a v95.79-LAB.
- `same_password` continúa el flujo como estado válido y muestra «La contraseña ha sido cambiada con éxito».
- ESTABLE no modificada.

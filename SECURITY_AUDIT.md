# Alcance de seguridad
Servidor LAB conserva autenticación interna `auth.getUser`, usuario derivado del token y consulta de sesiones con filtro `user_id`. No nuevas credenciales ni permisos ni cambios de esquema. Respuesta sin token rechazada en servidor desplegado.
No es auditoría completa de RLS, GDPR, notificaciones ni todos los módulos legacy.

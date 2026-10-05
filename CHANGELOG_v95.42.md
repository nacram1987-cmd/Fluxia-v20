# CHANGELOG · Fluxia v95.42

- Seguridad multiusuario: aislamiento local + cloud por perfil.
- Nueva barrera de privacidad: usuario nuevo sin credenciales siempre a cero.
- Sesión Supabase validada por `user_id` vinculado al perfil; se elimina el auto-vínculo por simple selección.
- Nuevo namespace remoto por perfil con migración legacy solo tras autorización segura.
- Nuevo usuario desconecta la sesión cloud anterior.
- QuotaExceeded ya no bloquea «Continuar sin protección» ni metadatos de acceso.
- Aviso de caché llena diferido hasta después de autenticación/onboarding.
- Limpieza preventiva de copias temporales y reducción de backups legacy a 3.
- Se preservan todas las mejoras v95.41 compatibles.
- README y checklist visible sincronizados.
- Tipografía visual unificada con la familia Fluxia/IBM Plex Sans en menú, cabeceras, controles y títulos.
- Cabecera del menú simplificada: se elimina la versión duplicada y queda `Fluxia · Tu plan financiero`.

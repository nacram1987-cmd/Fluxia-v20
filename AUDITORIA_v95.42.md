# AUDITORÍA v95.42 · Seguridad multiusuario y almacenamiento

## Hallazgos corregidos
1. `FluxiaNube.db()` aceptaba una sesión Supabase persistente y la auto-vinculaba al perfil activo. En un dispositivo compartido podía reutilizar la identidad cloud anterior.
2. El adaptador Supabase ignoraba la parte `planUsuarios/<profileId>` de la ruta y guardaba únicamente por `user_id + clave`; faltaba namespace cloud por perfil.
3. Seleccionar una ficha escribía `fluxia_sb_perfil=<nuevoPerfil>` aunque la sesión Supabase pudiera ser de otra persona.
4. `Continuar sin protección` ejecutaba un `localStorage.setItem()` sin protección; con cuota llena lanzaba excepción antes de `desbloquear()`.
5. El aviso de almacenamiento se mostraba con z-index alto durante login/Face ID, degradando y bloqueando la experiencia de acceso.
6. Metadatos críticos de perfil/seguridad dependían solo de localStorage; una cuota llena podía abortar el flujo de alta.

## Correcciones
- Vínculo cloud per-profile por `user_id` validado.
- Namespace remoto `p_<profileId>__<clave>`.
- Logout cloud real al crear un nuevo usuario.
- Barrera de cero para perfil nuevo sin credenciales/offline explícito.
- MetaStore seguro: local → poda de caché → retry → sessionStorage.
- Aviso de cuota diferido durante pantallas de acceso.
- Backups legacy limitados a 3; poda solo de caché/diagnóstico.

## Invariantes de seguridad
- Fallo de almacenamiento ⇒ degradar a sesión/0/sin nube, nunca heredar otro perfil.
- Sesión cloud ajena ⇒ `db()` devuelve null.
- Perfil nuevo sin autorización ⇒ listas financieras vacías.
- La ESTABLE v95.39 no se modifica.

## Tipografía / menú
- Sistema tipográfico unificado sobre IBM Plex Sans/Fluxia para interfaz, títulos y controles.
- El menú lateral no repite la versión; conserva nombre del usuario y contexto de producto.
- La versión continúa disponible en la propia app/Ayuda.

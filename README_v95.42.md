# Fluxia v95.42 BETA

**ESTABLE por defecto:** v95.39 (`index.html`)  
**LAB:** v95.42 (`index_fluxia_v95.42_LAB.html`)

Subir/reemplazar **TODO** el contenido de este paquete en la raíz de `Fluxia-v20`.

## ✅ Checklist de cambios v95.42
- [x] **Aislamiento total multiusuario:** cada perfil tiene namespace local y cloud propios; ningún perfil puede cargar datos de otro.
- [x] **Usuario nuevo = 0:** sin credenciales propias ni elección explícita offline, Ingresos, Fijos, Variables, Huchas, Usos, Financiaciones y Compartidos permanecen vacíos.
- [x] **Sesión cloud vinculada por identidad:** Supabase solo se usa si el `user_id` autenticado coincide con la vinculación verificada del perfil activo.
- [x] **Elegir usuario no reutiliza sesión ajena:** seleccionar otra ficha no vuelve a etiquetar como propia la sesión Supabase que quedó abierta.
- [x] **Nuevo usuario desconecta la nube anterior:** antes de recargar el perfil nuevo se cierra la sesión cloud local previa.
- [x] **Namespace cloud por perfil:** las claves remotas se prefijan por perfil, evitando colisiones incluso dentro de una misma cuenta técnica.
- [x] **Compatibilidad segura con nube legacy:** un perfil ya vinculado o autenticado explícitamente puede migrar sus filas antiguas sin namespace a su namespace propio; los perfiles nuevos no las heredan automáticamente.
- [x] **Continuar sin protección funciona con caché llena:** QuotaExceededError ya no puede bloquear la salida del modal; los metadatos de acceso tienen fallback seguro de sesión.
- [x] **Aviso de almacenamiento no tapa credenciales:** el banner de cuota se pospone durante splash, login, onboarding y bloqueo.
- [x] **Limpieza local preventiva:** se podan copias temporales/diagnósticos y se conservan solo 3 backups legacy; nunca se tocan datos vivos para liberar espacio.
- [x] **Mejoras v95.41 preservadas:** BETA dorado, iconos coherentes, contexto premium, recibos durables, pago de Agua y reducción de layout shift.
- [x] **Tipografía Fluxia unificada:** menú, nombre de usuario, títulos, botones y textos principales usan la misma familia visual para evitar mezclas tipográficas.
- [x] **Menú más limpio:** se elimina la versión del encabezado lateral; queda `Hola, <usuario>` + `Fluxia · Tu plan financiero`.
- [x] **Checklist = README:** los cambios de esta release coinciden con Ayuda → Checklist v95.42.

## 🧪 Regresiones obligatorias
- [ ] Crear usuario nuevo SIN credenciales → Dashboard/Huchas/Ingresos/Variables deben estar **a 0**.
- [ ] Crear dos perfiles en el mismo dispositivo → nunca deben compartir datos locales ni cloud.
- [ ] Dejar una sesión Supabase de A y seleccionar B → B no puede descargar ni modificar datos de A.
- [ ] Con almacenamiento local lleno → «Continuar sin protección» y Cancelar/volver deben seguir funcionando.
- [ ] Borrar una aportación → sincronizar → cerrar → abrir → **no reaparece**.
- [ ] Editar un Ingreso → sincronizar → cerrar → abrir → **conserva la edición manual**.
- [ ] Registrar/editar pago de Hucha con fecha histórica → persiste tras cierre y cambio de versión.

## Principio rector
**Cada mejora suma; ninguna mejora sacrifica integridad ni privacidad.**

# Fluxia v95.74-LAB

## Corrección crítica de acceso Safari / PWA

- Confirmado: el correo/cuenta de Supabase no es el bloqueo. La cuenta está confirmada y activa.
- Corregido un fallo específico de Safari/iCloud Keychain: el autocompletado puede rellenar email/contraseña sin disparar `input`, dejando `Siguiente` deshabilitado. Un botón `disabled` no emite `click`, por lo que los parches de login anteriores no podían ejecutarse.
- `Siguiente` permanece físicamente pulsable y la validez se comprueba leyendo los valores reales del DOM en el instante del toque.
- El handler histórico también relee email/contraseña en vivo antes de autenticar.
- El autocompletado interno emite `input`/`change` como fallback.
- Reparado el límite `<script>` posterior al interceptor de login (`Detectar invitación` vuelve a estar dentro de un bloque script válido).
- Se mantiene autenticación directa Supabase y recuperación del perfil cloud por UUID/RLS.
- Sin cambios destructivos en datos financieros. v95.39 ESTABLE permanece fuera de esta entrega.

# Activar push de cargos bancarios (iPhone)

## 1. Generar VAPID
```bash
npx web-push generate-vapid-keys
```
Copia Public y Private.

## 2. SQL en Supabase
Ejecuta `fluxia_push_subs_v92_4.sql` en SQL Editor.

## 3. Secrets de la Edge Function
Dashboard → Edge Functions → Secrets:
- VAPID_PUBLIC
- VAPID_PRIVATE
- VAPID_SUBJECT = mailto:tu@email.com
(SUPABASE_URL y SERVICE_ROLE_KEY suelen estar ya)

## 4. Desplegar función
```bash
supabase functions deploy fluxia-push-cargo
```
(o crea la función en el dashboard pegando `fluxia-push-cargo.edge.ts`)

## 5. Llamar desde Fluxia-banco
Cuando detectes un cargo nuevo (importe < 0):
```
POST /functions/v1/fluxia-push-cargo
Authorization: Bearer <service_role>
{ "user_id": "<uuid del usuario>", "concepto": "Mercadona", "importe": -23.45, "banco": "Revolut" }
```

## 6. En el móvil
1. Cuenta Supabase iniciada
2. Ajustes → Activar avisos de cargos
3. Permitir notificaciones iOS
4. App añadida a pantalla de inicio

Sin el paso 5 (llamada al detectar cargo), el push no sale aunque VAPID esté bien.

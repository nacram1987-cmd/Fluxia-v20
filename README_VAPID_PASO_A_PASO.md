# Dónde meter las claves VAPID (paso a paso)

## A) Generar las claves (en tu ordenador)

```bash
npx web-push generate-vapid-keys
```

Te saldrá algo así:

```
Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib9...

Private Key:
Xd2k9... (más corta)
```

- **Public Key** → puede ir en la app (cliente)
- **Private Key** → SOLO en el servidor (Supabase). Nunca en GitHub ni en el HTML.

---

## B) Guardarlas en Supabase (servidor) — OBLIGATORIO para push con app cerrada

1. Entra en [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Abre tu proyecto Fluxia
3. Menú izquierdo → **Project Settings** (engranaje)
4. **Edge Functions** → sección **Secrets** (o **Manage secrets**)
5. Añade estos secretos, uno a uno:

| Nombre del secret | Valor |
|-------------------|--------|
| `VAPID_PUBLIC` | la Public Key completa |
| `VAPID_PRIVATE` | la Private Key completa |
| `VAPID_SUBJECT` | `mailto:tu-email@real.com` |

6. Guarda. Si la Edge Function ya estaba desplegada, a veces hay que **volver a desplegarla** para que lea los secrets.

También necesitas (casi siempre ya existen en Edge):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (Settings → API → service_role — ¡no la publiques!)

---

## C) Clave pública en la app (cliente)

En el HTML de Fluxia busca algo como:

```js
var VAPID_PUBLIC = 'BEl62i...';
```

Sustitúyela por **tu** Public Key (la misma que en `VAPID_PUBLIC` del servidor).

Si no cambias la de prueba, el navegador puede fallar al suscribirse a notificaciones.

---

## D) SQL + función

1. SQL Editor → pega el SQL de `fluxia_push_subs`
2. Edge Functions → crea `fluxia-push-cargo` → pega el código TS
3. Deploy
4. Cuando Fluxia-banco vea un cargo, llama a esa función con `user_id`, `concepto`, `importe`

---

## E) En el iPhone

1. App añadida a pantalla de inicio
2. Sesión nube (Supabase) iniciada
3. Activar avisos de cargos en Ajustes
4. Aceptar permiso de notificaciones de iOS

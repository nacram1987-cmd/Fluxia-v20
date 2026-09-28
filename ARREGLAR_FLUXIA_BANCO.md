# Arreglar Fluxia-banco (WORKER_ERROR)

## Diagnóstico (ya comprobado)
La URL responde pero la función se cae al arrancar:

POST https://kylduzmrfbubeamfrbbr.supabase.co/functions/v1/Fluxia-banco
→ HTTP 500
→ {"code":"WORKER_ERROR","message":"Function exited due to an error (please check logs)"}

Incluso OPTIONS (preflight CORS) devuelve 500.
Eso significa: error de código o de secrets al iniciar el worker, no un fallo de la app móvil.

## Qué hacer (paso a paso)

1. Entra en https://supabase.com/dashboard
2. Proyecto Fluxia (kylduzmrfbubeamfrbbr)
3. Menú izquierdo → **Edge Functions**
4. Abre **Fluxia-banco** (respeta mayúsculas)
5. Pestaña **Logs** (o Invocations)
6. Busca la línea roja más reciente: ahí está el error real
   (ej. missing env, import failed, ENABLE_BANKING_*, JSON.parse, etc.)

### Causas habituales
- Secret que falta: ENABLE_BANKING_APPLICATION_ID, ENABLE_BANKING_SECRET, SUPABASE_SERVICE_ROLE_KEY…
- Import roto o Deno incompatible
- Código que lanza fuera del `Deno.serve` (al cargar el módulo)
- JWT verification / config de la función

### Cómo recuperar
1. Corrige el error que salga en Logs
2. **Redeploy** de Fluxia-banco
3. Prueba de nuevo en la app: Conectar banco

### Comprobación rápida (desde el PC)
```bash
curl -sS -X POST "https://kylduzmrfbubeamfrbbr.supabase.co/functions/v1/Fluxia-banco" \
  -H "Content-Type: application/json" \
  -H "apikey: TU_ANON_O_PUBLISHABLE" \
  -d '{"accion":"bancos"}'
```
Si sigue saliendo WORKER_ERROR, la función aún no está bien.
Si sale 401/JWT o un JSON con bancos, el worker ya arranca.

## Importante
- CaixaBank y Revolut **no se borran** del móvil; solo el servidor está caído.
- La app HTML no puede reparar un crash del worker; hay que arreglar y redesplegar la Edge Function.

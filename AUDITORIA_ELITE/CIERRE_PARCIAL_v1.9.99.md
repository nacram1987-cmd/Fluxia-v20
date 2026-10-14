# Fluxia Élite v1.9.99 · cierre de sesión de este dispositivo

Fecha: 15/10/2026. Rama `pages-v9731-real-final`. Sin modificar `index.html`, Service Worker ni datos financieros.

## Cambio real

El cierre desde Ajustes borra inmediatamente la sesión y el estado privado en memoria y solicita `POST /auth/v1/logout?scope=local` con el access token saliente. Otros dispositivos no se cierran. Se aplica un límite de 8 segundos; ante fallo de red o respuesta no satisfactoria, el mensaje indica que la revocación del servidor **no pudo confirmarse**. Si el usuario inicia otra sesión mientras termina la solicitud anterior, la respuesta tardía no reemplaza la nueva pantalla. Esta implementación sigue la ruta y semántica del cliente oficial de Supabase Auth, pero **no ha sido probada con una sesión real de QA**.

Fuentes: [Supabase Auth · signout](https://supabase.com/docs/guides/auth/signout), [cliente auth-js · logout scope](https://github.com/supabase/auth-js/blob/master/src/GoTrueAdminApi.ts).

## Comprobaciones ejecutadas

- Prueba aislada: `scope=local`, método POST, bearer de prueba, respuesta correcta, fallo HTTP, desconexión y token vacío.
- Trece scripts focalizados de cabecera, sesión, aislamiento local, módulos y banco, sin credenciales reales, pasan.
- Regresión v97.66 y su snapshot: superados en v1.9.98; no equivalen a Safari físico.
- `lab/versions/fluxia-elite-safari-v1.9.99.html` es copia byte a byte del LAB ejecutable.

## Límites y siguientes puertas

El token de acceso JWT existente puede seguir funcionando hasta caducar incluso tras revocar el refresh token. La seguridad del `localStorage` ante XSS sigue pendiente. La comparación contable HTML ↔ Élite al mismo corte, RLS con dos usuarios de prueba, importación bancaria segura, Face ID de servidor y pruebas físicas iPhone no están certificadas. No promocionar Élite a estable ni activar escrituras bancarias por este cambio.

La regresión histórica `shared-month-v9773-regression.cjs` se reorientó al commit de origen `8de383ae995ca4beef200cd541abacd8c7396594`, donde conserva la assertion de 168 scripts, único script modificado y invariantes financieras originales. Además, el v97.73 actual se protege con su SHA exacto; así se distingue el hotfix visual posterior de un cambio contable. El workflow hace checkout con historia para ejecutar esta comparación. Hay que ver el resultado CI completo antes de dar la puerta QA por verde.

**v2.0.00 no se declara alcanzada**: sería engañoso llamar salto mayor a una app con Disponible y paridad todavía bloqueados.

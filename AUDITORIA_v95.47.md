# Auditoría v95.47-LAB

## Causa raíz 1 · versión 46 que terminaba en 44
El HTML v95.46 seguía enlazando `manifest_v95.44_LAB.webmanifest` y registrando `fluxia-sw-v95.44.js`. Esto podía mantener el arranque PWA y la cache bajo v95.44 aunque la URL fuese v95.46. v95.47 elimina esas referencias y añade puentes de compatibilidad.

## Causa raíz 2 · Gastos fijos ausentes
La migración general era todo-o-nada por namespace. v95.46 añadió recuperación específica, pero usaba selección por longitud y solo fuentes legacy sin una nueva pasada garantizada. v95.47 reintenta con marcador propio y recupera exclusivamente la clave `v2_fijos` desde `v2_fijos` o `planRescate_v2_fijos` de la misma cuenta autenticada, con backup y readback.

## Seguridad
No se insertan gastos personales en el HTML ni en JSON públicos. La recuperación sale de Supabase autenticado del usuario. No se copian namespaces `profile:*` de otros perfiles.

## Estable
`index.html` no se modifica respecto a v95.39.

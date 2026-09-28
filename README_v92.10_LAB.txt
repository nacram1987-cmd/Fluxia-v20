FLUXIA v92.10 LAB
=================
Base: index_fluxia_v92_9.html
Canal: LAB; NO ESTABLE.

CORRECCION BANCOS
- No se modifica Supabase.
- No se desconecta ni elimina ninguna conexión.
- Si Fluxia-banco devuelve 0 conexiones, v92.10 ya no depende únicamente de fluxia_banco_conexiones_v1.
- Recupera también fluxia_bancos_conocidos_v62 y muestra esos bancos como Reconectar.
- Bloquea la escritura de [] cuando existen bancos conocidos.
- Corrige la etiqueta visible v92.9 -> v92.10 LAB.

IMPORTANTE
Este archivo sigue cargando la base v92.9 desde GitHub y aplica el parche antes de ejecutar su JS. Si el backend devuelve 0 y tampoco existe KNOWN_KEY en el dispositivo, el HTML no puede inventar el banco: en ese caso habrá que corregir la respuesta de la Edge Function Fluxia-banco.

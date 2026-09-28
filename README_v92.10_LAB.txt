FLUXIA v92.10 LAB
==================

Base: v92.9 publicada en GitHub Pages.
Tipo: LAB. NO es estable.

CORRECCIÓN CRÍTICA
------------------
v92.9 ejecutaba guardarConexiones(list) antes de su fallback. Si estado()
recibía 0 conexiones, podía escribir [] en localStorage y borrar la caché
local que después necesitaba para mostrar "Reconectar".

v92.10 instala un hotfix ANTES de los scripts de v92.9:
- bloquea únicamente la escritura [] sobre fluxia_banco_conexiones_v1
  cuando ya existían conexiones y fluxia_bancos_conocidos_v62 sigue presente;
- permite la desconexión explícita de todos, porque esa acción elimina primero
  KNOWN_KEY;
- no toca Supabase, tokens, credenciales ni conexiones del servidor;
- mantiene el fallback de v92.9 para mostrar los bancos guardados y ofrecer
  Reconectar;
- conserva la base funcional de v92.9.

IMPORTANTE
----------
Este LAB carga dinámicamente el HTML público v92.9 y aplica el hotfix antes
de que arranque su sincronización bancaria. Por ello el archivo es pequeño
y deliberadamente no contiene una copia duplicada de las ~24.000 líneas de
v92.9.

PRUEBA
------
1. Abrir directamente index_fluxia_v92_10.html.
2. Entrar en Ajustes > Bancos.
3. No desconectar ni borrar nada.
4. Comprobar si reaparece el banco como guardado/reconectable.
5. Si aparece "Reconectar", pulsarlo solo sobre el banco afectado.

VERSIÓN
-------
Archivo: index_fluxia_v92_10.html
Title: Fluxia BETA v92.10 LAB
LAB: sí
Estable: no

# Fluxia v95.3.0-LAB

**Selector de mes más limpio · No mostrar más persistente · nube sin flushes duplicados · UI refinada**

## Antes de subir
Descarga una copia de seguridad desde Ajustes.

## Subir a GitHub
Sube los 5 archivos: `index.html`, `index_fluxia_v95.3.0_LAB.html`, `fluxia-sw.js`, `fluxia-canal.json`, `manifest.webmanifest`.
Abre `https://nacram1987-cmd.github.io/Fluxia-v20/index.html?v=v95.3.0-LAB` y comprueba que la cabecera dice «Versión v95.3.0-LAB».

## Qué comprobar
- Dashboard y demás pestañas ya no muestran una línea independiente con la fecha de hoy.
- El selector muestra el mes y, cuando corresponde, `Hoy · 4 de octubre`.
- No hay botón Hoy separado.
- Una pregunta bancaria de clasificación tiene `🚫 No mostrar más`; la decisión queda persistida y sincronizada.
- Borrar un gasto o ingreso no debe hacer que reaparezca por una copia antigua.
- Ajustes → Cuenta y nube mantiene el contador de memoria local; esos ~5 MB son almacenamiento local del navegador, no Supabase.
- Al registrar varios movimientos no debe aparecer el lag provocado por flushes globales duplicados.

## Regla de estabilidad
La nube sigue siendo la fuente de verdad. Un cambio confirmado por Supabase no debe ser recuperado desde una copia local antigua.

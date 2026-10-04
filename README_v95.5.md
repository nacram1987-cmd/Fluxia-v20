# Fluxia v95.5-LAB

Versión de laboratorio preparada a partir de v95.3.0-LAB. **No promueve ni sobrescribe el canal ESTABLE.**

## Entrada LAB
`https://nacram1987-cmd.github.io/Fluxia-v20/index_fluxia_v95.5_LAB.html?v=v95.5-LAB`

## Entrada ESTABLE
`https://nacram1987-cmd.github.io/Fluxia-v20/index.html`

## Archivos que deben subirse para probar LAB
- `index_fluxia_v95.5_LAB.html`
- `manifest_v95.5_LAB.webmanifest`
- `fluxia-sw-v95.5.js`
- `fluxia-icon.svg`
- `apple-touch-icon.png`
- `icon-192.png`
- `icon-512.png`

Los documentos `PROMPT_MAESTRO_v95.5.txt`, `CHANGELOG_v95.5.md`, `AUDITORIA_v95.5.md`, `fluxia-canal-v95.5-LAB.json` y `SHA256SUMS_v95.5.txt` acompañan la entrega y sirven de trazabilidad.

## Modelo de datos v95.5
La nube sigue siendo la fuente de verdad. Las colecciones financieras se sincronizan por elemento con identidad estable, `_fxUpdatedAt`, lápidas de borrado y escritura optimista con relectura/fusión/reintento si otro dispositivo cambió la misma clave.

La caché local sigue siendo necesaria para respuesta inmediata y trabajo offline, pero una modificación funcional se encola para Supabase en el mismo flujo de guardado. Los metadatos puramente locales (PIN, sesión efímera, cachés y logs) no se consideran datos financieros de nube.

## Importante
Esta entrega incorpora una reparación idempotente de `Mantenimiento Césped`: asegura 35 € correspondientes a septiembre de 2026 y 35 € correspondientes a octubre de 2026 sin duplicar importes ya existentes.

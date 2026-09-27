# Fluxia · cómo publicar (canal estable)

## Archivos obligatorios en la raíz del repo (GitHub Pages / carpeta pública)

| Archivo | ¿Se toca a diario? | Para qué |
|---------|--------------------|----------|
| `index.html` | **No** | Puerta de invitados. Lee el canal y abre la app estable. |
| `fluxia-canal.json` | **Solo al promover** | Dice qué HTML es la versión oficial. |
| `index_fluxia_v90_10.html` | No borrar mientras sea la estable | App estable actual. |
| `fluxia-icon.svg` | Casi nunca | Icono / notificaciones. |

## Enlace que debes enviar a invitados

`https://TU_USUARIO.github.io/TU_REPO/`  
o  
`https://TU_USUARIO.github.io/TU_REPO/index.html`

**Nunca** envíes el enlace directo a `index_fluxia_v90_11.html` mientras estés probando.

## Flujo de trabajo

1. Pruebas nuevas versiones: sube `index_fluxia_v90_11.html`, etc.
2. **No** cambies `index.html` ni `fluxia-canal.json` hasta que la versión esté bien.
3. Cuando esté lista: actualiza `fluxia-canal.json` así:

```json
{
  "version": "90.11",
  "estable": "index_fluxia_v90_11.html",
  "actualizado": "2026-…",
  "nota": "…"
}
```

4. A partir de ese momento, el **mismo** enlace de invitación carga la 90.11.

## Datos de gastos

Este canal **no guarda ni borra** gastos. Los datos viven en el dispositivo (y en la nube si el usuario tiene cuenta Fluxia).

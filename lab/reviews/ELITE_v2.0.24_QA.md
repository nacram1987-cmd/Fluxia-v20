# Fluxia Élite BETA v2.0.24 — revisión previa a publicación

Origen: ZIP `Fluxia_Elite_BETA_v2.0.24_LIGERO.zip` facilitado por el usuario.

## Estado
- **No publicada**: el HTML del ZIP todavía no se ha transferido a esta rama.
- Rama aislada: `lab-elite-v2-0-24-review`.
- La versión estable y la ruta LAB pública permanecen sin cambios.

## Verificación local
- `node lab/qa/run-all.cjs`: 58 pruebas pasan, 0 regresiones nuevas, 25 pruebas obsoletas conocidas fallan.
- La nueva presentación centraliza importes mediante `monthExpenseFigures`.
- Los importes negativos en Variables continúan sumando en positivo; revisar semántica de devoluciones antes de certificar datos contables.

## Puertas de salida obligatorias
1. Transferir y revisar el HTML completo del ZIP y recursos de la carpeta `lab/`.
2. Confirmar que los archivos de producción existentes no se sobrescriben inadvertidamente.
3. Comprobar identidad de sesión, datos por usuario, huchas y conciliación real frente a HTML estable.
4. Confirmar que GitHub Pages sirve el nuevo build antes de anunciar un enlace.

Este documento **no implica** que la versión esté desplegada.
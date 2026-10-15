# Fluxia Élite BETA v2.0.25 · Conciliación del Disponible

Paquete completo (código, pruebas y documentos) de la rama LAB. **No sustituye al HTML estable.**

## Contenido
- `lab/fluxia-elite-safari-datos-reales.html` · app Élite (v2.0.25) · `lab/versions/fluxia-elite-safari-v2.0.25.html` snapshot inmutable
- `lab/js/fluxia-elite-*.js` · módulos (nuevo: `fluxia-elite-reconciliation-v1.js`)
- `lab/qa/` · pruebas (nuevo: `elite-reconciliation-v2025.cjs`, `lib/elite-html-functions.cjs`)
- `lab/tools/elite-reconcile-cli.cjs` · conciliación privada local
- `.github/workflows/` · QA y despliegue (con el paso nuevo)
- Documentos: `AUDITORIA_CONCILIACION_v2.0.25.md`, `INFORME_PRUEBAS_v2.0.25.md`, `VALORACION_v2.0.25.md`, `PLAN_PUBLICACION_v2.0.25.md`, `CHANGELOG_ELITE_v2.0.25.md`, `CHECKLIST_ELITE_v2.0.25.md`, `CHECKSUMS_v2.0.26.sha256`, `PROMPT_MAESTRO.md`

## Ejecutar pruebas
```
node lab/qa/elite-reconciliation-v2025.cjs
```
## Conciliar con datos reales (en tu equipo, sin red)
```
node lab/tools/elite-reconcile-cli.cjs --cloud export-nube.json --html copia-html.json \
  --month 2026-10 --cutoff 2026-10-15T10:00:00+02:00 --out ./privado
```
Código de salida: 0 = VERIFICADO · 1 = PROVISIONAL/PENDIENTE · 2 = entrada inválida. `privado/informe-privado.json` contiene IDs e importes: **no lo subas**.

## Estado
Con datos reales: **PROVISIONAL / No verificado** hasta aportar la copia del HTML y la exportación de la nube (ver auditoría §6).

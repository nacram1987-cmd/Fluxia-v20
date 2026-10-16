# Fluxia Élite BETA v2.0.27-LAB

Paquete de trabajo local derivado del ZIP v2.0.26 recibido. La rama estable, PWA raíz y datos financieros no se promocionan ni modifican.

## Probar localmente

Requiere Node.js 20 o posterior.

```sh
node lab/qa/elite-evidence-cut-guard-v2027.cjs
node lab/tools/elite-reconcile-cli.cjs --cloud export-nube.json --html copia-html.json --month 2026-10 --cutoff 2026-10-15T10:00:00+02:00 --out ./privado
```

Las exportaciones son datos privados; mantenerlas y los informes dentro de un directorio local excluido de Git. Los dos archivos deben pertenecer al mismo usuario/perfil y corte. La CLI es de solo lectura y un informe que no alcance certificación termina con estado provisional o pendiente.

## Límites de esta entrega

Esta copia no incluye una publicación de GitHub, ejecución de Actions, prueba de Safari/iPhone ni exportaciones reales del perfil. No es ESTABLE y no certifica Disponible ni sincronización bancaria.

## Archivos de versión

- `CHANGELOG_ELITE_v2.0.27.md`
- `ROLLBACK_v2.0.27.md`
- `INFORME_PRUEBAS_v2.0.27.md`

El ZIP no contiene el Git bundle de v2.0.26 porque dependía de un commit padre no incluido y no podía abrirse como historial autónomo. Los ficheros de aplicación, herramientas, pruebas y documentación están incluidos.

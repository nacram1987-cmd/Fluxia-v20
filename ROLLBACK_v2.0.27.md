# Rollback v2.0.27-LAB

La versión ESTABLE y la PWA raíz permanecen intactas. La nueva función solo afecta a la herramienta CLI privada y a la etiqueta de versión del HTML Élite LAB.

Para revertir el cambio funcional: restaurar `lab/tools/elite-reconcile-cli.cjs` y `lab/fluxia-elite-safari-datos-reales.html` desde el ZIP v2.0.26, y retirar `lab/tools/elite-evidence-cut-guard.cjs` y `lab/qa/elite-evidence-cut-guard-v2027.cjs`. No hay cambios de esquema, migración, escritura de nube ni modificación de datos.

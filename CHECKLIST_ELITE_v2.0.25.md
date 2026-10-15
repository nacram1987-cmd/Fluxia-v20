# Checklist Fluxia Élite v2.0.25

## Para ti (qué comprobar en Safari LAB)
- [ ] La cabecera dice «ÉLITE BETA · v2.0.25».
- [ ] Inicio → Disponible muestra `PROVISIONAL` o `PENDIENTE` (nunca «CALCULADO»). Solo aparece `✓ VERIFICADO` si los 8 criterios están en verde.
- [ ] «Certificado del Disponible»: 8 criterios [a]–[h] con causa y acción; 3 indicadores separados.
- [ ] «Cargar copia HTML»: exporta «Copia solo este perfil» desde el HTML estable y cárgala (mismo perfil, < 48 h).
- [ ] HTML ↔ Élite por módulo: todas las filas en `coincide` y Δ 0,00 €.
- [ ] Bancos: sincroniza (IDs estables) o declara explícitamente «sin movimientos bancarios» en el mes.
- [ ] Variables: una devolución resta del total de la pestaña.
- [ ] Exportar informe: el público no contiene IDs, nombres ni importes por registro.
- [ ] Cerrar sesión y entrar con otra cuenta: cero datos heredados.

## Para el release
- [ ] `node lab/qa/elite-reconciliation-v2025.cjs` (99/99) y los 29 scripts de CI en verde.
- [ ] Snapshot `lab/versions/fluxia-elite-safari-v2.0.25.html` idéntico al HTML.
- [ ] Rama LAB primero; no tocar HTML/PWA estable; verificar Actions y URL real antes de dar enlace.
- [ ] Solo «con labora» promueve a estable.

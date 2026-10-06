# Fluxia v95.77-LAB

## Saneamiento histórico autorizado de Huchas
- Se consolida el canon histórico validado de 7 huchas, eliminando la duplicación técnica `excel` + `rebase_v9538`.
- Total de aportaciones históricas conservadas: 3.191,36 €.
- Octubre conserva exclusivamente 671,72 € de aportaciones: Amortización 422,67 €, Renta 164,05 €, Boda Ana 50,00 € y Mantenimiento Césped 35,00 €.
- Tributos: rescate temporal pendiente de 240,48 € (15/09/2026). Saldo real: 150,00 €. Debe figurar como importe por reponer.
- Agua: uso definitivo de 132,90 € (27/09/2026). Saldo real: 1,10 €.
- Ajuste histórico de conciliación de Amortización: 0,10 €.
- Saldo real reservado esperado tras usos/rescates: 2.817,88 €.

## Integridad cloud
- Antes del saneamiento se guarda una cuarentena local del estado previo.
- Se reemplazan exactamente `v2_provisiones` y `v2_usos` del perfil autenticado y se verifica su lectura desde nube antes de marcar el saneamiento como completado.
- El proceso es idempotente mediante marcador propio de v95.77.
- No se modifican Ingresos, Fijos ni Variables.
- La pensión pendiente no se altera en esta versión; sigue fuera del disponible hasta que se confirme su cobro.

## PWA / versionado
- HTML, manifest y Service Worker quedan alineados en v95.77-LAB.
- La ESTABLE permanece protegida y no se modifica.

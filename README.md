# Fluxia

**Canal:** LAB  
**Versión:** v95.78-LAB  
**Base:** v95.77-LAB  
**Principio rector:** cada mejora suma; ninguna mejora sacrifica integridad.

## Objetivo de esta entrega
v95.78 corrige la causa por la que v95.77 podía seguir mostrando los importes antiguos aun conteniendo el canon correcto: el saneamiento confiaba en un marcador local y, tras confirmar la escritura cloud, llamaba de nuevo a `cargarTodo()`, pudiendo rehidratar el estado histórico inmediatamente.

## Canon autoritativo de Huchas
- 7 huchas reales.
- Aportaciones brutas históricas: **3.191,36 €**.
- Usos/rescates: **373,48 €**.
- Saldo real reservado: **2.817,88 €**.
- Octubre: **671,72 €** aportados.
- Tributos: **150,00 €** de saldo + **240,48 € por reponer**.
- Agua: **1,10 €** tras pago definitivo de **132,90 €** del 27/09/2026.

## Cambios v95.78
- El marcador de saneamiento solo permite saltar la operación si el estado real ya coincide con el canon.
- Nuevo marcador v95.78 para forzar una pasada limpia desde v95.77.
- Tras verificación cloud, el estado canónico se mantiene en memoria y se repinta sin `cargarTodo()` inmediato.
- El éxito del cambio de contraseña muestra: **«La contraseña ha sido cambiada con éxito»**.

## Gobierno de entregas
Cada versión completa incluye PROMPT MAESTRO, README, CHANGELOG, CHECKLIST, HTML, manifest, Service Worker e iconos.

## Próxima fase
Validar huchas y persistencia. Si pasa, preparar candidata PWA y después revisar bancos.

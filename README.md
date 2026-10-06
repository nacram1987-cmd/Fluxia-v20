# Fluxia

**Canal:** LAB  
**Versión:** v95.79-LAB  
**Base:** v95.78-LAB  
**Principio rector:** cada mejora suma; ninguna mejora sacrifica integridad.

## Qué corrige esta entrega
La v95.78 contenía el canon correcto, pero coexistía con un registro legacy de Service Worker (`v95.65`) capaz de volver a controlar el mismo scope en Safari. Además, una hidratación tardía podía volver a pintar el snapshot histórico antes de que el reemplazo cloud quedara firme.

La v95.79 elimina esas dos vías de regresión: el LAB registra únicamente el Service Worker de la versión actual y, durante la migración pendiente, aplica el canon validado antes de renderizar exclusivamente en el perfil histórico recuperado. Una vez confirmada la escritura cloud, el marcador v95.79 deja libres las ediciones futuras.

## Canon autoritativo de Huchas
- 7 huchas reales.
- Aportaciones brutas históricas: **3.191,36 €**.
- Tributos: **150,00 €** de saldo y **240,48 € por reponer**.
- Agua: **1,10 €** tras pago definitivo de **132,90 €** del 27/09/2026.
- Ajuste definitivo de Amortización: **0,10 €**.
- Saldo real reservado: **2.817,88 €**.
- Octubre: **671,72 €** aportados.

## Contraseña
- El flujo de recuperación apunta a **v95.79-LAB**, no a una versión antigua.
- `same_password` deja de presentarse como error: significa que la contraseña introducida ya es la vigente y el flujo continúa.
- Mensaje final: **«La contraseña ha sido cambiada con éxito»**.

## PWA / caché
- HTML, manifest y Service Worker alineados en v95.79-LAB.
- Eliminado el registro hardcodeado de `fluxia-sw-v95.65.js`.
- Registro del SW actual con `updateViaCache: none`.

## Gobierno de entregas
Toda entrega completa incluye PROMPT MAESTRO, README, CHANGELOG, CHECKLIST, HTML, manifest, Service Worker e iconos. La ESTABLE permanece protegida hasta promoción explícita.

## Siguiente fase
Validación manual en Safari de huchas + reentrada. Si pasa, candidata PWA y después bancos.

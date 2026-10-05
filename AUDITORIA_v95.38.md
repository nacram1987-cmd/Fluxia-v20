# Auditoría de almacenamiento · Fluxia v95.38 LAB

## Hallazgo raíz confirmado
La v95.37 reconstruía localmente el canon de Huchas y después el motor v95.22 de arranque fusionaba listas protegidas local+nube por ID. Eso convertía el histórico remoto anterior en movimientos adicionales.

La captura de prueba muestra la firma exacta del problema:
- Renta: 1.148,35 € = 656,20 € canónicos + 492,15 € del histórico v94.26.
- Amortización: 2.958,59 € = 1.690,58 € canónicos + 1.268,01 € del histórico v94.26.
- Boda Ana: 250 € = 150 € canónicos + 100 € antiguos.
- Seguro de coche: 200 € = 100 € canónicos + 100 € antiguos.

No era un error de render: la nube antigua estaba siendo reinyectada por el merge de arranque.

## Corrección arquitectónica
- Se elimina la unión de listas financieras en `_reconciliar()` cuando no hay cambios locales pendientes. La nube vuelve a ser fuente de verdad real.
- La concurrencia se mantiene en escritura mediante CAS.
- Se incorpora `Almacen.reemplazarExacto(k,v)`: activa una marca local persistente `__exact__<clave>`, impide la fusión con remoto, escribe mediante CAS y relee la fila cloud. La marca solo desaparece tras igualdad exacta.
- El rebase v95.38 reemplaza íntegramente `v2_provisiones` y `v2_usos`, con IDs nuevos y cuarentena previa.

## Canon recuperado
Total: 2.817,88 €.
- Amortización 1.690,58 €
- Renta 656,20 €
- Tributos 150,00 € (240,48 € temporal pendiente)
- Boda Ana 150,00 €
- Mantenimiento Césped 70,00 €
- Agua 1,10 € (pago definitivo 132,90 € el 27/09/2026)
- Seguro de coche 100,00 €

## Ingresos
El merge por elemento ahora favorece explícitamente cualquier copia con `_fxManualEdit=true` frente a una copia bancaria. El editor ya marca `_fxManualEdit`, `mesManual` y `_fxUpdatedAt` monotónico.

## Validaciones
- 97 scripts inline: 0 errores de sintaxis.
- Canon matemático: 2.817,88 € exactos.
- Rebase exacto presente y merge de arranque legacy ausente.
- Borrado de aportación registra tombstone antes de filtrar.
- ESTABLE `index.html` permanece sin modificar respecto a la entrega v95.37 (que ya contenía v95.25 estable).

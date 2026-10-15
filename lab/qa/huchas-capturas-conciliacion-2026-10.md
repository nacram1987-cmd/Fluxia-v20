# Conciliación de huchas · capturas del usuario

**Corte de referencia de las capturas:** octubre de 2026 (según lo que muestra la interfaz).
**Fuente persistida consultada:** `public.fluxia_datos`, perfil exacto `usr-068a982d-9638-40cc-8b8c-a595534ab36d`, filas de provisiones y usos.
**Última actualización de esas filas en Supabase:** 5 de octubre de 2026. No se modifica esta fuente desde este informe.

## Referencia visible en las capturas

| Hucha | Plan mensual | Saldo acumulado mostrado | Aportado en octubre | Pendiente del plan de octubre |
|---|---:|---:|---:|---:|
| Seguro de coche | 50,00 € | 100,00 € | 0,00 € | 50,00 € |
| Tributos (IBI, Basura, Vehículo) | 130,16 € | 150,00 € | 0,00 € | 130,16 € |
| Agua | 67,00 € | 1,10 € | 0,00 € | 67,00 € |
| Boda Ana | 50,00 € | 150,00 € | 50,00 € | 0,00 € |
| Amortización | 422,67 € | 1.690,68 € | 422,67 € | 0,00 € |
| Renta | 164,05 € | 656,20 € | 164,05 € | 0,00 € |
| Mantenimiento Césped | 35,00 € | 0,00 € | 35,00 € | 0,00 € |
| **Total** | **918,88 €** | **2.747,98 €** | **671,72 €** | **247,16 €** |

La pantalla también muestra **240,48 € pendientes de reponer** por un rescate temporal de Tributos. Se muestra por separado: no se añade otra vez al saldo reservado.

## Resultado de Supabase

Las siete provisiones y los planes mensuales coinciden con la referencia. Las aportaciones de octubre coinciden en Amortización (422,67 €), Renta (164,05 €), Boda Ana (50,00 €) y Mantenimiento Césped (35,00 €); las otras tres aparecen sin aportación en octubre. El rescate de Tributos de 390,48 € tiene 150,00 € repuestos, por lo que el pendiente de reponer de **240,48 €** sí coincide.

Sin embargo, la fila consultada se actualizó el **5 de octubre**, y no concilia con los saldos de las capturas. La reconstrucción bruta/neto de ese snapshot da:

| Hucha | Neto derivable de ese snapshot | Captura | Diferencia (snapshot − captura) |
|---|---:|---:|---:|
| Seguro de coche | 150,00 € | 100,00 € | +50,00 € |
| Tributos | 150,00 € | 150,00 € | 0,00 € |
| Agua | 68,10 € | 1,10 € | +67,00 € |
| Boda Ana | 200,00 € | 150,00 € | +50,00 € |
| Amortización | 1.690,68 € | 1.690,68 € | 0,00 € |
| Renta | 656,20 € | 656,20 € | 0,00 € |
| Mantenimiento Césped | 70,00 € | 0,00 € | +70,00 € |
| **Total** | **2.984,98 €** | **2.747,98 €** | **+237,00 €** |

## Acción segura y siguiente paso

No se escriben saldos como sustituto de transacciones: falta el registro HTML operativo actualizado que permita identificar los movimientos exactos por ID, fecha, tipo e importe. El total de capturas es una referencia visual, no autorización para inventar o borrar operaciones. Para conciliar realmente, importa en Élite el respaldo/exportación actual del mismo perfil, desde el HTML madre operativo, y revisa el comparador de Huchas. Solo tras que el conjunto de IDs y cantidades concuerde se podrá actualizar Supabase de forma idempotente y volver a comprobar los siete saldos.

> Estado: diagnóstico reproducible; Supabase sin cambios; la captura no se ha presentada como saldo certificado.

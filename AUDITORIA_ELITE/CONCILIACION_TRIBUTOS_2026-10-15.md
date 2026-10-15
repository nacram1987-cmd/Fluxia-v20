# Fluxia Élite — Corte de conciliación, 15/10/2026

## Evidencia de HTML operativo (captura aportada por usuario)
Hucha Tributos (IBI, Basura, Vehículo):
- 01/07/2026 aportación +130,16 EUR
- 01/08/2026 aportación +130,16 EUR
- 01/09/2026 aportación +130,16 EUR
- 01/09/2026 rescate temporal −240,48 EUR
- 15/10/2026 rescate temporal −150,00 EUR, destino declarado Revolut
- Entradas 390,48 EUR; salidas 390,48 EUR; saldo 0,00 EUR
- Por reponer: 390,48 EUR, conforme a etiqueta «faltan» de la vista operativa.

## Evidencia de Supabase (consulta read-only)
- public.fluxia_datos, clave v2_usos: última actualización 08/10/2026 09:29:08 UTC.
- Aparecen múltiples registros antiguos de Tributos por 240,48 EUR, incluidos seis con fecha 15/09/2026, de varias migraciones.
- Esa colección NO contiene evidencia actual del rescate del 15/10/2026.
- v2_provisiones está actualizada por última vez el 08/10/2026; v2_movimientos el 04/10/2026.
- No se autoriza tratar versiones históricas como fuente operativa ni borrar registros por similitud de importes.

## Reglas de conciliación pendientes de aplicar a una fuente vigente
1. Identificar propietario y perfil; recuperar snapshot HTML operativo actualizado, con ID real por movimiento.
2. Confirmar si el registro de 150 EUR existe en la fuente canónica antes de cualquier alta; si existe, no repetirlo.
3. Emparejar cada movimiento por ID, perfil, fecha, importe en céntimos, categoría, tipo y estado.
4. Consolidar exclusivamente registros canónicos; poner duplicados históricos en revisión, sin destrucción.
5. Liberar 150 EUR de reserva de Tributos hacia Revolut como traslado interno. No generar ingreso ni variable.
6. Mantener separados saldo de hucha (0 EUR) y deuda interna pendiente de reponer (390,48 EUR).
7. No presentar Disponible como certificado hasta conciliar variables, fijos, pagos, cartera y banco.

## Estado de entrega
- Evidencia documental/fixture de regresión: registrada.
- Lecturas Supabase: efectuadas, sin escrituras.
- Migración/reconciliación en datos productivos: BLOQUEADA hasta snapshot canónico actualizado.
- Dashboard disponible certificado: PENDIENTE.
- HTML estable/PWA de producción: SIN CAMBIOS.

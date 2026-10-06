# Fluxia v95.76-LAB

## Corrección principal
- Deduplicación quirúrgica de Huchas recuperadas desde el namespace histórico del mismo perfil.
- Detectado en Supabase: la copia `p_<profile>__v2_provisiones` contenía 14 entradas pero solo 7 nombres reales; cada hucha aparecía como pareja `excel` + `rebase_v9538`.
- Se conserva como canon la entrada `rebase_v9538`, porque contiene la historia consolidada, y se incorporan únicamente aportaciones `excel` que no existan ya por fecha+importe.
- No se deduplican huchas manuales ni duplicados de otros orígenes.
- La recuperación es de solo lectura: no borra ni altera filas de Supabase.

## Integridad
- Ingresos, Fijos y Variables no se modifican.
- Los usos/rescates de huchas no se alteran.
- El total de huchas deja de duplicarse por representaciones históricas repetidas.
- La ESTABLE permanece intacta.

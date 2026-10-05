# Auditoría v95.46-LAB

## Causa raíz de Gastos fijos desaparecidos
La migración v95.45 consideraba el namespace del perfil como una unidad: si **cualquier** clave `profile:<id>:*` ya existía, `recuperarDatosLegacyParaPerfil()` devolvía “namespace ya contiene datos” y no copiaba ninguna otra clave legacy. Un perfil podía recuperar Ingresos/Variables/Financiaciones y quedarse sin `v2_fijos`. El Dashboard seguía mostrando Financiación porque `gastosFijosTotal()` suma fijos + financiación; la pestaña, en cambio, mostraba `fijosTotal` como solo la lista fija, por eso aparecía 0,00 €.

## Corrección
- Migración complementaria **por clave** para `v2_fijos`, únicamente dentro de la misma cuenta Supabase autenticada.
- Se acepta `v2_fijos` o la variante histórica `planRescate_v2_fijos`.
- No se copia si el perfil actual ya tiene gastos fijos.
- Backup previo y lectura posterior de verificación.
- El panel Fijos usa el mismo total contable que Dashboard y muestra el desglose.

## Seguridad
No se han incrustado en el HTML los gastos personales encontrados en backups. La recuperación depende de la cuenta cloud autenticada.

## Riesgo residual
Si la fila legacy de Gastos fijos ya fue eliminada también de Supabase, esta release no puede inventarla. En ese caso debe importarse explícitamente un backup privado del usuario; no se publicará su contenido en GitHub.

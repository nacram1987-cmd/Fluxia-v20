# Fluxia Élite BETA v2.0.19

## Cambios

- **Corrección de alcance mensual:** los gastos fijos se filtran por el mes exacto, normalizado; ya no se suman los registros de otros meses.
- Los planes de huchas y financiaciones interpretan los nombres de meses en minúsculas y respetan el inicio y fin del plan.
- Los rescates que ya están repuestos no se anuncian como una suma provisional. Solo un pendiente real afecta al Disponible.

- **Inicio muestra el Disponible mensual** cuando las colecciones canónicas e importes base están completos, aunque falte el cotejo final con el HTML.
- La cifra aparece con badge **PROVISIONAL** mientras el perfil/corte no esté certificado.
- Un rescate temporal sin `provisionId` puede sumarse provisionalmente solo si el nombre coincide exactamente con una única hucha, el ID del rescate es único, la fecha/mes e importes son válidos y el historial de reposiciones cuadra.
- Un ID explícito conflictivo, nombres ambiguos, IDs duplicados, registros archivados o reposiciones no verificables siguen bloqueando el cálculo.
- La certificación permanece bloqueada hasta cotejar identidad por ID, snapshot/corte HTML y fuentes requeridas. No se modifican colecciones ni movimientos de Supabase.
- Bancos y sus saldos siguen separados del Disponible mensual.

## Verificación

- Regresión integrada con fixtures sintéticas: un gasto fijo de septiembre no se resta en octubre; los planes terminados no cuentan, una hucha iniciada en julio sí cuenta en octubre y el rescate ya repuesto no afecta al Disponible. Los casos de nombre ambiguo, ID duplicado, ID explícito incorrecto e historial inválido siguen bloqueados.
- Pruebas bancarias/perfil, cabecera y protección de certificación existentes: aprobadas.
- Verificador de la base v97.66: 6 archivos inmutables verificados.
- `npm test` de la base: aprobado; 400 movimientos, navegación, caché, perfil y 10 casos de rescate.
- Sintaxis de todos los scripts inline del HTML Élite: aprobada.
- GitHub Actions y smoke de Pages: pendientes de ejecución tras publicar el commit.
- No se guardan importes ni IDs personales en el fixture o el código.

## Pendiente para certificar la cuenta

- Cotejar las colecciones del mismo perfil/mes con una copia reciente del HTML operativo y el CSV del corte.
- Confirmar el ID estable de la hucha para el rescate; hasta entonces la coincidencia exacta de nombre se rotula provisional.
- La última marca en Supabase para saldos de CaixaBank y Revolut es del 28/09/2026. Hace falta una lectura bancaria nueva; CaixaBank puede seguir sujeto al límite HUB046 del proveedor.

## Rollback

Restaurar `lab/fluxia-elite-safari-datos-reales.html` al commit padre y retirar la versión 2.0.18, su fixture y checklist. No se ha tocado la PWA raíz/estable.

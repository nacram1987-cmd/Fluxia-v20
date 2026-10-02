# Fluxia v94.31-LAB
Base: v94.30 (autoguardado + cabeceras PSU). Cambios:

1. FIJOS Y PRÉSTAMOS: un gasto del banco que coincide en importe con un fijo (p.ej. Loterías 11 €) o con la
   cuota de un préstamo (p.ej. Préstamo 1, 275,19 €) se PREGUNTA en el aviso «📌 Revisa estos pagos» de Inicio.
   También se repasan, una sola vez cada uno, los gastos del banco ya apuntados en los últimos 45 días.
2. CAIXABANK: con permiso vivo se muestra «✅ Conectado» (verde) aunque el banco haya cortado las consultas de hoy.
   Solo sale «Reconectar» si el permiso caduca de verdad.

El .ts NO cambia respecto a v94.30. Si pegaste el de "b", vuelve a pegar este (ver COPY_TO_SUPABASE.txt).

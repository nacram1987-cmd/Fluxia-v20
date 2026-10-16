# Auditoría de conciliación · v2.0.29-LAB

## Regla del HTML estable (verificada en el código de `index.html`)

- Ingresos: `ingresosDe(mes)` cuenta una sola vez cada `bancoRef` por mes.
- Gastos (Variables): **no hay deduplicación por `bancoRef` al leer ni tras sincronizar**. `FluxiaSalud.reportDuplicados` los lista,
  `estadoSalud` muestra un contador «Duplicados» y `limpiarDuplicadosBancoRef` los fusiona **solo si se ejecuta a mano**
  (la llamada tras sincronizar usa `var _ld={quitados:0}`: neutralizada). Por tanto el HTML cuenta todas las filas.
- Huchas: `provisionUsadoTotal(p)` = usos con `u.provision===p.nombre` (igualdad exacta, sin ID).

## Aplicación en la LAB

Paridad contable conservada (el Disponible no cambia). Los grupos con el mismo `bancoRef` se clasifican con evidencia y bloquean `VERIFICADO`.
Un grupo solo deja de bloquear cuando la fuente (nube/HTML) deja de repetir el identificador; la LAB nunca fusiona ni borra.

## Estado de la certificación real

**PROVISIONAL / no certificable desde esta sesión.** La sesión de desarrollo no tiene acceso a Supabase (sin credenciales ni conector; RLS exige la sesión
del usuario), así que **no se ha clasificado ninguno de los cinco grupos reales ni ninguno de los vínculos de hucha**. La herramienta
`lab/tools/elite-reconcile-cli.cjs --history …` produce esa clasificación y su evidencia con los datos del propio usuario, en local.

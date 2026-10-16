# Auditoría de conciliación · v2.0.27-LAB

## Hallazgo corregido

La CLI anterior aceptaba una diferencia de más de una hora entre `--cutoff` y las copias, mostraba un aviso y seguía generando informe. También aceptaba que el mes de la exportación de nube no coincidiera con el solicitado. Ahora esas situaciones detienen la ejecución antes de crear los archivos de salida.

## Cobertura ejecutada

- Las fechas deben incluir zona horaria y ser válidas.
- `accounting_month` debe coincidir con `--month`.
- `--cutoff` debe coincidir con exportación de nube y copia HTML en un margen máximo de una hora.
- HTML y nube deben estar dentro de una hora entre sí.
- Se prueba el comportamiento de la CLI: código de salida 2, error explicativo y sin directorio de informes cuando falla la comprobación.

## Resultado y límites

Los casos automatizados son sintéticos. No se suministraron exportaciones reales del perfil, por lo que no se compararon IDs ni importes de octubre. El Disponible real continúa sin verificar; banca real y RLS tampoco se han probado. No se realizaron escrituras, importaciones ni fusiones.

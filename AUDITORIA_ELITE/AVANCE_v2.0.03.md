# Fluxia Élite BETA v2.0.03 · Huchas por mes e histórico

15/10/2026. Rama `pages-v9731-real-final`. Restauración v2.0.02: `3699c6dad377997535e7807c64b1fbde92b77f16`. Copia exacta de esta entrega: `lab/versions/fluxia-elite-safari-v2.0.03.html`.

## Hecho

- Leídas las funciones del HTML operativo `renderProvisiones`, `provisionAportadoAcumulado`, `provisionUsadoAcumulado`, `provisionAportadoTotal`, `provisionUsadoTotal` e `iconoProvision`. El HTML presenta Guardado del mes elegido y un icono por nombre; la vista Élite reproduce esa separación sin crear operaciones.
- Cada tarjeta muestra aportado este mes, hasta el mes elegido y en todo el histórico; saldo reconstruido al cierre seleccionado y de toda la vida; retiradas temporales/definitivas, reposiciones y pendiente de devolver. Un desplegable enumera importes y cantidad de aportaciones por mes y año.
- El total superior de Huchas enseña el acumulado reconstruido de toda la vida si el conjunto pasa las comprobaciones de fuente y un saldo al cierre del periodo si cada hucha tiene trazabilidad. Ambos se rotulan provisionales hasta cotejar con el HTML operativo.
- Los símbolos de categoría usan la misma precedencia de `PV_ICONOS` del HTML; por ejemplo Césped 🌿, Tributos 🏛️, Boda 🎁 según la regla original. Élite no consulta Wikidata para Huchas.
- Las tarjetas separan botón Detalle del historial desplegable. La fecha de cada reposición determina el mes en que vuelve al saldo. Un `mes` original contradictorio con la fecha se marca como incidencia.

## Evidencia y límites

Fixtures sintéticos prueban aportaciones de 2025/2026 sin mezclarlas, retiro en septiembre y reposición en octubre, saldo de septiembre frente a octubre, total agregado por mes, iconos originales y conflicto mes/fecha. Se mantienen regresiones de fuente ausente, IDs, céntimos, archivo, sesión, paridad sintética y v97.66. La QA y Pages deben confirmar el commit.

El HTML original tiene funciones de escritura y sincronización no portadas aún. El histórico presentado es una reconstrucción por registros de la fuente elegida y su estado, **no una certificación de paridad con el HTML activo**. No hay exportación actual al mismo corte ni auditoría de dos usuarios RLS o pruebas iPhone físico. No se han modificado movimientos reales ni la estable. Disponible y bancos contables permanecen bloqueados.

## Qué comprobar en casa

Abrir `?v=2.0.03`, entrar en Huchas y alternar septiembre/octubre. Para Mantenimiento césped, comprobar las aportaciones de 35 € por mes si siguen existiendo en esa fuente; el histórico de aportaciones será 70 € solo si ambas están presentes y sin incidencias. Revisar el desplegable por mes, símbolos originales y que abrirlo no lance Detalle. Comparar las cifras visibles con el HTML original del mismo perfil sin editar movimientos.

Valoración estimada /100: integridad 60; seguridad 47; persistencia 48; paridad 45; banca 31; rendimiento 53; diseño 73; iOS 35; comercial 25. No son certificaciones. Siguiente prioridad: cotejo de exportación HTML operativa y operaciones de Huchas, luego RLS con dos cuentas y cierre de conflictos bancarios.

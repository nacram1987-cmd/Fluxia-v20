# Fluxia Élite BETA v2.0.01 · guardas contables de Huchas

Fecha: 15/10/2026. Rama: `pages-v9731-real-final`. Rollback anterior: `e84006483d8e481dda9bfcdc13555911f05ef34e` (v2.0.00). Archivo versionado: `lab/versions/fluxia-elite-safari-v2.0.01.html`.

## Implementado

- Fechas de aportaciones y usos verificadas como días reales, incluidos años bisiestos. Una fecha imposible o ausente no certifica el balance global; la hucha afectada indica el problema.
- Los usos marcados como archivados, anulados, eliminados o en papelera no se descuentan silenciosamente como operaciones vigentes. Quedan pendientes de interpretar contra el HTML original.
- Las reposiciones individuales requieren ID, fecha e importe exacto. Un ID repetido en usos diferentes marca conflicto en las dos huchas, tanto en el balance como en la tarjeta individual.
- La vista agregada de reposiciones detecta colisiones de ID entre usos; las pruebas de estas reglas pasan a la QA automática de la rama.

## Estado de la evidencia

La prueba sintética cubre el 31 de febrero, archivo, doble uso de reposición, centésimas inválidas, aislamiento de la hucha no afectada y recuperación de la semántica provisional. Se mantienen las pruebas de paridad CSV, cartera, módulos, sesión, bancos y v97.66. Los workflows de Pages y espejo deben confirmarse en cada commit.

No se han comparado todavía los registros vivos del HTML con la misma cuenta, perfil y corte; tampoco se ha probado RLS con dos cuentas reales, Safari/iPhone físico ni proveedor bancario real. La importación contable bancaria, Disponible certificado y promoción a estable siguen bloqueados. No se escribieron datos financieros de usuario.

## Qué verificar en casa

1. Abrir `?v=2.0.01` y comprobar el número de versión.
2. En Huchas, revisar un retiro y sus reposiciones: ID, fecha y estado; las huchas ajenas deben conservar su desglose.
3. Verificar que el total global no se presente como certificado si una hucha tiene conflicto o historial incompleto. Comunicar diferencias de importes sin corregir los movimientos a mano.

Siguiente prioridad: cotejo por ID y céntimos con exportación operativa del HTML; después RLS y dos cuentas de QA, conflictos bancarios y rendimiento físico. Valoración estimada: integridad 58/100; seguridad 47; persistencia 48; paridad 42; banca 31; rendimiento 53; diseño 70; iOS 35; comercial 25. No son certificaciones.

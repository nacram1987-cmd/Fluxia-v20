# Fluxia HTML — cambios del hotfix de Disponible

**Canal:** HTML/PWA. Este cambio no es Élite.

**Identificación:** hotfix HTML de Disponible (15/10/2026) sobre la base LAB servida v97.66, con build `hotfix-disponible-20261015`. No se anuncia como nueva versión numerada. La raíz/PWA estable v97.66 queda intacta.

## Cambios

- El Disponible incluye rescates temporales de hucha aún pendientes de reponer.
- Usa la fecha real del rescate para asignarlo al mes correcto.
- Añade solo el importe pendiente: `máximo(0, importe − repuesto)`, a céntimos.
- Una reposición reduce el aumento pendiente; al quedar repuesto completamente, deja de sumar.
- Usos definitivos y rescates de otros meses no cambian el Disponible seleccionado.
- Recalcular la pantalla no vuelve a sumar el rescate.
- No cambia Variables, movimientos bancarios ni datos guardados. Usa `lab/fluxia-sw-html-hotfix.js`, aislado para LAB; el manifiesto y el worker compartido permanecen intactos. La raíz/PWA estable no cambia.

## Verificación

- Regresión dirigida: **10 casos aprobados**, incluido −200 € + 100 € = −100 €.
- Verificador de base: **6 archivos inmutables v97.66 aprobados**.
- Sintaxis del test: aprobada.
- Suite completa `npm test --prefix auditorias/qa-v97.66`: **aprobada**. Incluye 400 movimientos sintéticos, menú/navegación, invalidación, perfil, invariantes de bancos y los diez casos de rescate. Se usaron dependencias ya instaladas en otro checkout local; no se cambió la lockfile.
- Sintaxis: los 168 scripts inline del HTML candidato parsean correctamente.
- GitHub Actions: QA completo, benchmark, deploy y smoke **aprobados** en commit `040f894ac8d62713b876625213498750f01aba46`.
- LAB: [abrir HTML](https://nacram1987-cmd.github.io/Fluxia-v20/lab/) · HTTP 200; contiene el cálculo y el worker hotfix.
- ESTABLE: [abrir HTML/PWA](https://nacram1987-cmd.github.io/Fluxia-v20/) · HTTP 200; verificado que no contiene el hotfix.
- Safari/PWA físico: pendiente de prueba en el iPhone. La PWA estable no se modifica.

## Bancos

La conexión bancaria no se ha cambiado. Último estado revisado: Revolut sincronizado el 15/10/2026; CaixaBank con autorización vigente, pero bloqueado por límite diario del proveedor (HUB046). Los movimientos cargados siguen disponibles; no hace falta reconectar.

## Rollback

Restaurar `lab/index.html` y eliminar `lab/fluxia-sw-html-hotfix.js` al commit padre del hotfix. Manifiesto, worker compartido y raíz/PWA estable no se modificaron.

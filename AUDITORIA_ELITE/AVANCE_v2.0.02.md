# Fluxia Élite BETA v2.0.02 · fuente ausente y plan mensual

15/10/2026. Rama `pages-v9731-real-final`; rollback v2.0.01: `7487b7cc8e206fe500fa4faf3f14ebbef54ad958`. Copia de entrega en `lab/versions/fluxia-elite-safari-v2.0.02.html`.

## Cambio ejecutable

- Una hucha sin historial `aportaciones` se declara sin fuente. Ya no produce un falso saldo 0 €, aportación mensual 0 €, ni pendiente mensual derivado de ese cero.
- Una hucha con `aportaciones: {}` puede presentar cero, siempre que también exista la fuente de usos; la ausencia de usos permanece sin fuente.
- Los campos de provisión mensual discordantes, negativos, no numéricos o con precisión superior al céntimo bloquean previsión y pendiente. El conflicto se muestra para la hucha, sin modificar registros.
- El desglose bruto muestra «Por conciliar» para una hucha con aportaciones inválidas y mantiene visible a otra hucha independiente. El total global no se certifica.

## Pruebas y límites

Fixtures sintéticos de fuente ausente/vacía, fuente de usos ausente, planes contradictorios y precisión monetaria; regresiones previas de fechas, archivo, reposiciones y separación de fuentes; baseline v97.66 y módulos históricos. El workflow de espejo ejecuta las pruebas relevantes; la puerta completa de Pages debe pasar en la entrega.

No se dispone aún de una exportación operativa al mismo corte para certificar HTML ↔ Élite, ni de dos cuentas reales de QA para RLS, bancos reales o un iPhone físico controlado. No se han escrito movimientos reales ni modificado la estable. Bancos, Disponible y saldo global continúan bloqueados para certificación.

## Qué revisar en casa

Abrir `?v=2.0.02`; comprobar la versión y entrar en Huchas. Si alguna no tiene historial recuperado, debe decir «sin fuente disponible» y usar rayas en importes desconocidos. Una hucha verdaderamente vacía con fuentes presentes puede mostrar 0 €. Revisar que prevista y pendiente no se inventen cuando los campos de plan discrepan.

Siguientes prioridades: captura operativa HTML al mismo corte, conciliación ID/céntimos de cada módulo, pruebas RLS con dos cuentas, conflictos/tombstones bancarios, medición física Safari/iPhone. Evaluación estimada /100: integridad 59, seguridad 47, persistencia 48, paridad 42, banca 31, rendimiento 53, diseño 70, iOS 35, comercial 25; no es una certificación.

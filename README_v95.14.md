# Fluxia v95.14 BETA

Versión centrada en integridad contable de Huchas/Provisiones. Al primer arranque reconciliará las siete huchas conocidas con sus aportaciones históricas reales y los usos verificados, conservando una cuarentena del estado previo. El saldo de control esperado al 04/10/2026 es 2.817,88 €.

Validación recomendada: abrir Huchas, comprobar total, revisar Disponible de octubre, cerrar/reabrir y volver a comprobar. Después sincronizar bancos y repetir.

## Corrección final solicitada · Boda Ana
- Boda Ana queda con **100 € netos de saldo histórico** antes de la nueva aportación de octubre.
- El ajuste que complete ese saldo se etiqueta como recuperación histórica (`impactaDisponibleHistorico:false`) y **no reduce el Disponible actual**.
- El usuario añadirá después **50 € manualmente**; esa aportación sí será nueva de octubre y sí afectará al Disponible.
- No se inyectan esos 50 € actuales en la build.

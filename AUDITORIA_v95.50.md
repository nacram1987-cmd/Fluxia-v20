# Auditoría v95.50

Esta versión no ejecuta reparaciones ni migraciones financieras nuevas. El ajuste del Disponible es de trazabilidad: muestra los términos que ya usa `disponibleEfectivo`, incluido `impactoCajaCompartidosMes`, evitando que el total parezca no cuadrar con las cuatro tarjetas visibles.


## v95.50
- Dashboard premium alineado con la referencia visual aprobada.
- Se eliminan saludo y versión redundantes del Dashboard.
- Pensión prevista no entra en Disponible hasta cobro confirmado (pagadoEl/bancoRef/pagoBanco).
- Cambio exclusivamente de cálculo/representación: no migra, borra ni reescribe movimientos financieros.

# AUDITORÍA v95.53

## Hallazgo
Entre capturas consecutivas, el total de Variables pasó de 351,76 € a 248,48 € tras registrar un pago de Hucha. Esa caída de 103,28 € explica un aumento artificial del Disponible de la misma magnitud. La fórmula de Disponible no usa `usosProvisiones`; por tanto el problema no era el pago de Hucha como concepto, sino una mutación colateral de otra colección durante/tras la operación.

## Corrección
Se establece una transacción de integridad al pulsar `Usar dinero`: se captura Variables y Compartidos. Después de confirmar el uso se comprueba que ningún registro previo haya desaparecido. Si falta alguno se restaura ese registro y se persiste de nuevo; no se reemplaza la lista completa y se conservan registros nuevos que hayan podido llegar.

## Riesgo residual
Si una mutación colateral cambia un registro existente sin eliminarlo, el guard no lo revierte automáticamente para no pisar una actualización bancaria legítima. Queda registrado diagnóstico de la transacción para futuras auditorías.

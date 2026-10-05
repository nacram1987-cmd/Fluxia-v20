# Auditoría v95.43

## Causa raíz identificada
Dos automatismos seguían violando el aislamiento y los borrados:
1. El rebase autoritativo v95.38 se ejecutaba automáticamente en cada perfil y podía crear las Huchas canónicas en un usuario nuevo.
2. `restoreWaterOnce()` de v95.41 reconstruía el pago de Agua si no lo encontraba, por lo que un borrado legítimo podía resucitar.

## Corrección
- Perfil nuevo: namespace financiero vacío escrito al crearse.
- Rebase v95.38: sin auto-start; solo manual.
- Pago Agua hard-coded: restaurador retirado.
- Backup pre-import: solo ID exacto del perfil activo; prohibido en perfiles nuevos.
- QA visual: override final sin solapes + fecha en selector.

## Invariantes
- Usuario B nunca ve datos de A.
- Ausencia/borrado de un pago no dispara restauración automática.
- La estable v95.39 no se modifica.

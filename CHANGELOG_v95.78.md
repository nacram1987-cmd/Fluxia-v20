# CHANGELOG · v95.78-LAB

## Corregido
- Saneamiento de Huchas que podía quedar visualmente sin efecto en v95.77.
- El marcador local ya no se considera prueba suficiente de saneamiento.
- Eliminada la rehidratación inmediata con `cargarTodo()` después de confirmar el reemplazo cloud.
- Mensaje de éxito de contraseña cambiado a «La contraseña ha sido cambiada con éxito».

## Integridad
- No se altera el canon financiero validado.
- Se conserva cuarentena previa al saneamiento.
- Se verifica la escritura cloud antes de marcar éxito.
- No se modifican Ingresos, Fijos ni Variables.

# CHANGELOG v95.80-LAB

- Causa corregida: las 7 huchas sí cargaban, pero `v2_usos` podía llegar vacío tras hidratación; por eso la interfaz mostraba el bruto 390,48 € y 134,00 €.
- Reconciliación idempotente de los tres usos históricos conocidos antes de pintar Huchas y durante la ventana de hidratación.
- Tributos: rescate temporal 240,48 €. Agua: pago definitivo 132,90 €. Amortización: ajuste definitivo 0,10 €.
- No se recrean las huchas ni sus aportaciones.
- Se conserva la corrección del mensaje de contraseña.

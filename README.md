# Fluxia v94.7.5-LAB

## Qué arregla
1. **Botón «Sin cuenta»**: no hacía nada porque `fxConfirmar` no devuelve valor (el código la usaba como sí/no). Ahora pide doble confirmación, guarda una copia automática previa (deshacer en Ajustes → Copia cifrada) y empieza a cero. Ya no hay flag que bloquee la carga de lo que apuntes después.
2. **Mismo defecto en 2 botones más**: «Cerrar sesión de la nube» y «Desconectar todos los bancos».
3. **Ingresos con fecha futura (la pensión)**: nunca figuran como cobrados hasta que llegue la fecha o los vea el banco. Se muestra «Pendiente · cobro previsto 24 oct».
4. **Restaurar copia**: todos los botones aceptan el `.fluxia` cifrado (piden contraseña). Antes el importador antiguo lo rechazaba. Al restaurar espera a la sincronización con la nube antes de recargar.
5. **Gastos borrados no vuelven del banco**: ahora sí (filtro por ID de banco en el único punto de entrada). En v94.7.3 no funcionaba.

## Edge Function
SIN CAMBIOS respecto a v94.7.2. Si desplegaste los TS «v94.7.4» de la conversación, vuelve a desplegar el `Fluxia-banco-index.ts` de este ZIP.

## Pendiente
- Unificar visualmente las tarjetas de copia/cuenta de Ajustes en una sola.
- Misma regla de fecha futura para gastos fijos.
- No probado en iPhone real (solo pruebas automáticas).

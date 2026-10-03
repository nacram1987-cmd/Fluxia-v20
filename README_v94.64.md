# Fluxia v94.64 · Clasificar uno a uno + «¿No ves un gasto?» (LAB y ESTABLE: mismo código)

Parte de v94.63 (17 parches exactos en `tests/patch64.py` + módulo `tests/salidas64.js`).

## Nuevo
- **«¿Qué es esto?» uno a uno**: en cada grupo (p. ej. «From Amortización cuenta · 10 entradas») pulsa
  «Ver las 10 una a una». Cada movimiento muestra fecha, banco y concepto completo y un selector:
  - Entradas: 🏺 Rescate de hucha · 🔁 Traspaso · 🌉 Puente · 💶 Ingreso real.
  - Salidas: 🏺 Hucha/ahorro · 🔁 Traspaso · 🌉 Puente · 🧾 Gasto normal · 📌 cada fijo del mes · 🏦 cada cuota del mes.
  Fluxia recuerda la respuesta de ESE movimiento (manda sobre la regla del grupo).
- **«¿No ves un ingreso?»**: además del estado, cada entrada tiene el mismo selector.
- **«🔍 ¿No ves un gasto?» al final de Gastos variables, Gastos fijos y Financiación**:
  buscador (nombre, importe «12,50», fecha «03/10», banco) · 🗑 borrados recuperables (papelera + cargos del banco vetados)
  · 🏦 salidas del banco con su estado y selector · «↩ Recuperar solo este».

## Corregido
- El «recuperar descartados» de v94.49 no funcionaba (filtraba por un campo que no existe). Sustituido.
- Aviso «🔗 Ciclos financieros»: fallaba siempre (clsBox no existía fuera de su módulo).
- Las ENTRADAS de amortización se sacaban en silencio de la cola: ahora las decides tú.
- Grupo de entradas «hucha»: el botón decía «Gasto normal» → «Es un ingreso».

## Pruebas EJECUTADAS (Chromium, sobre el index.html de dentro del ZIP)
- syntax.py: 88 bloques, 0 errores.
- tests/e2e_v9464.js 18/18 · tests/e2e_v9463.js 16/16 · tests/e2e_v9463b.js 12/12.

## NO probado
- iPhone, nube real y banco real (las pruebas usan datos simulados con la forma real de los datos).
- Las salidas del banco anteriores a esta versión solo aparecen si ya eran gastos o estaban en la cola;
  el resto aparecerá tras la próxima sincronización (antes no se guardaba el diagnóstico de salidas).
- Suites antiguas (test_ingresos…): no estaban en el ZIP.

TS sin cambios (hash c4d30337d63fbbc7).

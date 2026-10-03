# Fluxia v94.65 · Inicio más limpio (LAB y ESTABLE: mismo código)

Parte de v94.64. 3 parches exactos (`tests/patch65.py`).

## Cambios
- **Inicio**: fuera la tarjeta «Estás en el plan de Nacho · Cerrar sesión» (el nombre ya está arriba y «Cerrar sesión» sigue en el menú ☰).
- **Inicio**: fuera la tarjeta «Semana bancaria · 30 cargos nuevos ·». Solo aparece una línea fina si hay un importe inusual en el banco.
- **Menú ☰**: «Hola, Nacho», la versión y «Cerrar sesión» quedan juntos y centrados con el avatar y la ✕.
  «Cerrar sesión» sigue pidiendo confirmación y mantiene zona táctil amplia.

## Pruebas EJECUTADAS (Chromium, sobre el index.html de dentro del ZIP)
- syntax.py 88 bloques, 0 errores · e2e_v9465 10/10 (v94.64: 4/10) · e2e_v9464 18/18 · e2e_v9463 16/16 · e2e_v9463b 12/12.

## NO probado
- iPhone real (la alineación se midió en un viewport de 390 px y se revisó en captura).
- Suites antiguas (test_ingresos…): no estaban en el ZIP.

TS sin cambios (hash c4d30337d63fbbc7).

# Fluxia BETA v94.38-LAB

## Estable
- **v94.37-ESTABLE** queda como referencia estable en `fluxia-canal.json`.
- LAB = v94.38 con correcciones.

## Fixes
1. **Papelera / gastos que vuelven**
   - `autoDiff` ya no re-mete en papelera cargos de banco ya vetados.
   - Al borrar definitivo o vaciar: se registra blacklist + se saca de `movimientos` con `_FLUXIA_SIN_PAPELERA`.
   - Al purgar en carga: no se dispara el ciclo papelera.

2. **Heroes unificados**
   - Ingresos, fijos, variables, huchas, compartidos: mismo color, tipografía y padding (claro/oscuro).

## TS
Sin cambios (hash fe78e7d4d04cc8c1).

## Qué probar en iPhone
- Borrar un gasto de banco → papelera → borrar definitivo → recargar 2 veces → no vuelve.
- Vaciar papelera → recargar → no reaparecen.
- Comparar cabeceras de pestañas visualmente.

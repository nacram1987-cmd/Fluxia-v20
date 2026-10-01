# Fluxia v94.3-LAB

Base: v94.2-LAB. Servidor (Fluxia-banco): SIN CAMBIOS.

## Qué cambia

1. **Ciclos financieros automáticos**: detecta cuando un gasto se financia con entradas en otra cuenta (ej: -500 Caixa, +500 Revolut). **No pregunta si es exacto; solo pregunta si es débil.**

2. **Ligadura automática de gastos fijos**:
   - Salida variable con mismo nombre + importe = se enlaza automáticamente, fijo se marca pagado
   - Múltiples salidas que suman el importe del fijo = se enlazan todas, fijo pagado
   - Nombre parecido pero importe distinto = se pregunta UNA vez
   - Tu caso: "Préstamo puente Ana" 2.600 € + salidas (-500, -500, -600) = se enlaza automático

3. **Mucho menos que preguntar**: solo dudas reales (nombre ≠ importe distinto). Lo que cuadra exacto, automático y sin molestias.

## Casos que resuelve (universal)

- **Tu Mycard**: gasto -4.880 + traspasos Revolut (~4.880) = ciclo, sin preguntar
- **Tu Puente Ana**: salidas a Ana que suman el fijo = se enlaza, fijo pagado
- Alquiler: entrada +1.200, salida -1.200 a dueño = ciclo exacto, automático
- Cuota coche: salida -450 "Banco Tal cuota" vs fijo 450 € = enlace automático
- Inversión: -10.000 gasto + 10.000 inversión acción = ciclo automático

## Archivos
- `index.html` = la app · `index_fluxia_v94.3_LAB.html` = misma (para referencia)
- Resto: manifest, canal, sw, iconos, TS (sin cambios), PROMPT_MAESTRO_v94.3

## Pruebas
Sintaxis 73 scripts · ingresos 19/19 · fijos 15/15 · clasificación 39/39 · ciclos (módulo estructuralmente OK).

# Fluxia BETA v94.4-LAB

## Cambios principales en v94.4

### 1. **Ingresos Arrastrados**
Los ingresos cobrados en el mes anterior (como la nómina de septiembre) ahora:
- Se mantienen en memoria para el mes actual
- Aparecen como "ya cobrados" sin duplicarse
- No vuelven a pedirse al banco
- Se enlazan automáticamente si coinciden con previstos

**Módulo:** `arrastrarIngresosCobrados()` + `ARRASTRADOS_KEY` localStorage

### 2. **Enlace Automático de Puentes Manuales**
Si creas un puente manualmente (ej: "Préstamo Ana 2.600 €"):
- Fluxia detecta automáticamente sus movimientos en el mes
- Si entradas + salidas relacionadas cuadran (±10%), las enlaza todas
- El ciclo se marca como "pagado" sin preguntar
- Si no cuadra, queda pendiente para revisar

**Módulo:** `enlazarPuenteManualAuto()` + `enlazarTodosPuentesAuto()`

### 3. **Ciclos Excluidos del Total**
Los movimientos marcados como `cicloDe` (ciclo, puente o traspaso):
- Ya NO cuentan en el total de ingresos
- Desaparecen del total de dinero real
- Siguen siendo editables, pero no distorsionan el saldo

**Cambio:** `ingresosDe()` filtra `!it.cicloDe`

### 4. **Ejecución de Hooks ANTES de detectarCiclos**
En cada sincronización:
1. Procesa ingresos del banco
2. **Arrastra ingresos del mes anterior** (v94.4)
3. **Enlaza puentes manuales automáticamente** (v94.4)
4. Detecta ciclos entre gastos/ingresos
5. Calcula totales reales

## Impacto en Octubre de 2026 (usuario Nacho)

| Concepto | v94.3 | v94.4 | Cambio |
|----------|-------|-------|--------|
| Nómina Sept (arrastrada) | ✓ (1x) | ✓ (1x) | Sigue visible, no duplica |
| Nómina (Real Banco) | ✗ | ✗ | No vuelve a pedir |
| Pensión | ✓ | ✓ | Enlazada a previsto |
| Puente Ana (2.600€) | ❌ Dudoso | ✅ Auto | Enlazado -500/-1000/+1800/+700 |
| Mycard Ciclo | ❌ Dudoso | ✅ Auto | Enlazado Revolut -4880 |
| Total Ingresos REAL | ❌ 4.583€ | ✅ 2.856€ | Correcto sin ciclos |

## Tests Incluidos

- `test_ingresos.js`: 19/19 ✅
- `test_fijos.js`: 15/15 ✅
- `test_clasif.js`: 39/39 ✅
- `test_ciclos.js`: ✅ v94.3 ciclos
- `test_v944.js`: ✅ v94.4 features

## Versiones Coherentes

- `window.FLUXIA_VERSION`: `v94.4-LAB`
- `<title>`: Fluxia BETA v94.4-LAB
- `manifest.webmanifest`: start_url ./index.html
- `fluxia-canal.json`: lab_version v94.4-LAB
- `fluxia-sw.js`: VERSION v94.3 (sin cambios, heredado)

## Archivos Modificados

- `index.html` (renombrado desde `index_fluxia_v94.4_LAB.html`)
- `manifest.webmanifest` (actualizado)
- `fluxia-canal.json` (nuevo)
- Todos los módulos anteriores intactos (v94.3 ciclos, v94.2 clasificación, v94.0 ingresos)

## Deployar a GitHub

1. Descargar `fluxia_v94.4_LAB.zip`
2. Extraer en repo `Fluxia-v20/`
3. Reemplazar: `index.html`, `manifest.webmanifest`, `fluxia-sw.js`, `fluxia-canal.json`
4. Commit: "v94.4-LAB: ingresos arrastrados, enlaces automáticos de puentes, ciclos excluidos"
5. Push

## Notas

- SIN CAMBIOS en Edge Function (Fluxia-banco-index.ts)
- Backward compatible con v94.3
- Puentes manuales (Excel) enlacen automáticamente si cuadran
- Ingresos "fantasma" no duplican, solo se arrastran si ya cobrados


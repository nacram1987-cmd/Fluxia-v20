# Fluxia BETA v94.8-LAB

## Cambios respecto a v94.7.5

### 1. Botón «Sin cuenta» (arreglado de verdad)
- Al confirmar, **resetea todo a cero**, marca el onboarding como completado/omitido y **entra al plan vacío**.
- Ya no se queda en el paso 1 del onboarding.
- Usa permisos de vaciado para que los arrays vacíos se guarden de verdad (sin el bloqueo anti-borrado accidental).

### 2. Ingresos con fecha de cobro futura
- Si pones fecha de cobro **futura** (ej. pensión 24 oct y hoy es 1 oct):
  - Se guarda como `fechaPrevista`, **sin** `pagadoEl`.
  - Aparece en **Por cobrar** con «⏳ Pendiente · cobro previsto».
  - **NO cuenta en el disponible** hasta que se cobre (manual o banco).
- `ingresosTotal` / `disponibleEfectivo` solo suman ingresos **cobrados** (`pagadoEl`).
- Los pendientes se muestran aparte en el total de la pestaña Ingresos.

### 3. Al añadir ingreso
- Campo opcional «Fecha de cobro».
- Si es futura → pendiente y no entra en disponible.

### 4. Persistencia
- «Sin cuenta» y los guardados de ingresos/fijos respetan las rutas de `guardar*` con flags de vaciado cuando corresponde.
- Tus operaciones (alta/edición/cobro) siguen guardándose tras cada cambio.

### 5. CaixaBank / reconexión
- **Sin cambios en la Edge Function** en esta entrega (no hay TS nuevo).
- Si al cambiar de index te pide reconectar: es la sesión PSD2 del banco (caduca). Usa **Reconectar** en Ajustes → Bancos; no borra movimientos ya apuntados.
- Pendiente diagnosticar renovación de sesión en Supabase (regla #8 del prompt).

## Qué NO se ha tocado
- Clasificación banco, puentes, ciclos, papelera, copia cifrada.
- Suites antiguas de lógica de fijos/clasif (mismas funciones base).

## Cómo probar
1. Abre LAB con `?v=v94.8-LAB` (fuerza recarga).
2. **Sin cuenta**: pantalla de cuenta → Sin cuenta → confirmar → debes ver el plan a 0.
3. **Pensión**: añade o edita con fecha 24/10/2026 → debe salir pendiente y el disponible **no** subir.
4. Marca cobrado el día real o cuando el banco lo vea → entonces sí cuenta.

## Archivos
- `index.html` / `index_fluxia_v94.8_LAB.html`
- `fluxia-canal.json` · `fluxia-sw.js` · `PROMPT_MAESTRO_v94.8.txt`

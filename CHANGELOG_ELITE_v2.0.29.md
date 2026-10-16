# Fluxia Élite BETA v2.0.29-LAB · 16/10/2026

## Qué cambia (solo LAB)

1. **`bancoRef` repetido en gastos** (`lab/js/fluxia-elite-reconciliation-v1.js › classifyBankRefGroups`).
   El HTML estable cuenta todas las filas de Variables con el mismo `bancoRef` (solo Ingresos se deduplican al leer y la fusión
   `FluxiaSalud.limpiarDuplicadosBancoRef` es manual: su llamada tras sincronizar está neutralizada). La LAB conserva esa paridad contable
   (cuenta todas las filas, el Disponible no cambia) pero ahora clasifica cada grupo con evidencia:
   `REIMPORTACION` (con `CONFIRMADA_CON_EVIDENCIA_INDEPENDIENTE` o `POR_REGLA_DEL_HTML`), `IDENTIDAD_INSUFICIENTE` (referencia sintética,
   campos distintos o ID de registro repetido) y `DOS_CARGOS_LEGITIMOS` (identificadores bancarios distintos, informativo).
   Muestra el importe en juego en céntimos y **bloquea `VERIFICADO`**. Un mismo identificador bancario ya no puede declararse «transacciones distintas».
2. **Rescates → huchas.** El HTML estable no guarda ID de hucha en los usos (`provisionUsadoTotal`: `u.provision===p.nombre`).
   La LAB distingue nombre **exacto** (misma atribución que el HTML, sin ID) de nombre **solo normalizado** (el HTML no lo atribuiría:
   incidencia `VINCULO_DE_HUCHA_NO_EXACTO_EN_HTML`) y de nombre ambiguo (dos huchas con el mismo nombre exacto). Ninguno se certifica sin ID.
3. **Herramienta local** `lab/tools/elite-reconcile-cli.cjs --history «etiqueta=archivo.json»` (repetible): fecha cuándo apareció cada fila repetida
   usando copias históricas del mismo usuario/perfil. Solo lee archivos locales; los de otro perfil se rechazan.
4. Informe público: solo recuentos y seudónimos (`bankRefGroups`); el privado incluye claves reales y evidencia.

## Qué NO cambia

- HTML estable (`index.html`, blob `d68bd5b94295196595be7d141e8f92ca458a477d`), PWA, service worker y manifiesto.
- Fórmula del Disponible, motor financiero, conector bancario, datos en Supabase (no se lee ni se escribe).

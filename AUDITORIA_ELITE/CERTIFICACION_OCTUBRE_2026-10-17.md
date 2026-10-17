# Conciliación octubre 2026 · HTML ↔ Supabase ↔ Élite (17/10/2026)

> **Veredicto formal: CONCILIACIÓN NO CERTIFICADA.**
> El HTML LAB v97.73/v97.77 y Élite coinciden al céntimo, partida a partida, sobre la misma instantánea. Fallan otros criterios de aprobado (ver § 5).

Este repositorio es **público**, así que aquí solo constan recuentos, deltas, identificadores seudonimizados (`#` + 8 hex de sha256) y métodos. Las cifras absolutas, los conceptos y los nombres viven en una copia privada fuera del repositorio. El usuario los recibió por chat.

## 1. Método

| Paso | Qué se hizo |
|---|---|
| Corte común | Una sola instantánea de solo lectura de `public.fluxia_datos` (760 filas del propietario, corte `2026-10-17T06:24:05Z`). Lleva hash sha256 por fila y global en un manifiesto privado. Las tres fuentes se calculan sobre esos mismos bytes, así que las operaciones posteriores no crean diferencias falsas. |
| Fuente operativa | Claves `profile:<perfil>:v2_*`, las que leen tanto el HTML (modo perfil) como Élite. Las claves `planRescate_v2_*`, `backup:*` y espejos se inventariaron y quedaron como copias, sin usarse para el cálculo. |
| Motor HTML | El **HTML real** se ejecuta en JSDOM con la instantánea sembrada (`lab/tools/conciliacion-tres-vias.cjs`). No hay fórmulas paralelas: se extraen las partidas que usa su propio `FluxiaDisponibleEngine`. |
| Motor Élite | Se ejecuta el `availableCalculationReport` de `lab/fluxia-elite-safari-datos-reales.html` sobre la exportación de la misma instantánea, con los vínculos de rescate de `public.fluxia_rescue_links`. |
| Cruce | Join por id estable de partida y **efecto con signo en Disponible**, en céntimos enteros (BigInt, sin floats). Las líneas `id#exceso` de Élite se agrupan con su provisión. |
| Comparador propio de Élite | Copia generada por el propio `fluxiaExportarPerfil` del HTML contra Élite, por módulo (puerta *b*). |

## 2. Resultado por módulo (octubre 2026, mismo corte)

Las partidas son las que entran en el Disponible. Δ = HTML − Élite, en céntimos.

| Módulo | Partidas HTML v97.73 | Partidas Élite | Δ |
|---|---:|---:|---:|
| Ingresos cobrados | 4 | 4 | 0 |
| Fijos | 14 | 14 | 0 |
| Financiaciones | 6 | 6 | 0 |
| Variables (con devoluciones) | 68 | 68 | 0 |
| Provisiones (prevista + exceso) | 7 | 7 | 0 |
| Compartidos | — | — | 0 |
| **Disponible** | | | **0** |

- 99/99 partidas coinciden por id e importe. La v97.77 da el mismo resultado.
- **Comparador interno de Élite** frente a la copia del HTML: 7 módulos en estado COINCIDE (ingresos, fijos, variables, compartidos, financiaciones, huchas, usos de hucha). Δ = 0 y puerta *b* ✓.
- **Pendientes separados:**
  - Ingreso de pensión aún no cobrado, con fecha futura: excluido en ambos.
  - Ingresos puente/traspaso: excluidos en ambos.
  - Élite expone los rescates temporales pendientes solo como dato informativo: 2 operaciones, que no restan.

## 3. Diferencias por variante del HTML (seudonimizadas)

Se ejecutó el mismo cruce contra cada HTML del repositorio. Las diferencias no son errores de Élite: son reglas distintas entre variantes del HTML.

| HTML | Diferencias | Causa |
|---|---|---|
| `lab/v97.73.html`, `lab/v97.77.html` | ninguna | — |
| `index.html` (v97.66, PWA estable) | 1 variable, `#77299d8f`, «sobra en Élite» | Lista negra `cc:<concepto>|<céntimos>` de FluxiaGVBorrados. Silencia **cualquier** cargo con el mismo concepto e importe, de cualquier fecha. Un cargo real nuevo, idéntico a otro antiguo descartado, desaparece del Disponible. |
| `lab/index.html` (hotfix 15/10) | la misma de arriba, más una regla distinta | El hotfix suma los rescates temporales pendientes al Disponible (2 operaciones). v97.73/v97.77 y Élite no lo hacen. El usuario confirmó como correcto el valor **sin** rescates. |

Ninguna de estas causas se ha «arreglado» tocando el HTML estable, porque está prohibido sin «con labora». Quedan como decisiones del usuario (§ 6).

## 4. Causas raíz corregidas en este cambio (sin tocar el motor ni datos)

1. **El CLI de evidencia no aceptaba vínculos de rescate verificados.** Puerta *c*: «1 rescate vinculado solo por nombre».
   - `lab/tools/elite-reconcile-cli.cjs`: nueva opción `--rescue-links`, que rechaza vínculos de otro perfil.
   - Prueba: `lab/qa/elite-cli-rescue-links-v2060.cjs`.
2. **No existía un cruce reproducible HTML real ↔ Élite.**
   - Nuevo `lab/tools/conciliacion-tres-vias.cjs`, que solo lee la instantánea y escribe un informe privado y otro público seudonimizado.
   - Prueba sintética D1–D4: `lab/qa/conciliacion-tres-vias-v2060.cjs`.
3. **v2.0.55–v2.0.59 nunca se publicaron.** Los 5 despliegues (`push` del 17/10) fallaron en QA y Pages siguió sirviendo el merge #17. Hay dos causas:
   - El historial de cambios de la 2.0.59 reetiquetó las entradas de 2.0.54/2.0.56/2.0.57 como «2.0.59». Se restauran las etiquetas en el HTML y en su snapshot, que no se había publicado. El código ejecutable no cambia.
   - El snapshot inmutable ya usa rutas `../` porque vive en `lab/versions/`. `elite-reconciliation-v2025` compara ahora el snapshot normalizando **solo** esas rutas de recursos.
   - `elite-hucha-variables-interaction-v2054` deja de fijar la versión visible, igual que ya hacía la prueba de la 2.0.52, y conserva su entrada del historial.
4. **El smoke de Pages no verificaba Élite.** `AUDITORIA_ELITE/smoke-pages.py` comprueba ahora, byte a byte:
   - la página Élite, sus 8 scripts, el manifiesto, los iconos y el snapshot v2.0.59;
   - `lab/v97.77.html`;
   - que los iconos del manifiesto Élite resuelven a imágenes reales.
5. **Privacidad en el repositorio público.** Pruebas y entregas anteriores contenían nombres y algún importe real. Se sustituyen por datos de prueba con el mismo comportamiento.

No hay nueva versión de la app Élite, porque no hay cambio funcional medible. Sigue siendo la 2.0.59.

## 5. Puertas de aprobado

| Criterio | Estado |
|---|---|
| Δ = 0 por módulo y en Disponible (HTML LAB v97.73/77 ↔ Élite) | ✓ |
| Pendientes separados (cobrado/pendiente, rescates informativos) | ✓ |
| Rescates vinculados por id (puerta *c*) | ✓ tras añadir un vínculo verificado en `fluxia_rescue_links`, con rollback documentado |
| Cero duplicados (puerta *d*) | ✕ hay ingresos copiados con el mismo `bancoRef`, de meses anteriores. En julio–octubre no se cuentan dos veces, pero existen. Hay un plan de limpieza dry-run preparado y **no ejecutado** porque requiere autorización. |
| Banco sincronizado y al día | ✕ una conexión bancaria registrada no tiene sesión válida. No se prueba que los movimientos estén completos. |
| Paridad con **todas** las variantes del HTML | ✕ hay diferencias de regla con `index.html` y `lab/index.html` (§ 3). |
| D7 (pantalla publicada muestra el número) | parcial: el smoke verifica los bytes servidos, pero no la cifra en pantalla. Ver la cifra exige iniciar sesión con la cuenta real, y github.io no es accesible desde el entorno de esta auditoría. |
| D3 en Safari/PWA real (reinstalación, cambio de dispositivo) | ✕ no medible desde aquí. JSDOM y Chrome no certifican Safari. |
| Aislamiento de usuarios | ✓ RLS activo en las 17 tablas de `public`. Las de datos contables usan `auth.uid() = user_id` para leer y escribir: `fluxia_datos`, `fluxia_rescue_links`, `fluxia_banco_sesiones` y otras. Las tablas sin políticas quedan cerradas al cliente. Perfil vacío = 0 y sin fugas (D4, sintético). Observación no contable: `fluxia_contactos` tiene una política de inserción que acepta `user_id_2 = auth.uid()`, así que permite crear un contacto a nombre de otro usuario. |

## 6. Pendiente (por prioridad)

1. **P0, decisión del usuario:** autorizar o descartar la limpieza de ingresos duplicados. El plan dry-run tiene copias idénticas a archivar mediante tombstone y casos de revisión manual. Rollback: restaurar desde `backup:`.
2. **P0, decisión del usuario:** la regla de rescates temporales en el Disponible. `lab/index.html` los suma; v97.73/77 y Élite no.
3. **P1:** sustituir la lista negra `cc:` del HTML estable por una huella con fecha. Solo en LAB y con «con labora» para promocionar.
4. **P1:** renovar la conexión bancaria caducada y repetir el cruce con un corte nuevo.
5. **P1:** verificación manual en el iPhone: Élite LAB y HTML a la misma hora, con capturas.
6. **P2:** el historial git y la rama pública `lab/auditoria-2026-10-17` aún contienen nombres e importes de informes anteriores. Borrar la rama o reescribir el historial requiere permiso del usuario.

## 7. Reproducir

```bash
node lab/qa/conciliacion-tres-vias-v2060.cjs        # D1–D4 sintético
node lab/qa/elite-cli-rescue-links-v2060.cjs        # vínculos de rescate por id
# con una instantánea privada (no incluida):
node lab/tools/conciliacion-tres-vias.cjs --snapshot <snapshot.json> --html lab/v97.73.html \
     --perfil <perfil> --mes octubre --periodo 2026-10 --rescue-links <links.json> --out <dir-privado>
```

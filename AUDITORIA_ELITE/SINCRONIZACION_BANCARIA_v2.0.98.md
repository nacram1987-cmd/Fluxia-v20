# Élite v2.0.98: conciliación y sincronización bancaria con las reglas del HTML

Solicitud del 17/10/2026: que Élite y el HTML queden conciliados y sincronizados de forma óptima. Un cargo nuevo con tarjeta debe verse en Élite al abrirla, sin duplicados, sin resucitar descartes y sin gastar el cupo del banco.

Alcance: solo la LAB de Élite. `index.html`, la PWA estable, las Edge Functions y los datos de la nube no se modifican. Élite no escribe en el libro ni en la nube.

## Causas encontradas (v2.0.97)
- **Reglas de decisión.** Élite no cargaba ninguna decisión del HTML: ni la lista negra, ni los borrados archivados (`fluxia_gv_borrados_v1`), ni los alias de identidad. Solo comparaba con Variables, sin Ingresos, e ignoraba los cortes de cada banco. Las reglas de traspaso las leía de la copia antigua del perfil y solo por concepto.
- **Identidad y lectura.**
  - Leía los movimientos con `Fluxia-banco`, que no devuelve cuenta ni referencia estable. Por eso sus identificadores no coincidían con la identidad `fxbank9770` que usa el libro.
  - Nunca enviaba `presente`.
  - No leía al abrir.
  - La bandeja vivía solo en el dispositivo.
- **Fechas y horas.** Las horas se mostraban en la zona de Madrid. La línea de frescura usaba una copia espejo que el HTML moderno ya no actualiza.
- **Síntomas visibles:** «nuevas 140» falsas y «hace 290 h».

## Qué se ha añadido o corregido
| Qué | Dónde está | Dónde probarlo |
|---|---|---|
| Núcleo de decisión copiado literalmente del HTML v97.77 (36 funciones): identidad, vetos, borrados, cortes, traspasos, reglas, apuntes manuales y pendientes. Sin funciones que escriban o pinten. | `lab/js/fluxia-elite-bank-html-core-v1.js`, generado por `lab/tools/build-bank-html-core.cjs` (`--check` en CI) | — |
| Clasificación de cada cargo en el mismo orden que `call()` + `aplicarMovs()`, sobre una copia del libro. Estados: nuevo, ya en el libro, descartado, procesado antes, anterior al corte, traspaso, para revisar, pendiente del banco, no válido. | `lab/js/fluxia-elite-bank-sync-v1.js` | Bancos → «Movimientos sincronizados» |
| Lectura al abrir Élite y al volver a ella (4 s después de pintar), dentro de las condiciones de abajo. | `runBankAutoSync` en el HTML de Élite | Abrir Élite tras un cargo con tarjeta |
| Movimientos leídos con `Fluxia-banco-lab9770` (identidad completa, la misma sesión bancaria). El estado y los saldos siguen en `Fluxia-banco`. Tiempo máximo de 45 s. | `lab/js/fluxia-elite-bank-connector-v1.js` 1.5.0 | — |
| Bandeja v3 por usuario y perfil, con la fecha de lectura y los cortes del servidor por banco. Un banco con error conserva sus filas sin repetirlas. La v2 queda intacta. | conector + `mergeRead` | Recargar Élite |
| Aviso «N cargos nuevos del banco · X €» en Inicio y en Variables. No suma a ningún total. En Variables se despliega la lista (⏳ si el banco aún no lo ha asentado). | `bankBannerContent` | Inicio → tocar el aviso |
| Bancos muestra cifras, como en v2.0.65: una línea por banco con la hora que guarda el servidor (vale para el HTML y para Élite) en la zona del dispositivo, el resumen de pendientes y el resto por estado. El límite diario, el permiso caducado y los errores se muestran como alerta visible. | `showBanksAudit`, `renderBankInboxRows` | Más → Bancos |
| La línea de frescura de la copia espejo se retira. | — | — |

### Condiciones de la lectura automática
- Hay algún banco conectado, con permiso vigente y sin límite diario.
- La última lectura de cualquier app (`ultima_sync_fondo` del servidor) tiene 12 minutos o más.
- Élite no ha leído en los últimos 12 minutos (aunque un banco fallara), no lo intentó hace menos de 90 segundos y no consultó el estado hace menos de 1 minuto.
- Hay una sola lectura a la vez, compartida con el botón «Sincronizar bancos».
- La app está en primer plano y con red. No hay temporizadores en segundo plano.

Cada lectura va con `presente:true`, porque el usuario acaba de abrir la app, y lleva la misma lista negra unida que envía el HTML.

## Fuentes de datos
Solo lectura de la nube moderna del perfil:
- `v2_borrados_blacklist`, `fluxia_gv_borrados_v1`, `v2_fluxia_gv_borrados_v1` y `v2_bank_identity_aliases9770_<perfil>`.
- Las copias espejo `clasif_v94`, `clasif_item_v9464`, `corte_v55`, `conexiones_v1_<perfil>`, `ing_vistos_v94` y `fluxia_banco_ids`.
- `v2_sync_tombstones`, `v2_sync_restores` y `v2_explicit_deletions`.

La copia moderna gana a la antigua. La consulta de la nube sube de 40 a 80 filas.

## Pruebas automáticas (CI)
- **`lab/qa/elite-bank-sync-v2098.cjs`**
  - **Núcleo.** Es idéntico a lo que genera `lab/v97.77.html` y no contiene escritores.
  - **Paridad.** Se compara con el `aplicarMovs` real extraído del HTML: 300 lotes y 12 000 cargos con colisiones deliberadas, con los mismos nuevos, enlaces y conflictos.
  - **Escenarios de la norma:**
    - mismo importe y día;
    - mismo id en otro banco;
    - referencia antigua o identidad;
    - vetos en todos los formatos;
    - cortes;
    - reglas por contraparte;
    - Bizum saliente;
    - recarga;
    - hucha;
    - apunte manual;
    - pendiente y asentado en el mismo lote;
    - ingresos.
  - **Volumen.** 400 ids × 10 lecturas, sin tocar el libro.
  - **Política de lectura, bandeja y lista negra:** lectura parcial, banco que falla siempre y comprobación previa sin red.
- **`lab/qa/elite-bank-freshness-v2096.cjs`**, adaptado al cambio explícito. Mantiene los invariantes:
  - sin dato no hay cifras;
  - la antigüedad sola no es alarma;
  - el límite y los errores se destacan;
  - el texto dice qué mide.

  Además comprueba:
  - una sola lectura al abrir, con `presente` y la lista negra;
  - que no se repite al volver;
  - que un banco limitado no gasta consultas;
  - que no se lee fuera de primer plano o sin red;
  - el cambio de perfil a mitad de lectura;
  - la hora de Canarias;
  - el aviso que lleva a Variables;
  - que una lectura interrumpida no se queda en «Leyendo…».
- **Lista de Pages.** `AUDITORIA_ELITE/smoke-pages.py` comprueba ahora los 13 scripts de Élite.
- **Pruebas anteriores:** pasan sin retirar ninguna assertion. Esto incluye la regla v2.0.65 de no repetir la lista de gastos en Bancos. La carga del perfil no depende de la parte bancaria: un fallo en ella nunca impide cargar.

## Pruebas manuales y de navegador
- **Chromium, Élite servida en local** con Supabase y las funciones simuladas (datos ficticios):
  - primer pintado en unos 0,4 s y aviso a unos 4,5 s;
  - al abrir, exactamente estado + bandeja;
  - el Disponible y el total de Variables no cambian;
  - Bancos sin lista;
  - al volver o recargar dentro de 12 minutos, ninguna llamada;
  - pasados 13 minutos, una relectura sin duplicar el pendiente ya asentado;
  - 400 cargos clasificados en unos 20 ms;
  - sin errores de consola.
- **Ensayo privado con datos reales** (solo lectura, fuera del repositorio):
  - de 121 cargos del libro reenviados como bandeja, 120 salen «ya en el libro» y 1 «descartado», que también está vetado en el HTML;
  - 1 veto por identidad y 43 borrados archivados salen descartados;
  - unos 41 ms en escritorio;
  - 51 referencias antiguas sin banco no pueden reenviarse: el HTML las trataría como conflicto `legacy-bank-unknown`.

## Diferencias abiertas y límites
- No se ha probado una lectura bancaria real en vivo: no hay sesión del usuario en el entorno de pruebas. La prueba pendiente es un cargo pequeño con Revolut y abrir Élite.
- No hay medición en iPhone ni en Safari. Chrome y JSDOM no certifican Safari ni la PWA. La clasificación va fuera de la ruta crítica, pero su coste en iPhone no está medido.
- Élite no añade el cargo al libro: lo sigue haciendo el HTML al abrirse. Que Élite escriba requiere autorización expresa y prueba en seco.
- **HTML raíz v97.66.** Su planificador lee cada 12 minutos sin `presente` (gasta el cupo desatendido) y tiene el fallo de `fijarCorte`. Corregirlo requiere «con labora».
- **Ingresos.** Élite distingue registrado, visto o pendiente. La decisión fina (nómina, cobro, traspaso de entrada) sigue en `procesarIngreso` del HTML.
- **Banco con límite diario.** Con `presente:true` el servidor intenta también el banco limitado si otro banco motiva la lectura. Es una sola consulta atendida, como el botón manual del HTML.

## Valoración sincera
78/100 para esta etapa LAB. La paridad de decisión con el HTML está demostrada y la política de lecturas está acotada y probada. Faltan la prueba real con banco, la medición en iPhone y la escritura en el libro.

## Rollback
- Copia anterior: `lab/versions/fluxia-elite-safari-v2.0.97.html`.
- Para revertir la LAB, restaurar desde el commit `51f539406749216f152f6103ce2206a5749dd4e3` los archivos `lab/fluxia-elite-safari-datos-reales.html` y `lab/js/fluxia-elite-bank-connector-v1.js`. Los módulos nuevos dejan de cargarse solos.
- No hay que revertir datos: Élite no escribió en la nube. Las claves locales nuevas (`fluxia_elite_bank_inbox_v3:…` y `fluxia_elite_bank_autosync_v1:…`) son prescindibles.

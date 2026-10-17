# Auditoría general Élite ↔ HTML · 17/10/2026

Solo lectura. No se ha escrito nada en la nube ni en el repositorio de producción. No se ha llamado a la API de Enable Banking (no se gasta cuota ni se usan credenciales).

## 1. Por qué un pago de Revolut no se contabiliza (causa verificada)

**Caso:** 16/10 21:49, −19,40 €, contraparte «Ana María❤️», nota «Anduriña».

1. El HTML guarda *reglas de clasificación* aprendidas (`fluxia_banco_clasif_v94`, espejo en la nube del 15/10 20:22). Entre ellas:
   `{t:[ana, maria, sanchez], tipo:"puente", dir:"*"}` y `{t:[enrique, javier, sanchez, can], tipo:"puente", dir:"*"}`.
2. `clsMatch` compara por contenido: «ana maría» (2 palabras) está contenida en «ana maría sánchez» (3), así que **coincide**. Comprobado ejecutando las funciones reales `clsTokens/clsMatch/clsRegla` del HTML con las reglas reales (`scratchpad/cls-sim.cjs`).
3. `aplicarMovs` trata un «puente» como dinero que pasa por ti: lo anota en `puentes_log`, marca el id como procesado y **no crea el gasto**.
4. Causa de fondo (código del HTML): al elegir «Puente» o «Traspaso» la regla se guarda con `dir: tipo==="real" ? g.dir : "*"`, es decir **en las dos direcciones**. Marcar como puente una *entrada* de Ana María (p. ej. los 600 € del 01/10) silencia también cualquier *pago* a ella.
5. No existe pantalla para ver ni quitar estas reglas. Las pantallas «Reglas de fijos» y «Decisiones bancarias» gestionan otros almacenes.

Descartado como causa: filtro del servidor (las dos funciones traen todas las transacciones sin filtrar por tipo), lista de bloqueo en la nube (ningún token con 19,40), sesión bancaria (Revolut válida hasta 27/12, última consulta 16/10 20:25 UTC sin error, posterior al pago).
No verificable desde aquí: qué devolvió Enable Banking exactamente, ni la bandeja local del móvil.

## 2. Hallazgos

| # | Gravedad | Hallazgo |
|---|---|---|
| 1 | Alta | Reglas puente/propio bidireccionales y sin pantalla de gestión (ver §1). Afecta a Ana María y a Enrique Javier Sánchez Can (los Bizum a Enrique tampoco se contarán por el banco). |
| 2 | Alta | Cupo bancario: 44 llamadas ayer a las funciones del banco sobre las mismas sesiones: 16 a `Fluxia-banco` (la usa **Élite**) y 28 a `Fluxia-banco-lab9770` (la usan las páginas **LAB del HTML v97.70+**); 0 a `Fluxia-banco-lab9755` (HTML estable y LAB ≤v97.69). CaixaBank devolvió HUB046 (límite diario) a las 22:25 locales. Probar a la vez Élite y una LAB consume el cupo dos veces. |
| 3 | Media | Élite no lee las reglas de clasificación del HTML: puede mostrar como «pendiente» lo que el HTML descarta como puente. |
| 4 | Media | Mes contable: 1 movimiento fechado 02/10 con `mes=septiembre` (E s vistagiralda, 7,50 €, Revolut, categoría Otros; probablemente el «7,50 € de Tabaco» de la discrepancia 51/52) y 10 filas Excel del 09–11/09 con `mes=agosto`. HTML y Élite cuentan por la etiqueta de mes, por eso cuadran, pero la fecha indica otro mes. Decisión del usuario; cambiarlo modifica el Disponible. |
| 5 | Media | Posible duplicado de Excel: «Recarga máquina de café», 4 €, 09/09, en agosto (…_301) y septiembre (…_403). |
| 6 | Media | `date_to` se calcula en UTC: entre 00:00 y 02:00 (Madrid) los movimientos del día no se piden hasta la consulta siguiente (retraso, no pérdida). |
| 7 | Media | Tres funciones de banco desplegadas y las tres en uso por apps distintas: `Fluxia-banco` v65 (Élite), `-lab9755` (HTML estable `index.html` y LAB ≤v97.69) y `-lab9770` (LAB v97.70+, la que genera la identidad `fxbank9770` que ya tienen tus datos). Las tres con `verify_jwt=false` (validan el token dentro) y con código casi idéntico: tres sitios que mantener y que corregir a la vez. *(Corregido: una versión anterior de este informe daba `-lab9755` por abandonada; es la del HTML estable.)* |
| 8 | Media | 44 de 89 scripts `lab/qa/elite-*.cjs` no se ejecutan (6 con versión fijada, ~11 por ayudantes movidos, ~19 aserciones obsoletas) y **ninguno está en CI**. Cobertura efectiva menor de la aparente. |
| 9 | Baja | Nube con 798 filas (~7,5 MB): espejo antiguo `p_usr-…` 288, perfiles antiguos 84, legado `v2_*` 110, backups 38. Sin impacto funcional; ruido y riesgo de confusión. |
| 10 | Baja | Listas de bloqueo con 12 tokens `fd:` (fecha + importe de *cualquier* comercio). Hoy sin impacto; mecanismo con riesgo teórico de ocultar un cargo legítimo idéntico. |
| 11 | Baja | Avisos Supabase: protección de contraseñas filtradas desactivada; `accept_invitation` (SECURITY DEFINER) ejecutable por usuarios autenticados; `pg_net` en `public`; 7 tablas obsoletas con RLS sin políticas. `fluxia_datos` tiene RLS correcta (solo el dueño). |

## 3. Lo que está bien

- Las 6 colecciones (ingresos, fijos, movimientos, provisiones, financiaciones, compartidos) son **idénticas** entre la copia del HTML y la de Élite: 0 filas distintas, 387 movimientos.
- Variables: 0 ids duplicados, 0 importes cero o nulos, 0 fechas futuras, 0 `bancoRef` repetidos, 0 sin categoría. Los tres «Valkiria 7,50 €» del 06/10 son compras distintas (referencias bancarias distintas).
- HTML estable y Élite arrancan sin errores de JavaScript.
- Disponible de octubre: −254,69 € en ambas.
- Sesiones bancarias válidas hasta 27–30/12; habrá que renovarlas (90 días).

## 4. Opciones

**Pago de Revolut**
1. *Sin tocar código:* en el HTML, Gastos variables → «¿No ves un gasto variable?» → recuperar el cargo (no verificado que aparezca; depende de la bandeja local).
2. *Datos:* cambiar la regla de Ana María a «solo entradas». Los pagos a ella <20 € contarían solos; ≥20 € preguntarían. Requiere escribir la regla y comprobar que el HTML la recoge del espejo. Con copia previa.
3. *Código (LAB primero):* guardar puente/propio con la dirección del movimiento y añadir pantalla «Reglas de clasificación» para ver/quitar. Producción solo con «con labora».
4. *Manual:* registrar cada pago a mano (como el de 19,40 €). No duplica cuando el banco lo trae, pero la regla seguirá descartándolo.
5. *Élite (solo lectura):* mostrar por qué cada cargo bancario no cuenta («descartado por regla puente: ana maría sánchez»).

**Resto**
A. Decidir el mes de los 11 movimientos de §2.4. B. Revisar el posible duplicado de §2.5. C. Reducir consultas: una sola función, un solo punto de sincronización, no sincronizar al abrir. D. Unificar las tres funciones en una (hoy cada app usa una distinta). E. Reparar o retirar los 44 scripts y meter en CI los útiles. F. Limpieza de nube con copia previa. G. Avisos de Supabase (§2.11).

## 5. Estado de las opciones 2 y 3 (aplicadas el 17/10)

- **Opción 3 (código):** `lab/v97.77.html` (LAB, base v97.73) con reglas por dirección, sustitución por la más nueva y pantalla Ajustes → Bancos → Reglas de clasificación. PR #17. Ver `ENTREGA_v97.77.md`. Producción (`index.html`) intacta.
- **Opción 2 (datos):** añadida a la nube la regla «ana maría sánchez · puente · solo entradas» (copia: `backup:pre-regla-ana-20261017:…`). Inerte en el HTML actual; efectiva en la v97.77.
- **Nota de base:** el arreglo parte de v97.73 y no del `index.html`, porque tus datos ya usan la identidad bancaria `fxbank9770` (solo existe en LAB ≥v97.70) y abrir una base con identidad antigua podría duplicar movimientos.

# Fluxia Élite BETA v2.0.04 · rescates de huchas

15/10/2026. Rama `pages-v9731-real-final`. Archivo ejecutable `lab/fluxia-elite-safari-datos-reales.html`. Punto de retorno v2.0.03: commit `2604e65566bb638174c3e12cbb6ac0e6d1059f7f`; copia `lab/versions/fluxia-elite-safari-v2.0.03.html`. La raíz estable y su PWA no se han tocado.

## Hallazgo y cambio

El HTML operativo relaciona `v2_usos` con provisiones por `provision === p.nombre`, y resta `importe − repuesto` al histórico. Élite solo incorporaba al balance global usos con ID de hucha explícito, aunque su vista individual ya mostraba provisionalmente los usos con nombre único. Se aceptan ahora en el **balance reconstruido provisional** los usos con nombre normalizado exacto y único, fecha, importe en céntimos, tipo e ID válidos. Se mantiene bloqueado el total ante nombres ambiguos, IDs duplicados, historiales o reposiciones incompletos, estados anulados/archivados o fuente ausente. No se cambia ningún dato financiero.

En Huchas aparece un cotejo de `v2_usos` entre la copia privada actual del HTML y Supabase. Muestra registros solo HTML, solo nube y mismo ID con discrepancias de hucha, fecha, mes, tipo, importe, reposición o estado. El resultado es solo lectura. Los datos de una copia HTML importada se mantienen en memoria del perfil durante la sesión y no se suben a un servidor desde este cotejo.

## Pruebas

- 16 regresiones Élite actuales ejecutadas, incluidos nombres únicos/ambiguos, retiradas, reposiciones, aislamiento entre huchas, cabecera, sesión y conector bancario: superadas.
- `node auditorias/qa-v97.66/verify-baseline.cjs`: 6 artefactos congelados intactos.
- `npm --prefix auditorias/qa-v97.66 test`: superado en entorno Node de escritorio; no certifica Safari físico.
- Fixture de 70 € en Césped y rescate de 7,50 € **sintético**: 62,50 € en esa hucha y 162,50 € agregado de dos huchas, marcado provisional. El fixture no representa movimientos del usuario.

## Qué verificar en casa

Abrir Élite v2.0.04 y, con el mismo perfil, exportar desde Ajustes del HTML original «Copia solo este perfil» y cargar ese JSON en Élite. En Huchas revisar «Rescates · HTML frente a nube», buscar Mantenimiento césped y los rescates de más de 200 € por **fecha e ID**; comparar el desglose con el HTML. Si salen solo HTML, faltan en la nube y no se deben inventar ni duplicar. Revisar septiembre y octubre, y que el total continúe marcado provisional. No hacer un rescate nuevo desde Élite todavía: la escritura y su persistencia requieren paridad y controles de concurrencia verificados. Para una operación real, utilizar el HTML operativo y comprobar después que aparece una sola vez.

## Riesgo abierto

No hay una copia actual autenticada del perfil del usuario en este entorno. Por ello no se conoce ni se certifica aquí el importe concreto retirado de Césped, el rescate aproximado de doscientos y pico euros, el total de huchas ni el Disponible. El cotejo por ID de `v2_usos` no sustituye la conciliación contable de pagos, efectivo, bancos y bajas lógicas. La implementación no activa escrituras en Élite ni modifica Supabase.

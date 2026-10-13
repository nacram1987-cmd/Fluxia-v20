# Evaluación crítica y sin atribuir mediciones inexistentes — Fluxia v97.69-LAB

## Fortalezas confirmadas por código o por usuario
- El usuario percibe buena fluidez en v97.68, la referencia anterior preservada.
- Arquitectura funcional rica: Ingresos, Fijos, Variables, Huchas, Compartidos, Financiaciones, bancos, PWA y cuentas separadas.
- Los movimientos bancarios vinculados a Fijos ya contienen `cuentaComoFijo` y `vinculoFijoId`; la función de Disponible contabiliza por un solo camino y los excluye de Variables.
- QA automatizada previa con 400 movimientos sintéticos, 12 ciclos de menú y comparación estricta del módulo bancario; cobertura ampliada en esta versión.

## Riesgos y deuda técnica
1. **Muy alto — complejidad del frontend:** HTML ~1,9 MB, ~168 scripts inline en la base v97.68; mucho JS en ruta de arranque, firma global JSON de objetos, estados/handlers heredados y módulos de bancos interdependientes. Velocidad percibida no acredita optimización máxima.
2. **Muy alto — integridad en entorno real:** JSDOM no demuestra ausencia de resurrecciones, duplicados bancarios, reconciliaciones asíncronas o mezcla entre perfiles bajo concurrencia real. Requiere ensayos en nube/dispositivos, copias y registros trazables.
3. **Alto — visualización del gasto ejecutado:** la nueva función distingue pagos realizados de compromisos previstos, pero hereda las convenciones de `pagadoEl` y estados de financiaciones del modelo original; conviene consolidar a futuro un libro mayor canónico con IDs estables y eventos auditables sin reescribir saldos.
4. **Alto — medición real de rendimiento:** no hay benchmark repetido en Safari iPhone frío/caliente, INP, LCP, CLS, p95 navegación ni red bancaria. Prohibido declarar mejora temporal de v97.69 o ausencia absoluta de regresión sin esta comparación.
5. **Medio — experiencia informativa:** Dashboard acumula módulos heredados; la franja nueva es compacta pero la densidad debe probarse en iPhone. A futuro, evitar ampliar UI sin métricas de uso y limpieza de módulos redundantes.
6. **Medio — accesibilidad y batería:** comprobar VoiceOver, contraste, foco, tamaños táctiles, reducción de movimiento, uso de CPU/batería en sesiones prolongadas.

## Dictamen
Apta para **candidato LAB**, no para promoción ESTABLE automática. La publicación se decide solo tras QA verde y validación manual del usuario en iPhone. Conservar v97.68 intacta como respaldo de rendimiento y v97.66 congelada como baseline técnica. La franja de total es solo lectura y carga el historial al abrirlo. No confundir total realizado con gasto financiero global incluyendo Huchas y Compartidos.

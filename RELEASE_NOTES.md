# Fluxia v97.57 LAB
Base v97.56. Incluye sus mejoras de render/arranque y la sincronización única de v97.55. ESTABLE v97.46 intacta.

- Elimina cascada de render de resúmenes legacy ocultos.
- Quita espera fija de 1,1 segundos a nube, conservando carga obligatoria del outbox durable y reconciliación remota.
- Tareas secundarias repartidas en turnos libres, pausadas durante gestos, inputs, menú y modal; generaciones obsoletas canceladas.
- Selector mensual conserva DOM si su estado visual no cambia; cambios de mes/plan reconstruyen.
- content-visibility cubre la clase real mov-item de Variables en dispositivos táctiles, respetando foco.
- HTML: de 2.322.295 a 1.914.168 bytes (17,6 % menos). JS sin compresión semántica ni mangle.
- Sin cambios a paleta, logo, cabecera, fórmulas ni badges flotantes.

Documentos v97.55/v97.56 son historial. Versión actual v97.57. Servidor Fluxia-banco-lab9755.ts intacto en v97.56/v97.57.

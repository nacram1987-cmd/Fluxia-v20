# Base permanente de Fluxia: v97.66

Aceptada por el usuario el 11/10/2026, hora de Canarias, como punto de partida para todo desarrollo posterior. Esta decisión sustituye v97.46 como base de trabajo; v97.46 permanece solo como referencia histórica.

Snapshot de código: commit `b1d53c08fa0cc99356ab5f3f54e5e45b694f1a4c`, rama de respaldo `baseline-v97.66-performance`. No mover, reescribir ni borrar ese respaldo. Los archivos `v97.66.html` y `lab/v97.66.html`, junto con los workers/manifiestos copiados en `auditorias/base-v97.66/`, permiten comprobar sus bytes contra `auditorias/base-v97.66.json`.

La base conserva: navegación por firma completa y perfil; DOM reutilizado sin omitir ediciones; trabajo visual solo en panel activo; clasificación bancaria sin diagnóstico oculto; arranque sin cola decorativa global; menú/logo de activación única; scroll restaurado; Variables sin Disponible; actualización PWA sin borrar almacenamiento.

Antes de promover cualquier candidato, ejecutar la regresión permanente y comparar medidas antes/después bajo iguales condiciones (varias repeticiones, mediana, arranque frío/caliente, primer gesto, menú, Variables y Bancos). Una regresión reproducible impide la promoción hasta corregirla. No sustituir estas pruebas por una afirmación de velocidad, un splash ni una versión antigua.

Evidencia disponible: pruebas sintéticas con 400 movimientos, 20 ciclos de menú, cambios de mes y perfil, reutilización/invalidez de caché, invariantes contables, módulo bancario idéntico y verificación visual Chrome. No existe todavía benchmark certificado de Safari/iPhone físico; no se inventa un presupuesto temporal a partir de una medición JSDOM aislada.

El archivo AGENTS.md aplica estas condiciones a futuros agentes y el PROMPT MAESTRO las mantiene como regla de producto. La rama de respaldo se conserva por contrato; no se ha configurado una protección administrativa del repositorio.

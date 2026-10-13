# Rendimiento v97.70 frente a v97.68

Ensayo JSDOM/Node 24.19, red offline, mismo perfil/datos (400 movimientos), orden alternado. 10 arranques por versión y 200 operaciones por escenario. GC explícito entre documentos para comparar un estado de memoria homogéneo. No son tiempos Safari/PWA ni pintura de navegador.

| Escenario, mediana / p95 ms | v97.68 | v97.69 | v97.70 |
|---|---:|---:|---:|
| Construcción JS/DOM | 697.785 / 1191.330 | 648.594 / 705.907 | 637.291 / 681.908 |
| DOMContentLoaded | 861.764 / 1358.917 | 785.638 / 1009.748 | 795.733 / 817.878 |
| Menú | 0.106 / 0.518 | 0.103 / 0.332 | 0.118 / 0.481 |
| Variables primera entrada | 13.700 / 18.373 | 14.065 / 17.577 | 15.024 / 23.876 |
| Variables caliente | 0.200 / 0.357 | 0.198 / 0.332 | 0.206 / 0.463 |
| Modal Bancos, pintura síncrona | 1.312 / 1.809 | 1.065 / 1.433 | 1.146 / 2.088 |

Los primeros ensayos sin control de memoria mostraron sobrecoste de construcción. Se retuvo el candidato, se perfiló el host (parser CSS/JSDOM, interfaces y GC) y se convirtió el módulo de identidad en un getter bajo demanda, instalado antes de cargar el libro. La ejecución controlada no confirma degradación de arranque; las diferencias de interacción son submilisegundo y varían entre rondas. No hay más consultas, timers o renders de navegación. Los logs de las rondas se conservan, sin sustituirlos por cifras más favorables.

Apertura de Variables conserva exactamente la navegación por firma íntegra, selector mensual y render. La contabilidad y estilos aprobados se comparan por código. No se certifica mejora ni ausencia de regresión física en iOS: Safari/PWA, INP/LCP/CLS/FPS y latencia del proveedor permanecen NO VERIFICADOS. Promoción estable bloqueada hasta prueba física/orden «con labora».

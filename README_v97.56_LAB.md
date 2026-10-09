# Fluxia v97.56 LAB — rendimiento de arranque y render

LAB: https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.56.html
PWA LAB: https://nacram1987-cmd.github.io/Fluxia-v20/lab/index.html
ESTABLE v97.46, intacta: https://nacram1987-cmd.github.io/Fluxia-v20/

Se elimina la cascada de render de resúmenes antiguos ocultos. El dashboard principal se pinta primero y los gráficos y módulos secundarios se distribuyen durante periodos libres, sin bloquear un diálogo abierto. El arranque deja de esperar un plazo fijo de 1,1 segundos a la nube, pero sigue esperando la carga del outbox durable; la reconciliación remota permanece activa.

Se conserva la sincronización única del banco de v97.55 y su servidor LAB separado. La actualización automática respeta periodos de interacción reciente. La latencia de nuevos cargos sigue dependiendo del banco; no se promete recepción instantánea ni con la app cerrada.

167 scripts comprobados sintácticamente. Comparación AST: 13 funciones financieras/almacenamiento y cuatro funciones bancarias originales sin cambios. Minificación de comentarios y espacios, sin compresión ni renombrado de variables. HTML reducido de 2.322.295 a 1.913.226 bytes (17,6 %).

Ensayo sintético JSDOM con 1.500 gastos ficticios y red bloqueada: renderAll de aproximadamente 50–52 ms a 17–22 ms en una ejecución comparable. Estos tiempos NO son mediciones de Safari/iPhone ni incluyen coste de pintura del navegador; varían entre ejecuciones.

Pendiente: arranque frío/caliente de Safari y PWA, cambio de perfil, reconciliación con nube y recepción de cargos reales. No promover a ESTABLE sin esas pruebas.

El paquete incluye LAB, fuente legible source-v97.56.html, servidor LAB de v97.55 sin modificaciones, documentación y copia ESTABLE v97.46.

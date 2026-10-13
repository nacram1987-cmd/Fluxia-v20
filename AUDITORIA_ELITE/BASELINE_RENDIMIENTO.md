# Rendimiento comparativo disponible

Node v24.19.0 / JSDOM 30.1.2 / Linux; offline; 400 movements; interleaved order

Diez construcciones/documentos por versión; 200 operaciones de menú y navegación caliente. Orden alternado, red offline simulada, 400 filas. Construcción DOM/JS de JSDOM NO mide pintura ni arranque autenticado de iPhone.

| Escenario (mediana / p95 ms) | v97.68 | v97.69 | Candidato no publicado |
|---|---:|---:|---:|
| Construcción JS/DOM | 548.038 / 1118.130 | 539.252 / 630.631 | 513.208 / 637.558 |
| DOMContentLoaded | 667.024 / 1291.518 | 651.346 / 781.586 | 631.573 / 775.491 |
| Menú | 0.089 / 0.454 | 0.089 / 0.298 | 0.089 / 0.363 |
| Variables primera apertura | 13.618 / 19.525 | 12.223 / 15.140 | 12.628 / 17.621 |
| Variables caliente | 0.192 / 0.329 | 0.177 / 0.348 | 0.179 / 0.403 |
| Bancos modal: pintura síncrona | 1.003 / 1.460 | 0.791 / 1.305 | 0.984 / 1.215 |

No se detecta empeoramiento consistente de medianas contra v97.68; dispersión y p95 no autorizan garantías. No hay optimización de render adicional: el cambio responde a integridad bancaria. La primera ejecución de benchmark usó erróneamente una pestaña bancaria inexistente; se conserva log preliminar con etiqueta inválida y se repitió con abrirConexionBancaria real.

Safari/PWA física, LCP, INP, CLS, FPS, long tasks de navegador, memoria navegador y red del proveedor: NO VERIFICADOS. Chromium no se pudo instalar. El candidato sigue bloqueado por una prueba bancaria crítica, independientemente de estos tiempos.

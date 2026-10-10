# Evaluación real v97.61

Se corrigió un error reproducible de renderizado y se redujo trabajo repetido. El HTML sigue cerca de 1,9 MB; la reducción de descarga es pequeña. La mejora principal es evitar reconstrucciones durante navegación y arranque.

La reutilización tarda aproximadamente 0,34 ms en una ejecución sintética con 400 movimientos; no representa INP ni tiempo total de cambio de pestaña en iPhone. No afirmar que la app completa vaya instantánea. La red, el dispositivo, la carga autoritativa y otros módulos pueden seguir influyendo.

14 funciones comparadas por AST permanecen idénticas, incluidas Disponible, guardado, carga, menú y navegación. Esto reduce riesgos, pero no certifica cuentas reales, multiusuario real ni banca. Sin cambios de lógica bancaria, RLS o credenciales.

Recorrido Chrome remoto completado en la página de pruebas aislada. No sustituye las pruebas Safari/PWA del usuario.

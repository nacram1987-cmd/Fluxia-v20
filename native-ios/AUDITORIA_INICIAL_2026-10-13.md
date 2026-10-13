# Auditoría inicial Fluxia Élite nativa

Fecha: 13/10/2026 (Europe/Madrid)  
Rama examinada: `feature/fluxia-elite-ios-capacitor`  
Punto de partida del código: `96750a275b957ded93d08fa44b5be1f9fa6fc608`  
Punta examinada antes de cambios: `eb7a7bba0fd1a4d1a9aac7b2783212ad0eb4bf3e` (solo añade una captura del simulador a la rama).

## Estado comprobado

La aplicación de `native-ios/` es una aplicación SwiftUI independiente. La interfaz muestra importes sintéticos y es de solo lectura. La compilación, la suite Swift de 27 aserciones y la captura de simulador habían pasado en el workflow `Fluxia Elite - Native SwiftUI iOS` del commit `96750a2` (run 38468574127, success).

Los módulos existentes son pequeños y puros: cálculo del Disponible en céntimos, sugerencia conservadora de conciliación, clasificación de duplicados bancarios y filtro defensivo por propietario. La interfaz y los módulos explicativos siguen concentrados en `ContentView.swift`.

## Límites que impiden llamar RC2 funcional o distribuible

- No hay altas/ediciones/pagos reales, persistencia local o en nube, autenticación ni gestión de sesiones.
- `AccountIsolation` es una defensa de cliente de demostración; no hay backend ni controles RLS/ACL conectados.
- La política bancaria es una función pura de clasificación; no hay proveedor, importación, sincronización incremental, outbox ni notificaciones.
- Las reglas prueban la fórmula mensual básica, pero no forman aún un libro completo de movimientos retroactivos, estados, archivado y recuperación.
- La app no está firmada. No hay Team ID, certificado, App Store Connect ni TestFlight configurados.
- No se midió en iPhone físico. La compilación de simulador y sus capturas no certifican rendimiento, banca, nube ni accesibilidad de extremo a extremo.

No se usaron datos financieros reales ni se intentó acceder o escribir en cuentas. No se cambiaron archivos de la PWA, Pages, `main` ni `pages-v9731-real-final`.

## Hallazgo y corrección de CI

El workflow SwiftUI subía una captura como artefacto y también hacía `git commit`/`git push` del PNG a la misma rama que había compilado. Eso movía HEAD después de validar el código y permitía conflictos de fast-forward si entraba otro cambio durante la ejecución. También etiquetaba la captura como sintética aunque se obtenía con `simctl io screenshot` de la app instalada en el simulador.

La corrección elimina la escritura Git del workflow, reduce el permiso a `contents: read`, y produce artefactos separados para capturas reales del simulador en tema claro y oscuro. El job rechaza capturas ausentes o idénticas. El cambio de tipografía usa métricas escalables y añade etiquetas de accesibilidad para el mes y el Disponible.

## Verificación pendiente de este cambio

El nuevo commit debe superar el workflow macOS: compilación de la app, ejecución de las pruebas financieras existentes, render de ambos temas y carga del artefacto de capturas. Hasta que ese run termine, los cambios no se consideran validados. El siguiente bloqueo material para la beta funcional es diseñar e implementar persistencia/autenticación con aislamiento de servidor; no hay backend ni credenciales de servicio configurados en este entorno.

# Matriz de fases — Fluxia Élite nativa

Commit de código evaluado: `20dd2bda28bcad5d139170e656996f63c1f5ef60`.

| Fase | Severidad | Estado | Prueba de cierre / bloqueo |
|---|---|---|---|
| A. Auditoría inicial | P0 | Cerrada para el scaffold SwiftUI | Instrucciones, fuentes, pruebas y workflows leídos; run macOS verde. El checkout local no estuvo disponible y no hay toolchain Swift/Xcode en este entorno. |
| B. Diseño claro/oscuro | P1 | Parcial | Tema claro predeterminado, oscuro opcional persistente y capturas de simulador. Falta revisión visual humana, Dynamic Type extremo y VoiceOver en dispositivo. |
| C. Arquitectura | P1 | Parcial | Módulos de reglas existentes separados; `ContentView` aún concentra presentación y navegación. |
| D. Motor financiero | P0 | Parcial | Fórmula de Disponible en céntimos; 432 combinaciones deterministas. Faltan libro transaccional, movimientos retroactivos, pagos, huchas, compartidos, financiaciones e historial. |
| E. Integridad | P0 | Parcial | Coincidencia fijo/cargo prudente, identidad proveedor-cuenta-referencia y diez pasadas sintéticas. No se prueba persistencia, concurrencia, tombstones ni sync real. |
| F. Autenticación/nube | P0 | Bloqueada por infraestructura | No existe integración nativa/backend configurado en `native-ios/`; no se afirmará aislamiento de servidor. |
| G. Bancos | P0 | Bloqueada por proveedor | Sin contrato/credenciales del proveedor; no hay conexión ni sincronización implementada. |
| H. Rendimiento | P1 | No verificada | Sin métricas de app en iPhone físico; build de simulador no mide interacción en uso. |
| I. Pruebas | P0 | Parcial | Reglas, demo, conciliación, clasificación e aislamiento de cliente pasan. No hay pruebas UI/XCTest, servidor, nube, meses históricos ni reinstalación. |
| J. Beta iPhone | P0 | No distribuible | Solo `.app` de simulador. No se generó IPA firmada ni TestFlight. |

No se promociona RC2 ni se declara la aplicación financieramente apta mientras las fases P0 de libro real, persistencia, aislamiento de servidor, conciliación end-to-end y distribución sigan abiertas.

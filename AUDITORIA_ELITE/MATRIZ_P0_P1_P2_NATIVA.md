# Matriz de fases — Fluxia Élite nativa

Commit de código validado en simulador: `e1ae19100ae734ccc5e2fb46e324d900ffd0f0c4` (run 38518030887, success).

| Fase | Severidad | Estado | Prueba de cierre / bloqueo |
|---|---|---|---|
| A. Auditoría inicial | P0 | Cerrada para el scaffold SwiftUI | Instrucciones, fuentes, pruebas y workflows leídos; run macOS 38518030887 verde. Este entorno no incluye toolchain Swift/Xcode local; compilación verificada en runner macOS. |
| B. Diseño claro/oscuro | P1 | Parcial | Tema claro predeterminado, oscuro opcional persistente; capturas reales de ambos temas revisadas, mes localizado en español. Dynamic Type extremo y VoiceOver en dispositivo siguen pendientes. |
| C. Arquitectura | P1 | Parcial | Reglas, ciclo de vida, proyección y diseño separados; `ContentView` aún concentra presentación, módulos y navegación. |
| D. Motor financiero | P0 | Parcial | Fórmula de Disponible en céntimos; 432 combinaciones deterministas. Faltan libro transaccional, movimientos retroactivos, pagos, huchas, compartidos, financiaciones e historial. |
| E. Integridad | P0 | Parcial | Coincidencia fijo/cargo prudente, identidad proveedor-cuenta-referencia y diez pasadas sintéticas. No se prueba persistencia, concurrencia, tombstones ni sync real. |
| F. Autenticación/nube | P0 | No implementada; auditoría de backend completada | Existe proyecto Supabase y se inspeccionaron metadatos/RLS sin leer filas; no hay cliente iOS, configuración de clave pública en build ni flujo de sesión. Varias tablas bancarias y `movimientos` no tienen políticas RLS. |
| G. Bancos | P0 | Bloqueada por proveedor | Sin contrato/credenciales del proveedor; no hay conexión ni sincronización implementada. |
| H. Rendimiento | P1 | No verificada | Sin métricas de app en iPhone físico; build de simulador no mide interacción en uso. |
| I. Pruebas | P0 | Parcial | Checks contables, aislamiento de cliente, historial sintético, proyección mensual, build y capturas de simulador pasan. No hay pruebas UI/XCTest, servidor, nube ni reinstalación. |
| J. Beta iPhone | P0 | No distribuible | Solo `.app` de simulador. No se generó IPA firmada ni TestFlight. |

No se promociona RC2 ni se declara la aplicación financieramente apta mientras las fases P0 de libro real, persistencia, aislamiento de servidor, conciliación end-to-end y distribución sigan abiertas.

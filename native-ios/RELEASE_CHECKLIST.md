# Fluxia Élite nativa — puerta de entrada a TestFlight

Estado: **NO DISTRIBUIBLE TODAVÍA**. La lectura real autenticada está implementada y pendiente de validar; la demo editable contiene únicamente datos ficticios.

## Preparación técnica
- [x] Proyecto SwiftUI independiente en `native-ios/`.
- [x] Compilación para simulador iOS validada en GitHub.
- [x] Archivo sin firmar para dispositivo físico compilado previamente.
- [x] Motor de Disponible en céntimos y pruebas de regresión.
- [x] Detección conservadora de posible coincidencia fijo/cargo bancario.
- [x] Capturas reales del simulador: tema claro, tema oscuro y acceso sin configurar; inspeccionadas en el commit `efab495873719695d00ef0e1b687732ed1bb1f71`.
- [x] Gate de autenticación y configuración sin clave: pruebas puras y pantalla de acceso verificados; el ledger sigue deshabilitado.
- [ ] Almacén local AES-GCM/Keychain usado solo por la demo sintética; pruebas de persistencia, propietario, repetición, conflicto y tombstone pendientes de CI.
- [ ] Lectura autenticada de perfiles y claves `fluxia_datos` (solo `SELECT`, RLS por propietario) implementada; prueba con una cuenta real y selección de perfil pendiente. No calcula Disponible ni escribe en nube.
- [ ] Demo editable de ingresos, gastos y provisiones con importes convertidos directamente a céntimos; flujo UI y persistencia cifrada pendientes de CI/simulador.
- [ ] IPA nativo sin firma empaquetado por Actions; requiere firma posterior antes de instalar en iPhone.
- [ ] Login nativo probado con una cuenta de prueba y configuración legítima del proyecto.
- [ ] Restauración/cierre de sesión comprobados end-to-end en dispositivo con cuenta de prueba.
- [ ] Persistencia en nube auditada y migraciones reversibles.
- [ ] Integridad financiera de extremo a extremo verificada.
- [ ] Rendimiento medido en un iPhone real.
- [ ] Apple Developer Program activo (cuenta gratuita NO basta).
- [ ] App Store Connect y firma de distribución configurados.
- [ ] IPA firmado y validado para TestFlight.
- [ ] Invitación y primera instalación física.

## Reglas de seguridad
Nunca almacenar certificados, claves privadas ni tokens bancarios en Git.
Nunca utilizar datos reales en las capturas de simulador.
Nunca confundir `.xcarchive` sin firmar o `.app` de simulador con una aplicación instalable.
Nunca modificar la PWA estable como parte de la entrega nativa.

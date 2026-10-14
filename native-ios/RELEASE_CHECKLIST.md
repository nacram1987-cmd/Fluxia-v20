# Fluxia Élite nativa — puerta de entrada a TestFlight

Estado: **NO DISTRIBUIBLE TODAVÍA**. Solo datos ficticios.

## Preparación técnica
- [x] Proyecto SwiftUI independiente en `native-ios/`.
- [x] Compilación para simulador iOS validada en GitHub.
- [x] Archivo sin firmar para dispositivo físico compilado previamente.
- [x] Motor de Disponible en céntimos y pruebas de regresión.
- [x] Detección conservadora de posible coincidencia fijo/cargo bancario.
- [x] Capturas reales del simulador: tema claro, tema oscuro y acceso sin configurar; inspeccionadas en el commit `efab495873719695d00ef0e1b687732ed1bb1f71`.
- [x] Gate de autenticación y configuración sin clave: pruebas puras y pantalla de acceso verificados; el ledger sigue deshabilitado.
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

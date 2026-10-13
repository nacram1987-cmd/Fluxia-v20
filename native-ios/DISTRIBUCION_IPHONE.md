# Fluxia Élite nativa — distribución iPhone

## Estado
- App independiente SwiftUI en `native-ios/`, rama `feature/fluxia-elite-ios-capacitor`.
- GitHub Actions de simulador: compila sin firma y ejecuta pruebas.
- GitHub Actions de dispositivo: flujo **manual** `fluxia-elite-device-archive.yml`; genera un `.xcarchive` **sin firmar**, no instalable.
- No se ha configurado firma, Apple Developer Team ID, App Store Connect ni TestFlight.
- Nunca subir certificados, claves privadas, perfiles o claves de API al repositorio.

## Cuenta Apple
Una cuenta Apple Developer gratuita no habilita TestFlight. Para TestFlight se necesita inscripción activa en el Apple Developer Program, registro de app en App Store Connect, identidad de firma y un flujo de distribución firmado.

## Preparación segura
1. Completar y verificar funcionalidad nativa con datos sintéticos.
2. Confirmar inscripción en el programa de pago solo cuando haya beta apta.
3. Crear identificador de aplicación único y registrar app en App Store Connect.
4. Configurar credenciales de firma mediante secretos protegidos de GitHub o un servicio de CI de confianza; no compartirlas por chat ni confirmarlas en texto.
5. Crear build de distribución firmado, subir a App Store Connect y validar TestFlight.
6. Invitar a prueba al iPhone; no confundir artefactos de simulador o archivos sin firmar con IPA instalable.

La PWA estable queda fuera de este procedimiento.

# Fluxia Élite nativa — distribución iPhone

## Estado
- App independiente SwiftUI en `native-ios/`, rama `feature/fluxia-elite-ios-capacitor`.
- GitHub Actions de simulador: compila sin firma y ejecuta pruebas.
- GitHub Actions de dispositivo: flujo **manual** `fluxia-elite-device-archive.yml`; genera un `.xcarchive` **sin firmar**, no instalable.
- No se ha configurado firma, Apple Developer Team ID, App Store Connect ni TestFlight.
- Nunca subir certificados, claves privadas, perfiles o claves de API al repositorio.

## Instalación personal mediante Xcode
La documentación de Apple indica que la membresía no es necesaria para ejecutar en los propios dispositivos desde Xcode. Hace falta un Mac con Xcode, iniciar sesión con una cuenta Apple, conectar y confiar en el iPhone, elegir un Team personal en Signing & Capabilities, usar un Bundle ID válido y ejecutar al dispositivo. El `.app` entregado por Actions sigue siendo solo para simulador y no se instala directamente.

`native-ios/project.yml` permite ahora que Xcode gestione la firma al ejecutar el proyecto localmente. Los workflows de CI y el archivo de dispositivo sin firma siguen pasando explícitamente `CODE_SIGNING_ALLOWED=NO`.

## TestFlight
Para distribuir la beta mediante TestFlight se necesita membresía activa del Apple Developer Program, un identificador de app registrado, un registro de app en App Store Connect, firma de distribución y carga del build a App Store Connect.

## Preparación segura
1. Completar y verificar funcionalidad nativa con datos sintéticos. La sesión Supabase implementada en esta rama aún requiere configuración de build y prueba de login; no conecta un ledger ni prueba aislamiento en servidor.
2. Confirmar inscripción en el programa de pago solo cuando haya beta apta.
3. Crear identificador de aplicación único y registrar app en App Store Connect.
4. Configurar credenciales de firma mediante secretos protegidos de GitHub o un servicio de CI de confianza; no compartirlas por chat ni confirmarlas en texto.
5. Crear build de distribución firmado, subir a App Store Connect y validar TestFlight.
6. Invitar a prueba al iPhone; no confundir artefactos de simulador o archivos sin firmar con IPA instalable.

La PWA estable queda fuera de este procedimiento.

## Configuración de autenticación nativa
El proyecto acepta `FLUXIA_SUPABASE_URL` y `FLUXIA_SUPABASE_PUBLISHABLE_KEY` como build settings, que Xcode copia a claves de configuración en el Info.plist generado. Se pueden pasar localmente a `xcodebuild` o definir en un `.xcconfig` local fuera de Git. No añadir valores de cuentas privilegiadas, `service_role`, tokens ni credenciales al repositorio. El cliente rechaza HTTP y claves que no usen el prefijo publicable moderno `sb_publishable_`.

CI compila sin estos valores y muestra una pantalla de configuración pendiente; no necesita una clave. No hay consultas a tablas financieras. Las tablas de ledger y bancos carecen de políticas RLS verificadas para el cliente iOS, por lo que el inicio de sesión por sí solo no habilita ni autoriza datos financieros.

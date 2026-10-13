# Distribución iOS — estado y siguiente paso

Rama: [feature/fluxia-elite-ios-capacitor](https://github.com/nacram1987-cmd/Fluxia-v20/tree/feature/fluxia-elite-ios-capacitor)  
Commit de código: `0599d7f807df52bae9c993183c7565bc8c1be306`  
Run de validación: [38471782736](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38471782736)

## Artefactos verificados

- [Capturas reales del simulador: tema claro y oscuro](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38471782736/artifacts/11851454754) — ZIP de PNG, SHA-256 del artefacto: `fec5dc1e6d2f9c579076ad608e89fd2395bab9b8bd840ad82771a4dfb4eb3535`.
- [App compilada para iOS Simulator](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38471782736/artifacts/11851879067) — ZIP de `.app`, SHA-256 del artefacto: `8c4394cea884b679b200abf09fb72aead56b0d8d65e641c3ac1bd87495d5eb54`.

El artefacto `.app` de simulador **no se instala en un iPhone físico**. Esta ejecución no generó un archivo de dispositivo ni un IPA.

## Siguiente paso para instalar en tu propio iPhone

Apple permite ejecutar en los dispositivos propios desde Xcode sin membresía de pago. Hace falta un Mac con Xcode: generar el proyecto con XcodeGen, conectar el iPhone, seleccionar un Team personal y firma automática en Signing & Capabilities, y ejecutar el esquema en ese dispositivo. El artefacto de esta ejecución es exclusivamente para simulador.

Para beta distribuible a testers por TestFlight sí se requiere Apple Developer Program activo, Bundle ID registrado en Certificates, Identifiers & Profiles, registro de app en App Store Connect y un build firmado cargado allí. No hay actualmente Team ID, firma, App Store Connect ni TestFlight configurados. Mantener certificados y claves privadas fuera del chat y del repositorio.

# Distribución iOS — estado y siguiente paso

Rama: [feature/fluxia-elite-ios-capacitor](https://github.com/nacram1987-cmd/Fluxia-v20/tree/feature/fluxia-elite-ios-capacitor)  
Commit de código: `20dd2bda28bcad5d139170e656996f63c1f5ef60`  
Run de validación: [38470940479](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38470940479)

## Artefactos verificados

- [Capturas reales del simulador: tema claro y oscuro](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38470940479/artifacts/11851917862) — ZIP de PNG, SHA-256 del artefacto: `a8f945b27848c267c900f65b6339e6eb866f2067b74c214a9f6d14b33820f221`.
- [App compilada para iOS Simulator](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38470940479/artifacts/11852925612) — ZIP de `.app`, SHA-256 del artefacto: `2a6b46108f055a823278ac17d3ece29da040fea8dbd7c050d563f0fd52d2a240`.

El artefacto `.app` de simulador **no se instala en un iPhone físico**. Esta ejecución no generó un archivo de dispositivo ni un IPA.

## Estado Apple

La documentación de `native-ios/DISTRIBUCION_IPHONE.md` indica que no hay Team ID, firma, App Store Connect ni TestFlight configurados. Para instalar en un iPhone, el siguiente paso técnico exacto es habilitar una cuenta activa de Apple Developer Program, registrar el bundle ID en App Store Connect y configurar firma/notarización de CI mediante secretos protegidos; después se genera y valida un build firmado para TestFlight. No compartir certificados, claves privadas ni tokens en el chat o Git.

# Fluxia Élite BETA — simulación iOS nativa v0.1.5-DEV

## Qué se ha implementado
- SwiftUI real: `FluxiaEliteApp.swift`, `FluxiaLoginView.swift`, `FluxiaEliteAppView.swift`.
- Inicio de sesión Supabase con clave pública y credenciales del propio usuario.
- Lectura **de solo consulta** de seis colecciones canónicas: movimientos, ingresos, fijos, provisiones, financiaciones y compartidos.
- Pantalla `FluxiaRealRecordsView.swift`: lista de importes, conceptos y periodos originales en cada colección autenticada.
- El «Disponible» se oculta con un guion mientras las colecciones legadas no estén conciliadas con el nuevo ledger.
- Fuente del logo: icono oficial del repositorio Fluxia. Si falla la red, se muestra un icono neutro.
- RLS del backend validada por lectura de políticas: `SELECT auth.uid() = user_id`.

## Generar simulador **nativo** sin Apple Developer

El flujo `.github/workflows/fluxia-ios-simulator.yml` ejecuta en macOS:
1. Instala XcodeGen y genera `FluxiaEliteBeta.xcodeproj`.
2. Compila en el SDK `iphonesimulator` con `CODE_SIGNING_ALLOWED=NO`.
3. Empaqueta `FluxiaEliteBeta.app` en ZIP y lo adjunta a la ejecución.
4. Si el repositorio tiene configurado el secreto `APPETIZE_API_TOKEN`, sube el ZIP a Appetize y muestra un vínculo `https://appetize.io/app/<id>`.

**Appetize no exige Apple Developer; sí cuenta y token de Appetize** para una subida automatizada. Crear un token con los menores permisos adecuados y añadirlo al repositorio en **Settings > Secrets and variables > Actions > New repository secret**, con nombre `APPETIZE_API_TOKEN`. No pegar el token en código, commits ni conversaciones. Una vez añadido, ejecutar de nuevo la compilación en la rama `feature/ios-ledger-core-20261014`.

Referencias de Appetize: https://docs.appetize.io/platform/app-management/uploading-apps/ios y https://github.com/appetizeio/github-action-appetize .

## Restricciones actuales, sin ocultar
- El proyecto no ha pasado todavía una compilación Xcode confirmada. No afirmar que el simulador está accesible hasta obtener un build y enlace exitosos.
- Vista de registros reales **no es todavía** el ledger reconciliado. No calcular totales desde JSON legado sin analizar estados, duplicados, meses, pagos y lógica histórica.
- **No escribir** en Supabase ni alterar datos de producción desde este lector.
- No modificar `index.html` ni promover LAB a estable sin la orden explícita «con labora» y QA.
- Los navegadores y PWA no ejecutan un binario SwiftUI; una prueba nativa real exige un simulador iOS (local o remoto).
- Las sesiones de emuladores remotos pueden contener información privada. Comprobar las condiciones y permisos de Appetize antes de iniciar sesión con datos financieros.

## Tests
El núcleo contable previo tiene 8 tests de Swift. Se probaron localmente en Linux el 14/10/2026 (8/8); **esto no equivale a una compilación iOS ni prueba de la nueva interfaz SwiftUI**.

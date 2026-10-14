# Pruebas de integridad ejecutadas — app nativa

Commit probado: `e1ae19100ae734ccc5e2fb46e324d900ffd0f0c4`
Resultado: [GitHub Actions run 38518030887](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38518030887) (**success**)

## Casos ejecutados en macOS

- `FinanceRules`: 6 checks base y 432 combinaciones deterministas de ingreso, fijos, variables, provisión prevista y aportación real.
- Demo: 4 checks; confirma datos sintéticos y deshabilita mutaciones y conexión bancaria.
- Conciliación fijo/cargo: 7 checks; incluye ID de cargo y de fijo vacíos o en blanco.
- Importación bancaria: 10 decisiones deterministas sobre identidad por proveedor/cuenta/ID, conflicto por importe modificado y entradas inválidas. Se verifica que espacios alrededor de proveedor, cuenta o ID no permiten volver a importar el mismo cargo. Además, 400 IDs sintéticos se pasan diez veces: 400 únicos y 3.600 decisiones de duplicado.
- Aislamiento cliente: 8 checks; propietario, usuario distinto, sesión anónima/vacía, registros con identidad en blanco y filtrado.

- `MonthlyLedgerProjection`: 7 checks sintéticos sobre periodos, inclusión/exclusión explícita, propietario, identidad única y overflow; valida los movimientos del mes sin inferir contabilización por archivado/papelera.
- `LedgerLifecycle`: 10 checks sintéticos sobre transiciones, control de propietario, evento antes/después, replay idempotente, papelera, restauración y tombstone terminal. Esta máquina es un valor en memoria: no constituye persistencia ni autenticación.

Después se generó el proyecto Xcode, se compiló con `xcodebuild` para iOS Simulator, se instaló y lanzó en el simulador y se guardaron PNG del tema claro y oscuro. Se inspeccionaron ambas imágenes: paletas distintas, sin solapamientos visibles y mes localizado como «octubre de 2026». El job empaquetó el `.app` de simulador. Artefactos del run 38518030887: [capturas claro/oscuro](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38518030887/artifacts/11873051503) y [app de simulador](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38518030887/artifacts/11872647715).

El cambio de arquitectura probado en este commit extrae `ElitePalette` y `EliteTab` de `ContentView.swift` a `EliteDesignSystem.swift`. La interfaz y navegación principal siguen concentradas en `ContentView.swift`.

## No cubierto

Los 400 movimientos son fixtures en memoria; no representan diez sincronizaciones contra un proveedor ni prueban escritura atómica, outbox, notificaciones, persistencia, concurrencia, borrado/recuperación o servidor. Tampoco se prueban datos reales, usuarios reales, histórico retroactivo, cambios de mes con movimientos ni reinstalación.


## Estado de conexión cloud (auditoría solo de metadatos)

El proyecto Supabase `Fluxia` está activo, pero esta app nativa **no está conectada**. Se inspeccionaron esquema, políticas RLS y asesores sin leer valores de movimientos, ingresos ni otros registros financieros. La tabla `fluxia_datos` ofrece clave primaria compuesta por usuario y clave con políticas de lectura/escritura del propio usuario; el cliente nativo aún no está configurado para usarla. Siete tablas relacionadas con banco/movimientos tienen RLS activo sin políticas y quedan inaccesibles al cliente, por lo que no se usarán directamente.

El chequeo de seguridad también señaló funciones con `search_path` mutable, una función `SECURITY DEFINER` ejecutable por autenticados y protección contra contraseñas filtradas deshabilitada. No se modificó el esquema ni la configuración de producción. La existencia de RLS en algunas tablas no valida autenticación, persistencia ni sincronización de la app.

El run 38518030887 finalizó con éxito en sus pasos de contabilidad, compilación, captura de los dos temas y empaquetado. El artefacto `.app` es exclusivamente para simulador y no está firmado para instalarse en un iPhone físico.

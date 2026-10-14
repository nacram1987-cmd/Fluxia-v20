# Pruebas de integridad ejecutadas — app nativa

Commit: `3656a75f3ae34022b084c0aef72bdc37ebf62e0c`  
Resultado: [GitHub Actions run 38515243267](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38515243267) (**success**)

## Casos ejecutados en macOS

- `FinanceRules`: 6 checks base y 432 combinaciones deterministas de ingreso, fijos, variables, provisión prevista y aportación real.
- Demo: 4 checks; confirma datos sintéticos y deshabilita mutaciones y conexión bancaria.
- Conciliación fijo/cargo: 7 checks; incluye ID de cargo y de fijo vacíos o en blanco.
- Importación bancaria: 10 decisiones deterministas sobre identidad por proveedor/cuenta/ID, conflicto por importe modificado y entradas inválidas. Se verifica que espacios alrededor de proveedor, cuenta o ID no permiten volver a importar el mismo cargo. Además, 400 IDs sintéticos se pasan diez veces: 400 únicos y 3.600 decisiones de duplicado.
- Aislamiento cliente: 8 checks; propietario, usuario distinto, sesión anónima/vacía, registros con identidad en blanco y filtrado.

- `LedgerLifecycle`: 10 checks sintéticos sobre transiciones, control de propietario, evento antes/después, replay idempotente, papelera, restauración y tombstone terminal. Esta máquina es un valor en memoria: no constituye persistencia ni autenticación.

Después se generó el proyecto Xcode, se compiló con `xcodebuild` para iOS Simulator, se instaló y lanzó en el simulador y se guardaron PNG del tema claro y oscuro. El job empaquetó el `.app` del simulador. Artefactos del run 38515243267: [capturas claro/oscuro](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38515243267/artifacts/11871243043) y [app de simulador](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38515243267/artifacts/11872021454).

## No cubierto

Los 400 movimientos son fixtures en memoria; no representan diez sincronizaciones contra un proveedor ni prueban escritura atómica, outbox, notificaciones, persistencia, concurrencia, borrado/recuperación o servidor. Tampoco se prueban datos reales, usuarios reales, histórico retroactivo, cambios de mes con movimientos ni reinstalación.

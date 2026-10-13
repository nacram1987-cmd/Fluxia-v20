# Pruebas de integridad ejecutadas — app nativa

Commit: `0599d7f807df52bae9c993183c7565bc8c1be306`  
Resultado: [GitHub Actions run 38471782736](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38471782736) (**success**)

## Casos ejecutados en macOS

- `FinanceRules`: 6 checks base y 432 combinaciones deterministas de ingreso, fijos, variables, provisión prevista y aportación real.
- Demo: 4 checks; confirma datos sintéticos y deshabilita mutaciones y conexión bancaria.
- Conciliación fijo/cargo: 5 checks; coincidencia exacta de concepto e importe, importe distinto, pagado, ambiguo y cero.
- Importación bancaria: identidad por proveedor/cuenta/ID, conflicto si el importe del mismo ID cambia, aislamiento de proveedor/cuenta, ID vacío/solo espacios y 400 IDs sintéticos pasados diez veces: 400 únicos y 3.600 decisiones de duplicado.
- Aislamiento cliente: 6 checks de dueño, usuario distinto, sesión anónima/vacía y filtrado.

Después se generó el proyecto Xcode, se compiló con `xcodebuild` para iOS Simulator, se instaló y lanzó en el simulador y se guardaron PNG del tema claro y oscuro. El job también empaquetó el `.app` del simulador.

## No cubierto

Los 400 movimientos son fixtures en memoria; no representan diez sincronizaciones contra un proveedor ni prueban escritura atómica, outbox, notificaciones, persistencia, concurrencia, borrado/recuperación o servidor. Tampoco se prueban datos reales, usuarios reales, histórico retroactivo, cambios de mes con movimientos ni reinstalación.

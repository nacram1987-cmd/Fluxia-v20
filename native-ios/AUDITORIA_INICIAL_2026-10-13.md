# Auditoría inicial Fluxia Élite nativa

Fecha: 13/10/2026 (Europe/Madrid)  
Rama examinada: `feature/fluxia-elite-ios-capacitor`  
Punto de partida del código: `96750a275b957ded93d08fa44b5be1f9fa6fc608`  
Punta examinada antes de cambios: `eb7a7bba0fd1a4d1a9aac7b2783212ad0eb4bf3e` (solo añade una captura del simulador a la rama).

## Estado comprobado

La aplicación de `native-ios/` es una aplicación SwiftUI independiente. La interfaz muestra importes sintéticos y es de solo lectura. La compilación, la suite Swift de 27 aserciones y la captura de simulador habían pasado en el workflow `Fluxia Elite - Native SwiftUI iOS` del commit `96750a2` (run 38468574127, success).

Los módulos existentes son pequeños y puros: cálculo del Disponible en céntimos, sugerencia conservadora de conciliación, clasificación de duplicados bancarios y filtro defensivo por propietario. La interfaz y los módulos explicativos siguen concentrados en `ContentView.swift`.

## Límites que impiden llamar RC2 funcional o distribuible

- No hay altas/ediciones/pagos reales, persistencia local o en nube, autenticación ni gestión de sesiones.
- `AccountIsolation` es una defensa de cliente de demostración; no hay backend ni controles RLS/ACL conectados.
- La política bancaria es una función pura de clasificación; no hay proveedor, importación, sincronización incremental, outbox ni notificaciones.
- Las reglas prueban la fórmula mensual básica, pero no forman aún un libro completo de movimientos retroactivos, estados, archivado y recuperación.
- La app no está firmada. No hay Team ID, certificado, App Store Connect ni TestFlight configurados.
- No se midió en iPhone físico. La compilación de simulador y sus capturas no certifican rendimiento, banca, nube ni accesibilidad de extremo a extremo.

No se usaron datos financieros reales ni se intentó acceder o escribir en cuentas. No se cambiaron archivos de la PWA, Pages, `main` ni `pages-v9731-real-final`.

## Hallazgo y corrección de CI

El workflow SwiftUI subía una captura como artefacto y también hacía `git commit`/`git push` del PNG a la misma rama que había compilado. Eso movía HEAD después de validar el código y permitía conflictos de fast-forward si entraba otro cambio durante la ejecución. También etiquetaba la captura como sintética aunque se obtenía con `simctl io screenshot` de la app instalada en el simulador.

La corrección elimina la escritura Git del workflow, reduce el permiso a `contents: read`, y produce artefactos separados para capturas reales del simulador en tema claro y oscuro. El job rechaza capturas ausentes o idénticas. El cambio de tipografía usa métricas escalables y añade etiquetas de accesibilidad para el mes y el Disponible.

## Actualización de verificación — 14/10/2026

Los cambios nativos posteriores se validaron en el commit `e1ae19100ae734ccc5e2fb46e324d900ffd0f0c4`, workflow [run 38518030887](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38518030887): checks financieros, build iOS Simulator, capturas reales de modo claro/oscuro y empaquetado terminaron en `success`. Se extrajeron los tokens de diseño y pestañas a `EliteDesignSystem.swift`; el selector mensual ahora fija locale `es_ES`. Capturas inspeccionadas: [artefacto claro/oscuro](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38518030887/artifacts/11873051503). La app sigue siendo demo de lectura con datos ficticios.

La auditoría de metadatos confirmó proyecto Supabase activo, pero la app nativa no tiene autenticación ni persistencia conectadas; siete tablas de movimientos/banca carecen de políticas RLS y hay avisos de seguridad. No se leyeron filas financieras ni se escribió en producción. El siguiente bloqueo es definir autenticación/sesión y persistencia con un esquema servidor transaccional y controles de propietario verificables; no habilitar directamente snapshots de `fluxia_datos` como libro mayor.

## Actualización de acceso nativo — 14/10/2026

Se añadió el SDK oficial `supabase-swift` fijado a `2.55.4`, login email/contraseña, restauración de sesión y cierre de sesión. El flujo guarda la sesión mediante el almacenamiento Keychain predeterminado del SDK. La app queda en gate de acceso; la demo de datos sintéticos requiere pulsar explícitamente «Explorar demo». Actions usa un argumento de lanzamiento de demo solo para generar las capturas de dashboard y captura también el inicio normal sin configuración.

La configuración se inyecta como build settings `FLUXIA_SUPABASE_URL` y `FLUXIA_SUPABASE_PUBLISHABLE_KEY`; no se guardan claves en Git. Si no están definidas, la app muestra configuración pendiente y no inicia un acceso remoto. Tras autenticar solo muestra estado de sesión: no hay lecturas/escrituras del ledger ni bancos. Las políticas RLS observadas no permiten habilitar de forma segura las tablas financieras del esquema actual.

Verificación del commit `efab495873719695d00ef0e1b687732ed1bb1f71`: workflow [38521326508](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38521326508) terminó `success`: Swift financiero y gate/configuración, XcodeGen, build iOS Simulator, capturas y paquete `.app` de simulador. Artefactos: [capturas claras, oscuras y acceso sin configurar](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38521326508/artifacts/11873334457), [app exclusiva de simulador](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38521326508/artifacts/11873439325). Las tres imágenes se descargaron e inspeccionaron; el workflow rechaza PNG de dashboard en blanco por tamaño mínimo. La CI no tiene configuración de auth y por ello muestra correctamente «Configuración de acceso pendiente».

No se probó login ni restauración de una sesión real porque no hay cuenta de prueba/configuración de cliente provisionada en Actions. No se hicieron consultas de finanzas. Swift/Xcode tampoco están instalados en el entorno local; la compilación se certifica únicamente por este runner macOS.

## Persistencia local cifrada — en validación por CI (14/10/2026)

Se añadió `EncryptedLedgerStore` como siguiente capa nativa: partición local por propietario, cifrado AES-GCM con clave aleatoria almacenada en Keychain (`WhenUnlockedThisDeviceOnly`), archivos protegidos por iOS, escrituras atómicas, bloqueo de transacciones compartido entre instancias del proceso, registro auditable, claves de operación idempotentes y tombstones para impedir resurrecciones tras borrado permanente. La API exige que el propietario autenticado coincida antes de exponer o mutar movimientos. El conjunto de pruebas usa únicamente un usuario y movimientos sintéticos; verifica reapertura, ciphertext, denegación entre propietarios, repetición y tombstone.

Esto **no está conectado a la interfaz ni se ejecuta tras el login todavía** y no aporta sincronización, recuperación tras reinstalar ni aislamiento servidor. Es una base offline local; las escrituras simultáneas de procesos distintos tampoco se certifican. No se activó en el proyecto de nube existente: la auditoría previa encontró tablas financieras/bancarias sin políticas RLS. El estado se mantiene como pendiente hasta que el nuevo test del workflow macOS termine y se revise su resultado.

## Diseño azul/blanco, demo editable y lectura financiera autenticada — 14/10/2026

Se ajustó el modo claro a la referencia entregada en el chat: fondo azul hielo, tarjetas blancas, texto azul marino y oro como acento. El modo oscuro conserva su fondo marino. La demo permite añadir ingresos, gastos fijos/variables y provisiones en un mes elegido; los datos son sintéticos, quedan en el almacén AES-GCM/Keychain local separado y el Disponible se recalcula con el motor en céntimos. El importador de euros rechaza más de dos decimales y valores fuera de Int64.

Para la cuenta real se añadió una lectura nativa condicionada por sesión: primero descubre IDs de perfil solicitando solo claves; con un perfil carga únicamente `v2_ingresos`, `v2_fijos`, `v2_movimientos`, `v2_provisiones`, `v2_financiaciones`, `v2_compartidos` y `v2_config_plan` bajo el UUID autenticado. Si hay varios perfiles no elige uno automáticamente. SQL confirmó las cuatro políticas owner-only en `fluxia_datos`; el lector no usa tablas `movimientos` o bancarias, no escribe y no aplica el Disponible ni fusiona estados. El usuario seguirá viendo los importes originales por registro.

La URL y clave publishable pública se incluyen en la configuración del workflow (esa clave ya es de cliente y aparece en la PWA); no se añadió ninguna contraseña ni clave privilegiada. Se añadió empaquetado `.ipa` de iPhone sin firma para resolver el límite del ZIP de `.app` de simulador. La build iOS, las pruebas, la captura nueva, el lector con cuenta propia y el IPA de este cambio aún deben pasar el workflow macOS. El login necesita que el usuario introduzca su contraseña; no se han leído filas de producción ni realizado escrituras.

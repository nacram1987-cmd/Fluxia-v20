# Informe forense — Fluxia Élite nativa

Fecha: 14/10/2026 (Europe/Madrid)  
Repositorio: [nacram1987-cmd/Fluxia-v20](https://github.com/nacram1987-cmd/Fluxia-v20)  
Rama de trabajo: [feature/fluxia-elite-ios-capacitor](https://github.com/nacram1987-cmd/Fluxia-v20/tree/feature/fluxia-elite-ios-capacitor)  
Commit de código probado: `3656a75f3ae34022b084c0aef72bdc37ebf62e0c`  
Referencia visual aprobada: `96750a275b957ded93d08fa44b5be1f9fa6fc608`  
Workflow macOS: [run 38515243267](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38515243267) — **success**

## Dictamen

El proyecto compila como aplicación SwiftUI real para simulador y conserva el modo claro predeterminado con modo oscuro opcional persistido. El alcance actual sigue siendo una **demo nativa de solo lectura con datos ficticios**; no es todavía una beta financiera RC2 funcional ni un paquete instalable en iPhone.

## Hallazgos

| Área | Estado observado | Evidencia / límite |
|---|---|---|
| Compilación y CI | Verificado | XcodeGen, `xcodebuild` para iOS Simulator, ejecución y captura `simctl` en el run indicado. |
| Diseño | Parcial | Paleta cálida/navy/oro, selector persistente claro/oscuro; texto del logo y Disponible con escalado Dynamic Type y etiquetas VoiceOver. Se capturaron ambos temas. No hubo inspección manual de VoiceOver ni de iPhone físico. |
| Arquitectura | Parcial | Reglas, conciliación, deduplicación, aislamiento defensivo y ciclo de vida del movimiento viven en archivos separados. La UI y navegación siguen concentradas en `ContentView.swift`; el ciclo de vida es solo memoria. |
| Motor financiero | Parcial | Disponible en céntimos y fórmula mensual probados. No existe libro de movimientos CRUD con estados, periodos, pagos, archivado y recuperación. |
| Integridad | Parcial | Identidades bancarias se comparan tras recortar espacios; conciliación exacta rechaza IDs vacíos; lifecycle deja tombstone terminal en el agregado de memoria. Falta persistencia e importación real, así que no certifica integridad end-to-end. |
| Autenticación y nube | No implementado | No hay sesión, almacén remoto, RLS/ACL conectado, outbox ni recuperación tras reinstalación. `AccountIsolation` solo filtra datos ficticios en cliente. |
| Bancos | No implementado | No hay proveedor ni conexión. La clasificación es una función pura y no importa cargos. |
| Rendimiento | No verificado en iPhone | El tiempo de build de CI no es una medida de arranque/gestos. No hubo benchmark de app en dispositivo real. |
| Distribución | No lista | El artefacto disponible es solo para simulador, sin firma. No hay IPA/TestFlight. |

## Cambio realizado en esta ejecución

- Eliminado del workflow SwiftUI el `git commit`/`git push` automático de una imagen binaria a la rama compilada. Las capturas quedan como artefactos de Actions y el token pasa a `contents: read`.
- Capturas reales de simulador para modo claro y oscuro; el job falla si falta alguna o si ambos PNG son idénticos.
- Dynamic Type para la marca y Disponible, y etiquetas accesibles para el mes seleccionado y el saldo ficticio.
- Rechazo de proveedor, cuenta o referencia bancaria vacíos o compuestos solo por espacios.
- Máquina de estados financiera con auditoría de transición, control de propietario, operación idempotente y estado terminal tras borrado; no persiste entre ejecuciones.
- Normalización de espacios en claves bancarias antes de deduplicar; IDs en blanco rechazados por conciliación y defensa de propietario.
- Run 38515243267: 6 checks contables, 432 combinaciones, 4 de demo, 7 conciliación, 10 decisiones de importación + lote de 400 IDs/10 pasadas, 8 de aislamiento y 10 del ciclo de vida; build de simulador y capturas de ambos temas satisfactorios.
- Artefactos: [capturas](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38515243267/artifacts/11871243043) · [app simulador](https://github.com/nacram1987-cmd/Fluxia-v20/actions/runs/38515243267/artifacts/11872021454).

No se tocaron `index.html`, workers, manifiestos, PWA ESTABLE, `main` ni `pages-v9731-real-final`. La comparación GitHub de la rama de desarrollo refleja solo archivos del workflow nativo, la app nativa, pruebas, documentación y una captura histórica bajo `previews/`.

## Bloqueos concretos

Conectar datos reales requiere un backend/identidad configurados y pruebas de servidor autorizadas. La integración bancaria requiere proveedor y credenciales legítimas. Para instalar/distribuir en iPhone hace falta firma y un flujo Apple Developer/TestFlight. Esos elementos no estaban disponibles y no se simularon.

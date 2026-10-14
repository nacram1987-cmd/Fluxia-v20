# Fluxia Élite BETA — Registro de versiones y entregas

Fecha de adopción: 2026-10-14.

## Series independientes
- **Fluxia HTML/PWA:** conserva su serie v97.x y la estable existente; nunca cambiar por una entrega iOS.
- **Fluxia Élite BETA (iOS):** serie propia `iOS-BETA-v0.1.0`, `iOS-BETA-v0.1.1`, etc. Incremento correlativo y documentado. No atribuir retroactivamente números a builds inexistentes.
- Estado de versión: `DEV` (código), `LAB` (ejecutable verificable), `RC` (candidata) y `ESTABLE` (validada). Un commit no es una LAB.

## Inventario inicial
- `iOS-BETA-v0.1.0-DEV`: punto de partida de numeración de la nueva rama `feature/ios-ledger-core-20261014`. Incluye el núcleo de cálculo, lector autenticado de solo lectura, clasificador conservador, pruebas escritas y contratos de paridad/branding.
- Compilación: **no verificada**.
- Pruebas automatizadas: **no ejecutadas**.
- Integración con UI iOS: **pendiente**.
- Enlace de previsualización interactiva: **no disponible/verificado**.
- No hay LAB ni ESTABLE de esta serie todavía.

## Requisitos para cada nueva entrega
1. Registrar número, fecha, rama, SHA, cambios, módulos afectados y pruebas ejecutadas.
2. Conservar enlace GitHub a código; entregar URL LAB/ESTABLE únicamente tras comprobar que carga la versión correcta y permite interacción.
3. Cuando haya artefacto compilado/ZIP, proporcionar enlace de descarga real; no inventar enlaces.
4. Preservar logo oficial, denominación **Fluxia Élite BETA**, prompts maestros, integridad financiera, aislamiento, nube y rendimiento.
5. No promover DEV a LAB ni LAB a ESTABLE sin pruebas reproducibles y revisión del usuario.
6. Mantener histórico de versiones estables y posibilidad de reversión.

## Próxima versión prevista
`iOS-BETA-v0.1.1-DEV`: empaquetado compilable y pruebas Swift; mapeo canónico HTML/Supabase y primer flujo de sesión, sin escritura sobre datos reales.

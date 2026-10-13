# Fluxia Élite · iOS Capacitor

Estado: scaffold inicial, NO beta certificada ni distribuible.

## Reglas de producto
- Cumplir PROMPT_MAESTRO.md, AGENTS.md y sus anexos; integridad financiera y aislamiento antes que estética o velocidad.
- Objetivo: superar la PWA en velocidad percibida, estabilidad, diseño y capacidades nativas, **demostrado mediante mediciones**; no se afirma logrado sin pruebas en iPhone.
- Mantener inalterados index.html, manifest, service worker, ramas baseline-v97.66-performance y archivos LAB existentes.
- No incorporar secretos bancarios ni credenciales al paquete iOS. No alterar autenticación, persistencia ni sincronización sin auditoría.
- La app iOS utilizará un paquete web local versionado y auditado; no cargar la URL de Pages como runtime de producción sin evaluación de seguridad y revisión de Apple.

## Preparación
Requiere Node.js, npm, macOS, Xcode y CocoaPods/gestor compatible.

1. Copiar el HTML y assets **validados** de una release candidata al directorio `www/` (no copiar directamente index.html de producción sin QA).
2. Ejecutar `npm install` y `npm run ios:add`.
3. Ejecutar `npm run ios:sync` y abrir `npm run ios:open`.
4. Comprobar rutas, CSP, auth redirect/deep links, persistencia por cuenta, bancos y manejo offline antes de probar con datos reales.

## Puertas de aceptación
Pruebas comparativas PWA/iOS en el mismo iPhone, mismo perfil sintético y dataset: arranque frío/caliente, primera interacción, menú/logo, pestañas, Variables, Bancos, consumo de memoria y fallos. Mediana/p95 en 10 repeticiones. Cero regresiones contables, duplicados o pérdidas de datos. Solo entonces TestFlight.

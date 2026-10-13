# Fluxia Élite App — Política de versiones

Fecha de adopción: 13/10/2026. Norma específica del producto iPhone, subordinada al PROMPT_MAESTRO.md y AGENTS.md en materia de integridad y publicación.

## Secuencia solicitada

Las versiones visibles de LAB App empiezan en **1.1** y avanzan en una décima: **1.1, 1.2, …, 1.9, 2.0, 2.1, …, 99.9**. Después de 99.9 se pasa a **1.0.1**, por decisión expresa del propietario del producto. No se saltan ni se reutilizan números de LAB publicadas.

La secuencia es una **etiqueta de producto**, no SemVer numérico: al pasar a 1.0.1 no debe utilizarse comparación lexicográfica ni numérica ingenua. Usar un contador interno de release monotónico para orden, actualizaciones y migraciones. El CFBundleVersion de iOS debe ser un entero creciente y el CFBundleShortVersionString debe validarse contra las reglas de Apple antes de distribuir; no se debe usar esta secuencia visual directamente como build number.

## Aislamiento

La numeración de la PWA v97.x es independiente. Ninguna release de iOS cambia index.html, service worker, manifiesto o LAB de la PWA. Las betas visuales usan datos ficticios hasta aprobar la integración y QA financiera. Nunca llamar beta nativa instalable a un HTML de demostración.

## Registro

- App LAB 1.1: primera iteración visual interactiva en ios-app/beta-concept.html (concepto, datos ficticios, sin banca real ni instalación nativa).
- Próxima versión App LAB 1.2: ampliación visual e interacciones; pendiente de publicación y validación.

# Plan de publicación segura · Fluxia Élite v2.0.25

**Estado: NO publicado.** Esta sesión no ha empujado nada a GitHub ni desplegado nada, así que **no existe enlace Safari LAB verificado** y no se inventa ninguno. Entregable: `Fluxia_Elite_BETA_v2.0.25_CONCILIACION.zip` listo para subir.

## Pasos (en orden; parar si algo falla)
1. Rama LAB nueva desde `pages-v9731-real-final` (p. ej. `elite-v2.0.25-conciliacion`). **Nunca** commit directo sobre la rama estable.
2. Extraer el ZIP en la raíz del repo respetando rutas. Archivos que cambian: ver `CHECKSUMS_v2.0.26.sha256` (sección «cambios»). No deben cambiar: `index.html`, `fluxia-sw*.js`, `manifest.webmanifest`, `lab/v97.*.html`.
3. `git diff --stat origin/pages-v9731-real-final -- index.html lab/index.html lab/v97.*.html lab/fluxia-sw*.js` → debe estar vacío.
4. Comprobar privacidad antes del commit: `git diff --cached --name-only | grep -Ei 'backup|export|csv|privado|informe-privado'` → vacío; `git diff --cached | grep -Ei 'eyJ|sb_secret|service_role|apikey'` → vacío.
5. Snapshot inmutable: `lab/versions/fluxia-elite-safari-v2.0.25.html` debe ser byte a byte igual a `lab/fluxia-elite-safari-datos-reales.html` (`cmp`).
6. Tests locales: los 29 scripts de CI + `elite-reconciliation-v2025.cjs`.
7. PR hacia la rama de despliegue LAB (no a la estable). Esperar a que **Actions** (`fluxia-elite-espejo-qa.yml` y `fluxia-elite-pages.yml`) terminen en verde; revisar el log, no solo el icono.
8. Verificar la URL real publicada: HTTP 200, `ÉLITE BETA · v2.0.25` en la cabecera, `js/fluxia-elite-reconciliation-v1.js` servido con 200 y la misma huella SHA-256 que `CHECKSUMS`.
9. Solo entonces dar el enlace Safari LAB. Abrirlo en Safari/iOS, reiniciar la PWA y confirmar que aparece v2.0.25 (si Service Worker sirve caché antigua, forzar actualización).
10. Promoción a estable: **solo** cuando el usuario escriba «con labora».

## Rollback
Revertir el PR; la versión anterior queda en `lab/versions/fluxia-elite-safari-v2.0.24.html`. El HTML/PWA estable nunca se toca.

## Bloqueador actual
Publicar requiere permiso de escritura al repositorio y un despliegue verificado en Actions; no se han ejercido en esta sesión. Si quieres que lo publique yo, dímelo expresamente (rama LAB, sin tocar lo estable).

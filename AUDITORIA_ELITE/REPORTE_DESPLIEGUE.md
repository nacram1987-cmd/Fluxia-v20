# Despliegue real

Antes: latest Pages 38376662155, SHA 451f1ac; QA v69 en main con success, sin LAB en fuente real. GET lab/v97.69.html=404. POST pages/builds 403 heredado no se repitió.

Corrección: commit db7790fb93f64f922d8091ee6018fb83f294c338 sobre pages-v9731-real-final añadió únicamente blob v69 c256138f83a803f006c118fbee8cb2d382c4f61e. Run 38387603074 success; GET=200, 1.915.382 bytes. Ocho rutas verificadas por bytes contra fuente; root SHA permanece intacto. Se conserva historial y baseline.

Pipeline nuevo: quality → upload-pages-artifact → deploy-pages@v4 (pages:write/id-token:write desde rama efectiva) → smoke HTTP con hash/iconos. Se evita POST /pages/builds y el supuesto incorrecto de que commit en main publica Pages. No cambia Settings/Pages ni origen por administración.

El candidato generado v97.70 está excluido del artefacto de Pages y no se anuncia como nueva LAB. La promoción root se mantiene bloqueada hasta «con labora» y QA completa.

Evidencias de la ejecución nueva y revisión HTTP final se añadirán al terminar. Safari/PWA física: NO VERIFICADO.

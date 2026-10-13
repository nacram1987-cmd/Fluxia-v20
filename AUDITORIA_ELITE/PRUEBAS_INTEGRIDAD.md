# Pruebas ejecutadas y límites

- Frozen baseline: seis snapshots verificados y siete archivos protegidos; suite original sin eliminar assertions.
- QA original v97.66: 168 scripts, 400 filas, 20 ciclos menú/logo, ediciones in-place/storage/perfil, mes/subvistas, listas y motor financiero intactos.
- QA original v97.69: variable 30 €, fijo banco 70→73 €, pendiente 35 €, total realizado 100→103 €, transfer 500 excluida, historial lazy, Disponible invariante ante presentación.
- Nuevos bancos: 9 tests aislados; baseline falla 6, candidato pasa 9. Prueba extendida colisión ID entre bancos falla y bloquea publicación del candidato.
- Nuevas finanzas: ingreso 1000, variable 30, fijo previsto 70: Disponible 900; cargo real 73: Disponible 897, realizado 103. Hucha prevista 50, aportaciones 20/50/80 descuentan 50/50/80. Aportación histórica 120 no cambia mes actual. Transfer propia 500 neutral.
- Navegación 20 ciclos sin mutación de listas, motor mergeCloudValue real conserva remoto más reciente y local ante remoto vacío; diez merges con tombstone no reviven registro.
- A/B: cuatro aperturas, namespace y recarga local de app reales bajo JSDOM; B nuevo a cero y A/B no cruzan fixture.
- Catálogos de Supabase revisados sin leer registros personales. RLS/grants/políticas/function definitions comprobados.
- PUBLICACIÓN: ocho URLs con hash idéntico y smoke de iconos en logs. No confundir con sesión autenticada Safari.

**No verificado:** JWT reales A/B, dos dispositivos, latencia proveedor/PSD2, sesiones concurrentes reales, entrega única de push, iOS/VoiceOver, PWA física, XSS/seguridad integral. Banco fixture ejecuta funciones de importación auténticas con proveedor/clasificador/UI simulados; no es test bancario end-to-end. Las pruebas no garantizan ausencia universal de fallos.

Reproducción: npm ci --prefix auditorias/qa-v97.66; node auditorias/qa-v97.66/verify-baseline.cjs; npm --prefix auditorias/qa-v97.66 test; node auditorias/qa-v97.69/regression-lab.cjs; node AUDITORIA_ELITE/build-candidate.cjs; node AUDITORIA_ELITE/bank-regression.cjs AUDITORIA_ELITE/candidate/v97.70.html; añadir --extended reproduce el bloqueo; node AUDITORIA_ELITE/financial-regression.cjs; node AUDITORIA_ELITE/profile-regression.cjs; node AUDITORIA_ELITE/benchmark.cjs; python3 AUDITORIA_ELITE/smoke-pages.py.

# Informe de pruebas · v2.0.27-LAB

Fecha: 16/10/2026. Entorno local Node.js 24.19.0. Los tests financieros usan fixtures sintéticas.

| Suite | Resultado |
|---|---:|
| Control nuevo de corte, mes y abortado de CLI | 10/10 |
| Conciliación v2.0.25 | 99/99 |
| Integración v2.0.26 | 11/11 |
| QA offline listado en `.github/workflows/fluxia-elite-espejo-qa.yml` | Correcto localmente |
| Sintaxis de CLI y guard | Correcta |
| Verificación de base estable v97.66 | Pasa: 6 archivos inmutables |
| `npm test` de QA legacy v97.66 | Bloqueado: falta dependencia local `acorn`; no se instalaron dependencias |

No se ejecutó GitHub Actions remoto. No se probaron Supabase/RLS en vivo, movimientos bancarios reales, Safari/iOS ni PWA instalada. La suite no certifica los datos personales del usuario.

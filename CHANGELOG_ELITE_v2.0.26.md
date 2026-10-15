# Fluxia Élite BETA v2.0.26 (LAB) · 16/10/2026
Base: `pages-v9731-real-final` @ 6394e5c → `lab/elite-v2.0.25-conciliacion-auditada` @ 459788e → rama `lab/elite-v2.0.26-sonnet`.

| Problema demostrado | Corrección | Test | Resultado |
|---|---|---|---|
| Ingreso «cobrado» con fecha posterior al corte se contaba como cobrado | No se cuenta; incidencia `COBRO_CON_FECHA_POSTERIOR_AL_CORTE` por ID; bloquea criterio [f]. Con ID bancario del proveedor sí cuenta | `corte` ×3 | OK |
| Aportación/rescate/reposición fechados tras el corte pasaban sin aviso | Incidencia `OPERACION_POSTERIOR_AL_CORTE` por ID (la regla mensual del HTML no cambia); bloquea [f] | `corte` | OK |
| Certificado memoizado devolvía datos viejos si cambiaban registros sin cambiar el total (hasta 1 min) | La clave de memo incluye firma FNV-1a del contenido de las fuentes | `corte` memoización | OK |
| Versión ligada a literal en la suite de v2.0.25 | Comprobación coherente con `ELITE_SAFARI_VERSION` + snapshot idéntico | `entrega` | OK |
| Faltaban pruebas de reinicio, usuario nuevo, enlace banco↔fijo, secretos | Suite `elite-integration-v2026.cjs` (11) | `persistencia`, `banco`, `seguridad` | OK |

Integración: contiene todo v2.0.25 (motor `fluxia-elite-reconciliation-v1.js`, libro mayor, certificado, CLI privada `lab/tools/elite-reconcile-cli.cjs`, pruebas). `index.html`, `lab/index.html`, SW, manifest y `lab/v97.*` **idénticos** a `pages-v9731-real-final` (diff vacío). Sin escrituras a Supabase.
No se corrigió ninguna discrepancia tocando datos: las incidencias se listan por ID y causa.

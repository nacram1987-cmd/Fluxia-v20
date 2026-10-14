# Fluxia Élite · auditoría crítica v1.9.96

Fecha: 15/10/2026 · rama: `pages-v9731-real-final`

## Veredicto ejecutivo

La aplicación Élite es una capa de lectura y preconciliación sobre Supabase con navegación y trazabilidad avanzadas. No está certificada todavía como sustituto contable del HTML madre ni como aplicación bancaria de producción. La PWA estable no se ha modificado.

La captura revisada mostraba v1.9.94 y un encabezado desalineado. La causa no era solo CSS: el `title` y el metadato de versión del HTML permanecían en v1.9.88, mientras el runtime pintaba otra versión. v1.9.96 sincroniza esas tres fuentes y conserva el bloque de marca centrado.

## Hallazgos P0

| ID | Hallazgo | Evidencia | Estado |
|---|---|---|---|
| P0-01 | Paridad HTML → Élite no certificada al céntimo | El contrato exige mismo usuario, perfil, corte, IDs, estados y movimientos; no existe snapshot operativo actual adjunto | Bloquea promoción y escrituras |
| P0-02 | Seguridad de Supabase no certificada | Advisors registrados: siete tablas con RLS sin políticas; RPC `accept_invitation` SECURITY DEFINER; funciones con `search_path` mutable | Migración reversible pendiente |
| P0-03 | Bancos en lectura/preflight, no activación contable | El adaptador conserva la bandeja temporal; conflictos y candidatos fijo/variable no escriben el libro | Seguro por defecto, no productivo |
| P0-04 | Disponible bloqueado si faltan fuentes | El runtime muestra bloqueo hasta cerrar HTML, bancos, huchas y motor | Correcto; no debe relajarse |

## Hallazgos P1

| ID | Hallazgo | Riesgo | Próxima acción |
|---|---|---|---|
| P1-01 | Refresh token persistido en `localStorage` cuando el usuario elige mantener sesión | Exposición ante XSS o dispositivo compartido | Migrar a almacenamiento de sesión seguro y política explícita de dispositivo |
| P1-02 | Passkey local-only | No es autenticación WebAuthn verificable por servidor | Registrar challenge/credential en backend antes de llamarlo Face ID de cuenta |
| P1-03 | Decisiones bancarias fijo/variable y conflictos son locales | No se recuperan automáticamente en otro dispositivo | Persistir como decisiones auditadas tras RLS y paridad |
| P1-04 | HTML monolítico de aproximadamente 277 KB con lógica inline | Dificulta CSP estricta, revisión, carga y pruebas de módulos | Extraer shell, sesión, motor, bancos y render en módulos versionados |
| P1-05 | Pages puede servir una revisión anterior | La captura mostraba v1.9.94 aunque la rama contenía una versión posterior | Verificar bytes HTTP reales y caché; no confundir commit con despliegue |

## Seguridad revisada

- No se encontró `service_role` en el cliente.
- La clave publishable de Supabase es visible, como corresponde a un cliente público; la protección real debe estar en Auth/RLS/Edge.
- Las peticiones privadas incluyen bearer de sesión y `credentials: omit`.
- No hay una CSP estricta compatible con el HTML inline actual.
- La recuperación de contraseña no revela si el correo existe.
- El conector bancario usa el Edge Function original y no crea una segunda conexión.
- No se han realizado escrituras financieras reales durante esta auditoría.

## QA ejecutada

- Snapshot protegido v97.66 verificado: 6 archivos inmutables y commit `b1d53c08fa0cc99356ab5f3f54e5e45b694f1a4c`.
- Regresión permanente v97.66: superada después de instalar sus dependencias (`parsedScripts=168`, 20 ciclos de menú, 400 variables sintéticas, invariantes contables sin errores).
- Regresiones Élite recientes: cabecera, sesión, passkey, preflight bancario, conciliación, huchas sin ID, reimportación, conflictos y fijo/variable superadas.
- Auditoría total de `lab/qa`: 27 pruebas superadas y 44 no certificadas. La mayoría son assertions históricas de versión o harnesses incompletos; no se maquillan como verdes. Las fallas reales de entorno/harness quedan abiertas para consolidación.

## Bloqueos que no se deben ocultar

No se puede afirmar todavía aislamiento comercial completo, sincronización bancaria productiva, paridad total, rendimiento Safari/iPhone físico ni promoción a ESTABLE. La solución correcta es cerrar cada puerta con cuentas sintéticas, snapshot real del HTML y pruebas de dos perfiles/usuarios antes de habilitar escrituras.


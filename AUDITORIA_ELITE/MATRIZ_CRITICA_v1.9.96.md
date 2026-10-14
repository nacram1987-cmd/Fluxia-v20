# Matriz crítica de ejecución · v1.9.96

| Prioridad | Frente | Criterio de cierre | Evidencia actual | Acción siguiente |
|---|---|---|---|---|
| P0 | Integridad contable | Comparación HTML/Élite por ID y céntimos, cero diferencias | No certificada: falta snapshot operativo actual | Capturar mismo perfil/mes/corte y ejecutar comparador |
| P0 | Aislamiento | Dos usuarios y perfiles no cruzan filas, backups ni decisiones | RLS base observado; tablas sin políticas documentadas | Dry-run SQL, cuentas sintéticas y rollback |
| P0 | Bancos | Relectura idempotente, tombstones, 1 aviso, sin resurrección | Preflight y bandeja temporal; 84 conflictos observados en corte previo | Resolver conflictos explícitamente antes de escribir |
| P0 | Disponible | Una fórmula única y trazable | Bloqueado si falta fuente; no inventa cifra | Certificar motor contra HTML |
| P1 | Sesión | Revocación, renovación y almacenamiento seguro | Refresh token en localStorage | Diseñar migración de sesión sin perder continuidad |
| P1 | Publicación | Bytes Pages = commit anunciado | GitHub verificado; HTTP Pages pendiente en esta auditoría | Smoke HTTP desde entorno con acceso |
| P1 | QA | Suite reciente verde y antigua clasificada | 27 verdes / 44 no certificadas | Separar pruebas históricas, reparar harnesses y conservar assertions |
| P1 | Arquitectura | Shell y dominios financieros en módulos auditables | 277 KB inline + 7 módulos | Extraer por dominio sin cambiar semántica |
| P2 | UX | Header, tabs y tarjetas coherentes en auth/autenticado | v1.9.96 corrige coherencia de build y header | Revisar visualmente en Safari físico |
| P2 | Rendimiento | No regresión frente v97.66/v97.68 | Baseline protegida; Safari físico no medido | Benchmark frío/caliente comparable |

## Regla de promoción

Mientras haya un P0 abierto, Élite solo puede ofrecer lectura, auditoría y preflight. ESTABLE y sus workers/manifiestos permanecen intactos.


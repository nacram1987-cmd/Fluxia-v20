# Incidencias y puertas de aceptación

| ID | Nivel | Impacto/frecuencia | Reproducción/causa | Estado/acción | Esfuerzo/dependencia | Rollback/riesgo |
|---|---|---|---|---|---|---|
| PUB-01 | P0 | LAB inexistente, siempre | v97.69 404, blob solo main | Corregido db7790f; Pages success y bytes HTTP | Bajo | Revertir adición v69, raíz idéntica |
| PUB-02 | P0 | Despliegue no reproducible | POST builds 403, QA no despliega | Workflow Pages OIDC y smoke añadidos; estado ejecución en REPORTE_DESPLIEGUE | Medio/permisos Actions | Revertir workflow; fuente original intacta |
| BANK-01 | P0 | Gasto omitido/saldo inflado, mismo importe/día | yaDup acepta cualquier origen banco | Corregido solo candidato; tests rojo→verde | Bajo | Regenerar desde v69; sin datos reales cambiados |
| BANK-02 | P0 | Enlace manual/pending erróneo | Solo importe/fecha | Corregido solo candidato; comercio/banco/cuenta/único | Bajo | Candidato bloqueado hasta completar BANK-03 |
| BANK-03 | P0 | ID compartido oculta otro pago | mismo ID bruto dos bancos, prueba roja | ABIERTO, bloquea nueva LAB | Alto/backend y migración reversible | Prohibido renumerar sin dry-run |
| SEC-01 | P0 | Acceso contactos ajenos potencial | RLS desactivado y SELECT grants | SQL preparado NO aplicado | Medio/aprobación producción | Backup DDL; ningún dato leído/borrado |
| SEC-02 | P0 | RPC sin destinatario autenticado | SECURITY DEFINER, anon EXECUTE, éxito sin UPDATE | SQL preparado NO aplicado | Medio/aprobación producción | Restaurar definición/grants capturados |
| CLOUD-01 | P0 | Conflictos de edición/resurrección | Merge y tombstones probados sintéticamente | Parcial: reimportación, remoto vacío/revisión nueva pasan | Alto/tests JWT A-B/offline | No afirmar garantía nube completa |
| USER-01 | P0 | Cruce cuentas | A/B con almacenamiento local real de app | Pasa alternancia/reload local; API no verificada | Medio/cuentas sintéticas | Sin usuarios nuevos en producción |
| NOTIF-01 | P0 | Avisos repetidos | evento + toast + push | ABIERTO, falta test de entrega física | Medio/dispositivo | No sacrificar cargo para borrar aviso |
| PERF-01 | P1 | Inicio y gestos | 10 repeticiones/200 gestos en JSDOM | Medido, iOS pendiente | Medio/iPhone | No promover si hay regresión |
| PWA-01 | P1 | Versión instalada/rutas | root/worker/manifest bytes verificados | Stable intacta; instalación física pendiente | Medio/iPhone | No reinstalar ni borrar caché financiera |
| CODE-01 | P2 | Deuda/perfilado | 168 scripts y 1,9 MB | Inventariado, sin refactor masivo | Alto/incremental | Una causa y test por cambio |

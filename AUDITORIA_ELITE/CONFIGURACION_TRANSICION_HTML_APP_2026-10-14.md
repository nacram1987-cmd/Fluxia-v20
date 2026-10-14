# FLUXIA ÉLITE — CONFIGURACIÓN DE TRANSICIÓN HTML → APP
Fecha: 2026-10-14. Estado: configuración de desarrollo, NO migración ejecutada.
Fuente normativa: PROMPT_MAESTRO.md, AGENTS.md y AUDITORIA_ELITE/CONTRATO_PARIDAD_HTML_MADRE_2026-10-14.md.

## Canales y control de versiones
- HTML ESTABLE: `https://nacram1987-cmd.github.io/Fluxia-v20/`. No editar `index.html`, manifest ni service worker estable; promoción exclusivamente con orden «con labora» y QA aprobada.
- Élite Safari LAB: `https://nacram1987-cmd.github.io/Fluxia-v20/lab/fluxia-elite-safari-datos-reales.html`. Versión HTML detectada: v1.9.11; no incrementarla sin modificación funcional comprobada.
- Rama: `pages-v9731-real-final`. Evitar commits a `main` por error. Guardar rollback y SHAs.
- Entrega de cada versión de app: código, ZIP completo, manifest de versión, SHA, URL LAB y ESTABLE, pruebas ejecutadas y pendientes, puntuación honesta /100. La publicación debe comprobarse por HTTP y Safari/PWA, no solo por commit.

## Fases de conversión — puertas obligatorias
1. **Inventario HTML:** extraer completo el HTML operativo y funciones financieras, estados, scripts, banco, rutas y assets; documentar dependencias y paridad de UI. Nunca usar la exportación CSV como libro mayor.
2. **Snapshot de lectura simultáneo:** HTML y Élite del mismo `user_id`, `profile_id`, `accounting_month`, `captured_at`; incluir por movimiento los campos de `lab/qa/elite-snapshot-parity.cjs`. Evitar exportar contraseñas, tokens, claves de bancos y secretos. Los snapshots contienen datos financieros sensibles: mantenerlos privados, nunca commitearlos a repositorio público ni incrustarlos en ZIP público.
3. **Conciliación:** ejecutar `node lab/qa/elite-snapshot-parity.cjs html.json elite.json`. Resultado PASS solo con cero faltantes, sobrantes, duplicados, diferencias de campos y céntimos; la igualdad de totales sola NO basta. Octubre 2026 requiere resolver 51 variables HTML vs 52 CSV y verificar el cargo de 7,50 € del 14/10 sin crearlo sintéticamente.
4. **Motor compartido:** usar cálculo original del Disponible y módulos: ingresos, variables, fijos, huchas, compartidos, financiaciones, efectivo, bancos, notificaciones, papelera, presupuestos y simulaciones. Aportaciones previstas no reducen Disponible hasta exceso; rescates y retroactivos en mes contable real; nunca doble cargo fijo/variable ni doble efectivo/banco.
5. **Persistencia real:** Supabase con aislamiento RLS por usuario/perfil; migraciones aditivas y reversibles, identidad bancaria estable, importación idempotente, archivado/tombstones, no resurrección. Nunca sustituir datos válidos por respuesta vacía; nuevo usuario comienza en cero, pero usuario existente recupera nube completa. No activar escrituras Élite sin paridad y pruebas de dos usuarios.
6. **Experiencia Élite:** conservar diseño del HTML original con evolución navy/dorado, vista clara premium, cabecera compacta, selector mensual coherente, tarjetas compactas, efectivo y todas las operaciones. No crear demo en sustitución de app.
7. **Pruebas:** QA financiera y bancaria, RLS, recuperación tras logout/login, cambio de dispositivo, PWA sin reinstalación, caché LAB separada, rendimiento contra v97.66/v97.68, iPhone Safari. No declarar pruebas no realizadas.
8. **Publicación gradual:** primero LAB independiente con datos reales en solo lectura, después operaciones por módulo tras QA, por último aprobación explícita de promoción. Mantener ESTABLE separada en todo momento.

## Criterio de bloqueo P0 actual
El análisis histórico del 14/10 no consiguió reproducir desde nube los 51 movimientos variables visibles en HTML. Hasta resolverlo, Élite no es reemplazo financiero autorizado; se permiten desarrollo de interfaz, inspección y tests de solo lectura.

## Semáforo de versión
- Versión visual actual: v1.9.11.
- Herramienta de paridad: `lab/qa/elite-snapshot-parity.cjs` (guardada en rama).
- Snapshot real comparado: NO.
- Integridad de 51/51: NO CERTIFICADA.
- Escrituras bancarias/contables Élite: BLOQUEADAS.
- Nueva release LAB/PWA: NO PUBLICADA.

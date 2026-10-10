# Fluxia: contrato obligatorio para futuros cambios

## Base aceptada por el usuario

Fluxia v97.66 es la base vigente desde el 11/10/2026 (Atlantic/Canary). La orden del usuario es conservar esta base y no retroceder en rendimiento. Leer `PROMPT_MAESTRO.md` y `BASE_RENDIMIENTO_v97.66.md` antes de modificar la app.

- Partir de la rama efectiva de Pages, nunca de un HTML histórico ni de main sin comparar. Conservar intacta `baseline-v97.66-performance`, commit `b1d53c08fa0cc99356ab5f3f54e5e45b694f1a4c` y los archivos versionados v97.66.
- No reintroducir Disponible en Variables, animaciones globales de arranque, listeners duplicados, renderizados ocultos de clasificación/Ingresos ni consultas bancarias repetidas en la ruta crítica.
- Mantener navegación canónica, reutilización por firma completa y perfil, invalidación por ediciones/storage, tareas cancelables, selector mensual único y shell PWA con cachés raíz/LAB separadas.
- Preservar las mejoras bancarias confirmadas por el usuario. No cambiar por rendimiento conexión, conciliación, clasificación, rechazos, persistencia, outbox, autenticación o cálculos financieros.
- Antes de publicar: ejecutar `node auditorias/qa-v97.66/verify-baseline.cjs` y, desde `auditorias/qa-v97.66`, instalar sus dependencias y ejecutar `npm test`. No retirar assertions para obtener un resultado verde. Adaptar la comparación de código únicamente cuando el cambio explícito lo requiera, conservando todos los invariantes funcionales.
- Comparar rendimiento de v97.66 y candidato en el mismo entorno, datos/perfil, dispositivo y estado frío/caliente: primer gesto, menú/logo, Variables y Bancos. Documentar varias repeticiones, mediana, tareas largas y número de renderizados/consultas. Si aparece una regresión reproducible, corregir el candidato antes de promocionarlo; conservar la base desplegada.
- No declarar tiempos iPhone ni garantía absoluta sin medirlos. Chrome/JSDOM no certifican Safari/PWA. La aceptación de esta base por el usuario no convierte limitaciones anteriores en pruebas superadas.
- Entregar siempre URLs verificadas, ZIP completo, PROMPT actualizado, pruebas y evaluación honesta. No borrar datos ni exigir reinstalación para actualizar.

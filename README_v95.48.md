# Fluxia v95.48-LAB

Base de desarrollo: v95.44 forense + capa visual aprobada heredada de v95.47. Estable protegida: v95.39.

## Checklist de esta versión
- [x] Recuperación de cuenta cloud por bloque, no todo-o-nada. IMPLEMENTADO / PROBADO en simulación.
- [x] Ingresos ausentes: se recuperan solo si el bloque actual está vacío y la misma cuenta tiene legacy no vacío. IMPLEMENTADO.
- [x] Variables (`v2_movimientos`) ausentes: misma regla. IMPLEMENTADO.
- [x] Gastos fijos existentes no se pisan; ausentes se recuperan. IMPLEMENTADO.
- [x] Huchas/Usos/Financiaciones/Compartidos se validan independientemente. IMPLEMENTADO.
- [x] Nunca `longest-list-wins`. PROBADO.
- [x] Nunca se leen namespaces `profile:*` ajenos. PROBADO.
- [x] Readback Supabase por cada bloque copiado. IMPLEMENTADO.
- [x] Escrituras vacías pendientes de migraciones rotas se descartan solo para las claves a reparar. IMPLEMENTADO.
- [x] Diseño premium Dashboard/Gastos fijos conservado.
- [x] HTML/manifest/SW/canal coherentes con v95.48.
- [x] `index.html` estable v95.39 no modificado.

## Prueba crítica
Abrir el mismo perfil autenticado y comprobar que Ingresos, Fijos, Variables, Huchas y Financiaciones aparecen simultáneamente. Cambiar de pestaña, cerrar/reabrir y confirmar que ningún bloque desaparece.

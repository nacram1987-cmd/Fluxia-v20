# Fluxia v95.43 BETA

**ESTABLE protegida:** v95.39 (`index.html`)  
**LAB:** v95.43 (`index_fluxia_v95.43_LAB.html`)

## ✅ Checklist de cambios v95.43
- [x] **Aislamiento físico desde el alta:** un usuario nuevo recibe un namespace financiero vacío antes de cualquier reload o sincronización.
- [x] **Cero real:** un usuario nuevo sin credenciales no muestra Huchas, pagos, ingresos, fijos, variables, financiaciones ni compartidos de otro perfil.
- [x] **Backup por identidad:** «Restaurar copia interna» solo puede usar la copia exacta del perfil activo y nunca se ofrece a un usuario nuevo.
- [x] **Pago de Agua no resucita:** retirado el restaurador hard-coded v95.41.
- [x] **Rebase histórico no automático:** la reconstrucción canónica v95.38 queda disponible solo para recuperación manual auditada.
- [x] **Borrados respetados:** cambiar de index/versión no puede volver a crear un pago histórico eliminado.
- [x] **Contexto superior alineado:** saludo, versión y estados usan una rejilla estable sin solapes.
- [x] **Selector con fecha:** el Dashboard muestra mes + día/mes del mes en curso.
- [x] **Identidad visual preservada:** BETA oro, tipografía Fluxia e iconos de menú coherentes.
- [x] **README = Checklist:** esta lista coincide con Ayuda → Checklist v95.43.

## Pruebas obligatorias
1. Crear segundo usuario sin credenciales: todo a 0 y **sin tarjetas de Huchas heredadas**.
2. En ese usuario no aparece ninguna recuperación interna perteneciente a otro perfil.
3. En el usuario principal, borrar/convertir el pago de Agua, cambiar de index y volver: no reaparece.
4. Borrar una aportación, sincronizar, cerrar y abrir: no reaparece.
5. Editar un Ingreso, sincronizar, cerrar y abrir: conserva exactamente la edición.
6. Revisar la cabecera a 390 px y 430 px: cero solapes.
7. Verificar selector del Dashboard: mes + fecha en curso.

## GitHub
Descomprimir el ZIP y subir/reemplazar **TODO** su contenido en la raíz de `Fluxia-v20`.

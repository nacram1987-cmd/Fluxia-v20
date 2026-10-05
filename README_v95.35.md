# Fluxia v95.35 LAB
Subir/reemplazar TODO el contenido del ZIP en la raíz de GitHub Fluxia-v20, conservando la estructura. Abrir LAB v95.35. ESTABLE permanece v95.25 sin cambios.

Borrados explícitos: marca persistente y snapshot del registro; una copia antigua, importación o timestamp posterior no revoca el borrado. Las marcas y decisiones se fusionan antes de los registros al abrir. La restauración explícita tiene su propio registro; recuperar no depende de borrar una marca que un móvil antiguo pudiera volver a traer.

Corregidas rutas sin marca: gasto variable (manual y banco), hucha completa y aportación desde historial. Los usos/cargos de hucha ya registran marca y ahora esta prevalece aunque una copia obsoleta obtenga timestamp nuevo. Filtro previo a render y guardado; sin comparación aproximada de IDs que pueda ocultar otro gasto manual.

No reconstruye el histórico, no concilia saldos ni genera aportaciones. No modifica diseño. Los borrados previos identificables por su registro de decisiones siguen filtrándose. Un dato eliminado anteriormente sin rastro no puede inferirse.

Pruebas: node pruebas_borrado.cjs; node pruebas_edicion.cjs; node pruebas_integridad.cjs.
Validación con motor real aislado y simulación de nube/almacenamiento. No hay sesión autenticada de Supabase para comprobar los datos de la cuenta del usuario; no se afirma haber modificado su nube.

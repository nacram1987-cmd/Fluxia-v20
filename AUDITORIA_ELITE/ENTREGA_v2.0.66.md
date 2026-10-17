# Élite v2.0.66 — interiores HTML, controles Élite

Solicitud 17/10/2026: conservar botones y navegación de Élite, reproducir interiores del HTML madre en todas las pestañas.

## Cambios ejecutables
- Superficies, bordes, sombras, densidad de filas y cifras de resúmenes tomados del HTML operativo `lab/index.html`: #FFFEFB, #E2E7E2 y sombras de tarjeta vigentes.
- Fijos/Financiaciones: tarjeta compacta, icono, concepto, compromiso/cuota, fecha original, importe y estado. El botón Élite abre el detalle original. Las dos fuentes (HTML privado y nube) mantienen sus rutas independientes.
- Huchas: azul #327AA3 pendiente, oro #B8860B al día; icono 48 px, saldo con tipografía del sistema, cifra mensual y barra. La copia HTML también usa estas tarjetas y su detalle privado; auditoría desplegable.
- Resto de pestañas: superficies y filas comunes alineadas visualmente; no se sustituye la estructura específica de cada módulo ni se afirma paridad visual completa.
- Cabecera, menú, pestañas inferiores y estilos de botones Élite preservados. Reglas financieras, fuentes, datos, sincronización, sesión y motor sin cambios.

## Dónde probar
1. Fijos y Financiaciones: estados e importes del mes; abrir «Ver detalle».
2. Huchas: al día / pendiente / no verificable; abrir tarjeta y desplegar aportaciones.
3. Si existe copia HTML: cambiar de fuente y comprobar que el detalle pertenece a esa fuente.
4. Variables, Ingresos, Compartidos, Efectivo y Bancos: revisar densidad, superficies y navegación.
5. iPhone: comprobar 320–430 px, nombres largos y desplazamiento. Revisión física pendiente: no hay sesión del usuario en el navegador de prueba.

## Validación
- Baseline v97.66: 6 artefactos inmutables verificados; npm test (regresión y rescates) aprobado.
- Regresiones de conciliación, efectivo, banco, huchas, interacción, encabezado y release guard aprobadas localmente.
- Nuevo ensayo DOM: importes, estados pagado/pendiente/desconocido, acción de detalle y no mutación de registros para Fijos/Financiaciones.
- Única adaptación de prueba anterior: versión esperada 2.0.65 → 2.0.66; se conservan sus assertions de no escritura bancaria.
- Pipeline existente mantiene QA integral, benchmark y despliegue; publicar no equivale a certificar sincronización bancaria o Safari físico.

## Limitaciones
Sin datos autenticados actuales no se certifican paridad contable real, estado de CaixaBank/Revolut ni aspecto final con todos los registros del usuario. Continúan las limitaciones bancarias anteriores (bandeja local y decisiones de sesión). No se modifica HTML/PWA estable. No se asigna una nota global /100 sin validación real.

## Rollback
Copia anterior: lab/versions/fluxia-elite-safari-v2.0.65.html. Para revertir entrada LAB usar sus bytes desde el commit 2e960f86dbe91f2d923220ae9418e88d71f6fc83; los datos no requieren reversión.

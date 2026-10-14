# Fluxia Élite BETA · Historial Safari (independiente de PWA HTML y SwiftUI)
Fecha: 2026-10-14

## v1.2.0 · Logos comerciales y checklist navegable (14/10/2026)
- Dónde comprobar: entrar en cualquier módulo, consultar cargos visibles de comercios reconocibles. Prioridad: logotipo comercial vía búsqueda pública (Wikidata, identificador P154). Si no existe o falla, icono genérico por concepto. Logos Apple/Amazon reconocidos previamente.
- Dónde comprobar: Inicio → 📋 Checklist y versiones. Checklist con secciones, comprobaciones visuales y explicación de cada nueva función.
- Velocidad: lazy lookup mediante IntersectionObserver, máximo dos búsquedas simultáneas, resultados deduplicados y cacheados en memoria por nombre de comercio. Sin nuevas librerías.
- Privacidad: se transmite al buscador solo nombre de comercio sanitizado; se excluyen conceptos típicamente sensibles como transferencias, IBAN, nómina. Las búsquedas son a terceros y requieren internet.
- Datos: NO se modifican importes, fechas, cargos, cuentas o estados. No se activa persistencia de ediciones.
- Copia inmutable: https://nacram1987-cmd.github.io/Fluxia-v20/lab/versions/fluxia-elite-safari-v1.2.0.html
- QA local en código: sintaxis JS válida y comprobación estructural de activación de búsqueda en red, caché y checklist. NO medido todavía en Safari real. La publicación de Pages no está verificada externamente.
- Pendiente: catálogo completo de logos comerciales originales HTML, autorización/licencia de uso según proveedor y origen, motor financiero, escrituras persistentes, benchmark Safari y errores reales de red.

## v1.1.0 · Corrección CRÍTICA de carga real (14/10/2026)
- Hallazgo contrastado con esquema y consulta SQL de sólo lectura: 762 filas de nube, 1 cuenta autenticada; las colecciones canónicas se almacenan con la forma `p_usr-<perfil>__planRescate_v2_<módulo>`, no con los nombres sin prefijo que usaba v1.0.0.
- Se identificó 1 perfil canónico completo con seis colecciones: movimientos 323, ingresos 41, fijos 98, provisiones 7, financiaciones 8 y compartidos 12 en el instante del análisis. Las cantidades son instantáneas y sólo confirman forma de los datos, no balance.
- El cliente detecta prefijos sólo entre claves pertenecientes a la cuenta autenticada, selecciona sin mezclar perfiles y lee las seis colecciones exactas. Si faltan datos, indica error; nunca sustituye por arrays vacíos.
- Recuperación del logo Apple local cacheable y logo Amazon con carga diferida; iconografía semántica con ⚡ para luz y 💰 en lugar de animales decorativos. Si falta un logo, se usa símbolo genérico.
- Dashboard y módulos existentes pasan a poder mostrar los registros reales de la nube: fechas, importes de origen, últimos movimientos. No hay agregados contables hasta reconciliar.
- Copia congelada: https://nacram1987-cmd.github.io/Fluxia-v20/lab/versions/fluxia-elite-safari-v1.1.0.html
- Comprobado: JavaScript parseable, referencia de marca, separación por prefijo, lectura en modo solo consulta, sin métodos PATCH/PUT/DELETE en cliente.
- Sin certificar: descarga pública GitHub Pages, login de usuario y experiencia Safari real, tiempos en dispositivo, paridad contable y persistencia de edición.

## v1.0.0 · Primera versión formal
- Dashboard con conteo de registros reales y número de colecciones obtenidas de Supabase Auth con control de usuario.
- Tarjetas por módulo con último registro que tenga fecha exacta parseable, importe original sin sumarlo como subtotal contable.
- Sección de hasta ocho registros recientes entre módulos, ordenados por fechas efectivamente presentes y con acceso al detalle.
- Versión visible en cabecera, dashboard y diálogo de historial.
- Preservación de copia versionada y copia anterior al sistema de versionado.
- Cero modificaciones a datos de producción, cero cifras inventadas de Disponible.

Entradas:
- LAB actual: https://nacram1987-cmd.github.io/Fluxia-v20/lab/fluxia-elite-safari-datos-reales.html
- Copia v1.0.0: https://nacram1987-cmd.github.io/Fluxia-v20/lab/versions/fluxia-elite-safari-v1.0.0.html
- Copia anterior: https://nacram1987-cmd.github.io/Fluxia-v20/lab/versions/fluxia-elite-safari-pre-versionado-20261014.html
- ESTABLE HTML sin cambios: https://nacram1987-cmd.github.io/Fluxia-v20/

## Contrato de numeración y entrega de Élite Safari
1. Todas las nuevas entregas incrementan la versión mostrada en cabecera y dashboard, e incorporan changelog propio.
2. Guardar una copia estática identificada de cada versión antes de modificar de nuevo la LAB.
3. Mantener la URL LAB constante para la última versión y enlazar las copias históricas.
3a. Mostrar siempre la versión en cabecera, dashboard, historial y resumen de cambios, sin prometer que Pages ha desplegado antes de probar la URL.
4. No mezclar numeración de Élite Safari con PWA HTML v97.x ni la de builds SwiftUI.
5. Aceptación requiere HTML y JavaScript válidos, pruebas funcionales en Safari, publicación efectiva comprobada y no regresión de rendimiento. El commit no demuestra esas comprobaciones.
6. No permitir escritura financiera hasta demostrar integridad, separación de usuarios, migraciones y pruebas de reversión.
7. Disponible se mantiene sin importe hasta confirmar paridad contable con HTML.

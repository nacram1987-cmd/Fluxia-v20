# PROMPT MAESTRO FLUXIA · v97.24 · 08/10/2026

> Edición consolidada sobre PROMPT MAESTRO v97.23. Se conservan todas sus reglas; esta versión añade la norma permanente de publicación oficial por GitHub y verificación real del despliegue.

FLUXIA v96.95-LAB · 07/10/2026
Base: index_fluxia_v96.92_LAB.html; continuidad visual desde v96.94-LAB.
Prioridad: instrucciones adjuntas actuales prevalecen sobre normas históricas incompatibles.
Fuente cloud vigente única; prohibida restauración automática de backups. Cada mejora suma; ninguna sacrifica integridad.
Disponible: ingresos - gastos - provisiones previstas - exceso de aportaciones sobre lo previsto. Mantener código de v96.92 sin cambios financieros. Usuarios aislados, nuevos usuarios a 0, histórico y borrados preservados.
ESTABLE histórica v95.25 se conserva; ninguna promoción automática de esta LAB.
Petición explícita v96.95: retirar la pestaña Financiación e integrar su acceso en Gastos fijos; conservar íntegros datos, pagos, edición y cálculos.

FLUXIA · PROMPT DE EJECUCIÓN VISUAL / UX / PWA / BANCOS PRIORIDAD
ABSOLUTA · PROMPT MAESTRO = LEY

OBJETIVO GENERAL

Realizar una evolución visual y de experiencia de usuario de Fluxia
manteniendo INTACTA toda la lógica financiera y funcional ya validada.

El resultado debe sentirse: - Compacto. - Premium. - Limpio. -
Coherente. - Mobile-first. - Rápido. - Visualmente equilibrado. - Fácil
de leer de un vistazo. - Con varias operaciones visibles simultáneamente
en pantalla.

NO se considera terminado simplemente porque compile o se publique. Debe
verse correctamente en un iPhone real.

======================================================================
0. REGLA SUPREMA · BLOQUEO FUNCIONAL
======================================================================

PROMPT MAESTRO = LEY.

La lógica financiera, estructura de datos, Supabase, persistencia,
sincronización cloud, cálculos, Disponible, Huchas, Ingresos, Gastos
Variables, Gastos Fijos, Financiaciones, Compartidos, reconciliación
bancaria y cualquier comportamiento funcional que ya esté validado
quedan BLOQUEADOS.

Una petición visual NO autoriza a modificar lógica.

NO modificar: - fórmulas; - arrays de datos; - filtros; - guardados; -
cargas de Supabase; - reconciliaciones; - reglas contables; -
identificadores; - históricos; - aportaciones; - pagos; - estados; -
fechas; - tombstones; - fuente cloud; - funciones de persistencia; -
mecanismos de recuperación.

Si para realizar alguna mejora fuese absolutamente imprescindible tocar
una parte funcional ya validada: 1. DETENER la ejecución. 2. Explicar
exactamente qué habría que modificar. 3. Explicar por qué. 4. Explicar
el riesgo. 5. Esperar autorización expresa del usuario.

SIN autorización expresa, NO se modifica.

Cada mejora suma. Ninguna mejora sacrifica integridad.

====================================================================== 1.
BASE DE TRABAJO
======================================================================

Usar como autoridad funcional la base donde: - los datos financieros
están correctos; - las Huchas están correctas; - Disponible está
correcto; - Fijos, Variables, Ingresos y Financiaciones existen
correctamente; - Gastos Variables abre rápidamente; - la nube es la
fuente de verdad.

NO utilizar como base funcional una versión posterior que haya provocado
desaparición de Gastos Fijos, alteración de Huchas, cambios de
Disponible, tarjetas rotas, errores de layout o regresiones visuales.

Las últimas versiones visuales fallidas NO son referencia estética.

======================================================================
2. SISTEMA VISUAL GLOBAL ÚNICO
======================================================================

Fluxia debe utilizar un DESIGN SYSTEM global. No diseñar cada pestaña de
forma independiente.

Crear y utilizar tokens comunes para: TIPOGRAFÍA, ESPACIADO, RADIOS,
SOMBRAS, COLORES, ALTURAS, BOTONES, ICONOS, ESTADOS, TARJETAS, TÍTULOS,
SUBTÍTULOS, IMPORTES y FECHAS.

Una misma función visual debe verse igual en toda la aplicación.

Si un título de tarjeta utiliza un determinado peso en Huchas, el título
equivalente de Fijos, Financiaciones, Variables, Compartidos, etc. debe
seguir la misma jerarquía.

NO mezclar arbitrariamente serif y sans-serif.

La aplicación utilizará UNA familia tipográfica principal. Únicamente el
branding “Fluxia” podrá tener tratamiento especial si realmente mejora
la identidad visual.

======================================================================
3. CABECERA / LOGO SUPERIOR · PRIORIDAD ALTA
======================================================================

La cabecera actual sigue siendo excesivamente grande. Debe rehacerse.

OBJETIVO: [ menú ] [ icono Fluxia + Fluxia + BETA ] [ campana ]

Debe ser horizontal, pequeña, centrada, elegante, alargada,
proporcionada y visualmente ligera.

El logo NO debe parecer una tarjeta gigante. El símbolo Fluxia debe ser
pequeño y proporcionado al nombre. El texto “Fluxia” no debe dominar la
pantalla. BETA debe ser pequeño, discreto y dorado.

Menú y campana: - mismo tamaño; - mismo radio; - misma altura; -
alineación simétrica.

La cabecera completa debe consumir MUCHO MENOS espacio vertical que la
mostrada actualmente.

Referencia orientativa: - símbolo Fluxia: 26–30 px; - wordmark Fluxia:
18–20 px; - menú/campana: 36–40 px.

Los valores son orientativos: manda la proporción visual.

NO usar transform: scale(…) o zoom como solución. Debe funcionar
correctamente con la escala normal de Safari/iOS.

Evitar acumulaciones de reglas !important contradictorias. Localizar
primero la regla fuente que controla el componente.

======================================================================
4. INDICADORES BANCOS / NUBE
======================================================================

Los indicadores “Bancos conectados” y “Guardado en nube” deben reducir
considerablemente su presencia.

Convertirlos en pills pequeñas y discretas. Deben comunicar estado, no
convertirse en tarjetas protagonistas.

Altura pequeña, texto compacto, sin sombras exageradas y sin grandes
márgenes.

======================================================================
5. GASTOS FIJOS Y FINANCIACIONES · MISMO ESTILO EXACTO QUE HUCHAS
======================================================================

REGLA DE DISEÑO OBLIGATORIA.

No hacer una interpretación parecida. Inspeccionar el diseño real de las
tarjetas de Huchas existentes y reutilizar su lenguaje visual.

GASTO / FINANCIACIÓN PENDIENTE: mismo azul suave utilizado en Huchas.

Referencia: #2E7E91 Fondo aproximado: #EDF6F7

GASTO / FINANCIACIÓN PAGADO: ORO.

Referencia: #B58A45 Fondo aproximado: #FBF4E7

PENDIENTE = AZUL. PAGADO = ORO.

NO verde para “Pagado”.

El estado de pago ya existe en la aplicación. La capa visual únicamente
lo representa. NO cambiar cómo se calcula si algo está pagado.

======================================================================
6. TARJETAS DE FIJOS / FINANCIACIONES
======================================================================

Las tarjetas actuales siguen siendo demasiado grandes.

Objetivo: ver VARIOS gastos sin tener que hacer scroll gasto por gasto.

Composición compacta: [icono/logo] Nombre Importe información secundaria
Estado

Debajo, solo si es necesario: [ acción principal ] [ editar ]

Reducir padding, márgenes, separaciones, altura de botones, espacio
muerto y radios excesivos.

Mantener superficie táctil suficiente sin inflar visualmente el
contenedor.

El nombre, importe y estado deben identificarse en menos de un segundo.

======================================================================
7. RESUMEN SUPERIOR DE GASTOS FIJOS
======================================================================

“TOTAL COMPROMISOS DEL MES” no puede ocupar casi una pantalla.

Conservar Total, Gastos Fijos, Financiación, Pendiente/Pagado y barra de
progreso, pero en composición compacta.

Evitar grandes tarjetas anidadas, tipografías enormes, huecos verticales
y bordes exagerados.

======================================================================
8. IDENTIDAD VISUAL DE COMERCIOS
======================================================================

Crear UN único Merchant Resolver para Gastos Variables, Gastos Fijos y
Financiaciones cuando corresponda.

Prioridad: 1. LOGO REAL reconocido. 2. ICONO GENÉRICO SEMÁNTICO. 3.
Icono neutro como último recurso.

Nunca utilizar letras o falsas marcas intentando simular un logo.

======================================================================
9. LOGOS REALES
======================================================================

Cuando la coincidencia sea fiable: Shell → Shell Leroy Merlin → Leroy
Merlin Apple/iCloud → Apple Levi’s → Levi’s Carrefour → Carrefour Amazon
→ Amazon Netflix → Netflix Spotify → Spotify PayPal → PayPal IKEA → IKEA
etc.

Preferencia técnica: guardar activos fiables localmente dentro de Fluxia
en /assets/brands/.

Evitar depender permanentemente de un CDN externo. No inventar un logo
si no existe un activo fiable.

======================================================================
10. ICONOS GENÉRICOS SEMÁNTICOS
======================================================================

Cuando no haya logo real fiable:

Endesa / electricidad / luz → ⚡ Gasolinera / combustible → ⛽ Agua → 💧
Gas → 🔥 Fibra / móvil / internet → 📶 Seguro → 🛡️ Tributos / IBI /
impuestos → 🏛️ Supermercado → 🛒 Hogar / alquiler / hipoteca → 🏠
Transporte → 🚇 Suscripción → ▶️ Financiación / préstamo → 💳

El icono debe describir el gasto. NO mostrar una tarjeta 💳 para una
factura de electricidad.

======================================================================
11. HUCHAS
======================================================================

NO modificar lógica, datos, histórico, aportaciones ni rescates.

Huchas sirven como REFERENCIA VISUAL para color, densidad, estado,
borde, fondo y jerarquía.

Si su diseño funciona, reutilizar su patrón en otros módulos en lugar de
inventar uno nuevo.

======================================================================
12. GASTOS VARIABLES
======================================================================

La apertura rápida conseguida queda BLOQUEADA.

No introducir ninguna modificación que vuelva a provocar congelación al
entrar.

First paint primero. Cálculos secundarios después.

No ejecutar reconciliaciones pesadas, reconstrucciones, blacklist
completa, datalist o estadísticas antes de mostrar la pantalla.

======================================================================
13. BANCOS · INTERFAZ
======================================================================

La pantalla de Bancos debe simplificarse radicalmente.

Mostrar principalmente: - Banco. - Cuenta. - Saldo. - Ocultar/mostrar
saldo. - Última sincronización. - Estado. - Opcionalmente: + Añadir
banco.

Todo lo técnico debe quedar en opciones secundarias.

No mostrar bloques técnicos, información redundante, controles
innecesarios, textos largos ni grandes paneles de sincronización.

======================================================================
14. BANCOS · CERO FLASH / CERO PANTALLA INCORRECTA
======================================================================

INCIDENCIA CONCRETA QUE DEBE CORREGIRSE:

Cuando el usuario YA tiene bancos conectados y pulsa “Bancos
conectados”, Fluxia muestra durante un instante la pantalla/interfaz de
“Conectar bancos” o “Seleccionar banco” y después la sustituye por los
bancos realmente conectados.

ESTE COMPORTAMIENTO NO ES ACEPTABLE.

Aunque dure unas décimas de segundo, se considera un fallo de UX.

Si el usuario ya tiene bancos conectados, Fluxia debe saberlo ANTES de
pintar la pantalla de Bancos.

FLUJO CORRECTO:

Usuario pulsa “Bancos conectados” ↓ Fluxia conoce inmediatamente el
último estado bancario válido ↓ Renderiza directamente los bancos
conectados ↓ Revalida/sincroniza información actualizada en segundo
plano

FLUJO PROHIBIDO:

Usuario pulsa “Bancos conectados” ↓ aparece “Conectar bancos” ↓ aparece
“Seleccionar banco” ↓ espera ↓ se descubren bancos conectados ↓ se
sustituye la pantalla

PROHIBIDO ESTE FLASH.

No utilizar como estado visual inicial banks = [] si todavía no se ha
terminado de recuperar el estado bancario.

Diferenciar obligatoriamente entre: LOADING CONNECTED EMPTY ERROR

LOADING NO significa EMPTY.

Mientras se recupera/revalida la información bancaria: - conservar el
último estado conectado conocido; - o mostrar un skeleton discreto si no
existe estado previo.

NUNCA mostrar “Conectar banco” mientras todavía se está comprobando si
existen bancos conectados.

“Conectar banco” únicamente puede aparecer cuando el sistema haya
confirmado realmente: CONNECTED_BANKS = 0

La información bancaria persistida/cloud debe permitir reconstruir
inmediatamente la pantalla después del login.

La revalidación del proveedor/Open Banking se realiza EN SEGUNDO PLANO y
no debe bloquear ni sustituir innecesariamente el primer render.

OBJETIVO UX:

PULSAR “BANCOS CONECTADOS” ↓ VER INMEDIATAMENTE LOS BANCOS

Sin flash. Sin salto. Sin pantalla equivocada. Sin parpadeo. Sin
“Seleccionar banco”. Sin esperar a una sincronización para pintar la
interfaz.

La navegación debe sentirse instantánea.

======================================================================
15. BANK LIVE · AUTOSINCRONIZACIÓN
======================================================================

Arquitectura objetivo:

BANCO ↓ OPEN BANKING ↓ BACKEND / WEBHOOK ↓ SUPABASE ↓ RECONCILIACIÓN
IDEMPOTENTE ↓ PUSH ↓ FLUXIA

La sincronización debe ocurrir aunque la PWA esté cerrada.

No depender del teléfono para consultar continuamente.

Cuando el proveedor bancario informe de una nueva operación: -
guardarla; - deduplicarla; - clasificarla; - reconciliarla; - actualizar
nube; - generar UNA notificación.

Nunca tres avisos del mismo movimiento.

Al abrir Fluxia, la transacción debe estar ya disponible siempre que el
banco/proveedor la haya comunicado.

======================================================================
16. PWA
======================================================================

Objetivo permanente: NO reinstalar Fluxia para cada versión.

Debe existir UNA instalación.

Flujo esperado: publicar nueva build ↓ service worker detecta
actualización ↓ actualiza assets ↓ Fluxia abre nueva versión

Datos siempre desde nube. La PWA nunca será autoridad financiera.
Cache/localStorage únicamente como soporte temporal.

======================================================================
17. CONSISTENCIA ENTRE TODAS LAS PESTAÑAS
======================================================================

Dashboard, Ingresos, Fijos, Variables, Huchas, Compartidos,
Financiaciones, Bancos, etc. deben parecer partes de LA MISMA
APLICACIÓN.

Misma tipografía, jerarquía, densidad, paleta, radios, sombras, botones,
etiquetas, estados y espaciado.
Las tarjetas principales de las pestañas comparten una altura mínima, padding, radio, borde y sombra; cada módulo conserva su color de acento. El contenido nunca se recorta para forzar una altura idéntica.
Financiación se gestiona dentro de Gastos fijos y no tiene una pestaña independiente; los accesos internos heredados llevan a Gastos fijos.

======================================================================
18. PROHIBIDO
======================================================================

PROHIBIDO: - modificar lógica financiera para arreglar diseño; -
reconstruir Huchas; - recuperar datos desde backups automáticamente; -
hardcodear importes financieros; - cambiar Disponible; - eliminar Fijos
durante un rediseño; - duplicar movimientos; - añadir CSS encima de CSS
indefinidamente; - crear otra escala tipográfica por pestaña; - usar
colores arbitrarios; - cargar de forma bloqueante recursos pesados que no se necesitan en la primera pantalla; - romper rendimiento; - cambiar la nube como fuente
de verdad; - hacer regresiones visuales silenciosas.

======================================================================
19. METODOLOGÍA DE EJECUCIÓN
======================================================================

ANTES de escribir código: 1. Identificar la base funcional válida. 2.
Identificar los selectores CSS reales. 3. Identificar estilos
duplicados/conflictivos. 4. Determinar qué reglas son autoridad. 5.
Diseñar los tokens globales.

DESPUÉS: Aplicar el diseño SIN modificar lógica financiera.

DESPUÉS DEL CAMBIO: Verificar que siguen existiendo exactamente: -
Fijos. - Financiaciones. - Huchas. - Variables. - Ingresos. -
Disponible. - Estados pagado/pendiente. - Histórico.

Si desaparece un solo dato: RECHAZAR LA BUILD.

======================================================================
20. CRITERIO DE ACEPTACIÓN VISUAL
======================================================================

En un iPhone normal, la primera pantalla debe permitir entender
inmediatamente: - qué módulo estoy viendo; - qué mes; - cuánto tengo; -
qué está pendiente; - qué está pagado.

Debe comenzar a mostrar operaciones SIN recorrer enormes bloques.

La cabecera NO debe dominar la pantalla. Un gasto individual NO debe
ocupar una porción desproporcionada del viewport.

Fijos y Financiaciones deben verse como Huchas: PENDIENTE = AZUL PAGADO
= ORO

Ese patrón es obligatorio.

======================================================================
21. CHECKLIST OBLIGATORIO ANTES DE ENTREGAR
======================================================================

NO entregar la nueva versión hasta comprobar:

□ Cabecera Fluxia realmente pequeña, horizontal y proporcionada. □ Logo
Fluxia discreto y correctamente centrado. □ Menú y campana simétricos. □
Indicadores “Bancos conectados” y “Guardado en nube” compactos. □ Una
única familia y jerarquía tipográfica coherente. □ Gastos Fijos
compactos. □ Financiaciones compactas dentro de Gastos fijos, sin pestaña independiente. □ Fijos y Financiaciones utilizan
REALMENTE el patrón de Huchas. □ Pendiente = AZUL. □ Pagado = ORO. □ Se
visualizan varios gastos simultáneamente. □ Logos reales aparecen cuando
la marca se reconoce de forma fiable. □ Cuando no existe logo fiable
aparece el icono genérico correspondiente. □ Endesa/electricidad muestra
⚡ y NO 💳. □ Gastos Variables continúa abriendo inmediatamente. □ Al
pulsar “Bancos conectados” NO aparece ni durante unas décimas de segundo
“Conectar bancos” o “Seleccionar banco”. □ Si existen bancos conectados,
se muestran directamente. □ Bancos está limpio, sencillo y sin
información innecesaria. □ No existen notificaciones bancarias
duplicadas. □ Ninguna modificación visual ha alterado lógica financiera.
□ Disponible continúa siendo correcto. □ Huchas continúan intactas. □
Fijos y Financiaciones continúan intactos. □ Persistencia cloud continúa
funcionando. □ No existen duplicaciones ni resurrecciones.

======================================================================
RESULTADO ESPERADO
======================================================================

Fluxia debe sentirse como una aplicación financiera premium terminada,
no como una web con tarjetas grandes.

Compacta. Coherente. Rápida. Elegante. Predecible. Visualmente ordenada.

Y, por encima de todo:

LOS DATOS Y LA LÓGICA FINANCIERA VALIDADA NO SE TOCAN.


ESTADO v96.95: tarjetas principales con geometría común y acentos propios; financiación accesible desde Gastos fijos; carga diferida del script de gráficos para no bloquear el parseo inicial. El panel y modelo heredados de financiación siguen presentes sin acceso independiente. Sin cambios de lógica financiera, datos o nube. No se certifica el checklist completo: pendiente prueba iPhone físico, datos cloud reales, push único, webhooks y actualización permanente PWA. Bank Live requiere autorización explícita de cambio funcional conforme al apartado 0.



## PROMPT MAESTRO · ADENDA v97.23-LAB · 08/10/2026

- Mantener la estructura visual aprobada: selector de mes único, alineado y fijo debajo de la cabecera en todas las pestañas; cabeceras y tarjetas con jerarquía común. No reconstruir los módulos ni alterar datos al corregir diseño.
- Dinero en mano es el único listado de movimientos de cartera. Los pagos `origen:'efectivo'` se conservan en el registro contable para que afecten una vez al Disponible, pero no aparecen en el listado ni CSV de Gastos variables. No borrar ni duplicar los movimientos guardados.
- Las retiradas de banco al efectivo son traspasos, no gastos; las compras reales hechas con efectivo sí afectan al Disponible una sola vez.
- Al abrir el menú, mostrarlo antes del bloqueo de scroll que fija el `body`; cancelar el bloqueo diferido si el menú ya se cerró. Mantener intactos scroll, accesibilidad y acciones.
- Gastos variables debe pintar contenido existente sin esperar cálculos secundarios. Cancelar callbacks obsoletos al salir; no ejecutar tareas de lista fuera de pantalla. Evitar render completo cuando se puede actualizar el fragmento afectado.
- La nube sigue siendo fuente de verdad. No tocar persistencia, reconciliación bancaria, históricos, huchas, fijos, ingresos ni otros cálculos para ocultar cargos de cartera.
- No promover LAB a estable sin verificación en Safari iOS/PWA y comprobación de Disponible. El archivo `index.html` es la entrada estable persistente; la entrada LAB lleva versión explícita.


REGLA DE RENDIMIENTO v97.23
- Al optimizar Menú ↔ Gastos variables, no ejecutar dos recorridos completos para cifras que puedan agregarse en el mismo bucle.
- Pintar la lista en lotes interrumpibles; pausar al abrir el menú o salir de Variables y reanudar/cancelar por generación. Mantener todas las filas, botones, orden, filtros y accesibilidad.
- No construir el resumen de categorías hasta que su pestaña esté activa.
- No afirmar tiempos ni p95 sin mediciones reales de navegador; documentar Safari/PWA iOS si no puede reproducirse.

---

## 9. NORMA PERMANENTE — GITHUB COMO CANAL OFICIAL DE PUBLICACIÓN DESDE CHATGPT

**Prioridad alta. Obligatoria para todas las versiones futuras de Fluxia.**

GitHub será el canal oficial para gestionar, actualizar y publicar Fluxia directamente desde ChatGPT, siempre que la conexión y los permisos estén disponibles.

1. **Comprobación al inicio de cada intervención:** verificar que el conector GitHub está disponible y autorizado para nacram1987-cmd/Fluxia-v20. Comprobar acceso al repositorio y permisos de lectura/escritura; no asumir que una autorización anterior sigue vigente.
2. **Publicación desde ChatGPT:** cuando las herramientas lo permitan, subir directamente los archivos corregidos, crear commits, actualizar la rama de publicación y verificar los resultados.
3. **Sin subidas manuales innecesarias:** no pedir al usuario que descargue y vuelva a subir archivos si hay una herramienta conectada capaz de realizar la operación.
4. **Publicación coherente:** identificar y actualizar en el mismo commit todos los archivos necesarios para esa build: index.html, manifest.webmanifest, el service worker realmente registrado, iconos y otros recursos referenciados. No asumir que cambiar solo el HTML basta. No reemplazar assets sin confirmar que pertenecen a la versión correcta.
5. **Una sola rama de Pages:** mantener y documentar una única rama oficial de publicación. A fecha 08/10/2026, la última ejecución exitosa de GitHub Pages se realizó desde pages-v9731-real-final; usar esa rama como canal oficial mientras la configuración del repositorio y las ejecuciones de Pages lo confirmen. main es la rama predeterminada del repositorio, no se debe tratar como rama de publicación sin evidencia. Las ramas LAB y de reparación no son publicadas por defecto.
6. **Verificación obligatoria:** comprobar el SHA del commit, el resultado del despliegue de Pages, la URL pública y el contenido/versión realmente servido. Verificar como mínimo el HTML principal, el manifiesto, el service worker y las referencias de versión. Si la URL o la versión servida no se pueden comprobar, informar que la publicación no está validada.
7. **PWA actualizable sin reinstalaciones:** conservar un id y scope estables en el manifiesto; versionar el caché del service worker en cada build; activar la build nueva, reclamar clientes y retirar únicamente cachés antiguas de la aplicación; servir la navegación con revalidación de red; no cambiar la identidad instalada ni pedir borrar/reinstalar la PWA como rutina. Confirmar cuál es el worker realmente registrado y eliminar discrepancias entre workers heredados.
8. **Entrega completa e historial:** cada entrega conserva el ZIP autosuficiente, changelog/README, sumas SHA-256, PROMPT MAESTRO actualizado y la referencia ESTABLE histórica. No promover LAB a ESTABLE sin la instrucción de promoción correspondiente.
9. **Gestión de limitaciones:** si el conector no permite acceder a un archivo, subirlo, cambiar la rama o consultar Pages, identificar el bloqueo concreto y probar una alternativa dentro de los permisos existentes. No usar cargadores temporales ni contenido improvisado en lugar del código real. No declarar completado un despliegue sin evidencia.
10. **Integridad financiera:** los commits, despliegues y actualizaciones de la PWA solo publican código y recursos. No migran, borran, reinicializan ni modifican datos financieros cloud. Supabase continúa como fuente de verdad.

### Procedimiento reproducible

1. Leer el árbol y el estado actual de la rama de Pages; confirmar el HTML de entrada (index.html) y qué service worker registra esa versión.
2. Preparar el paquete con la versión correcta y comprobar coherencia de versión, manifiesto, service worker y recursos. No publicar una versión de HTML distinta a la solicitada ni reconstruir desde un índice desactualizado.
3. Crear un único commit coherente sobre la rama oficial, usando el SHA actual como padre/lease. Revisar el commit y sus rutas antes de mover el ref.
4. Esperar y comprobar el workflow de Pages asociado al nuevo commit hasta estado terminal exitoso.
5. Consultar la URL pública con parámetros de caché nuevos; comprobar que el título/meta de versión coincide con la build y que manifiesto y worker corresponden a ella.
6. Confirmar enlace LAB, enlace ESTABLE, ZIP y hashes al usuario. Mantener el histórico; no eliminar las referencias estables anteriores.
7. Si cualquier comprobación falla, detener la declaración de publicación, conservar la última ESTABLE y corregir el flujo antes de dar la entrega por terminada.

**Objetivo permanente:** ChatGPT → GitHub → GitHub Pages → Safari/PWA actualizada. Cada reparación de publicación termina únicamente cuando el procedimiento esté documentado, sea reproducible y se haya validado con una publicación real.


## PROTOCOLO VINCULANTE DE PUBLICACIÓN · v97.45 (09/10/2026)
- Fuente real de GitHub Pages: rama `pages-v9731-real-final` del repositorio `nacram1987-cmd/Fluxia-v20`. Modificar solo `main` NO publica la PWA.
- Para LAB, crear o actualizar HTML completo en raíz con nombre versionado `lab-vNN-NN.html`; no entregar una página provisional. La versión visible, `<title>`, metadatos, variables de build y enlaces deben coincidir. Comprobar referencias heredadas antes de publicar.
- Tras aceptación explícita de LAB, promover el mismo contenido completo a `index.html` en la rama Pages; preservar manifest.webmanifest con `id`, `start_url` y `scope` existentes para que la PWA instalada conserve identidad y acceso.
- Actualizar `sw.js` cambiando `CACHE_VERSION` al número promovido para invalidar cachés antiguas; mantener network-first y protección de rutas LAB.
- Enlaces oficiales: ESTABLE `https://nacram1987-cmd.github.io/Fluxia-v20/` y LAB `https://nacram1987-cmd.github.io/Fluxia-v20/lab-vNN-NN.html?v=NN.NN`. Enlaces versionados para diagnóstico sin cambiar la ruta canónica de PWA.
- Tras commits verificar por separado existencia en repositorio, despliegue Pages y comportamiento real Safari/PWA. Nunca confundir commit con verificación pública ni afirmar pruebas bancarias no ejecutadas.
- Mantener ZIP completo por versión y un histórico de versiones estables; jamás borrar datos financieros ni resetear credenciales o identificadores de la PWA al promocionar.

# Fluxia BETA v94.74-LAB

## Objetivo
Consolidación real del Inicio/Dashboard y del selector de meses, manteniendo la lógica financiera y el aislamiento de usuarios de versiones anteriores.

## Cambios v94.74
- Dashboard de Inicio con una sola jerarquía: Disponible real → desglose → acciones.
- Se ocultan en Inicio los héroes/KPIs/resumen visual antiguos que duplicaban información.
- Selector local del Dashboard: mes anterior, Hoy y mes siguiente.
- El selector global se mantiene para el resto de pestañas y no duplica el control en Inicio.
- Distinción explícita entre **REAL** (mes actual) y **PLAN** (mes seleccionado no actual).
- Oro utilizado como acento funcional para provisiones/valor.
- Notificaciones activadas por defecto y temporizador idempotente.
- LAB y ESTABLE separados: LAB v94.74; ESTABLE v94.46 según PROMPT_MAESTRO.
- manifest.webmanifest arranca explícitamente v94.74-LAB.

## Banco / Supabase
**SIN CAMBIOS en Fluxia-banco-index.ts. No desplegar de nuevo.**

## Pendiente de validación real
- Movimiento Shell 7,50 €: comprobar banco → clasificación → gasto → Disponible real, sin duplicado.
- CaixaBank/Revolut: comprobar continuidad de movimientos y estados.
- Push bancario: validar entrega real en iPhone. Fluxia deja las preferencias activadas por defecto, pero el permiso del sistema y la entrega efectiva dependen del canal bancario/PWA.
- Cierre de mes y cambio de octubre/noviembre.

## Pruebas ejecutadas en esta entrega
- Verificación de versión LAB en puntos obligatorios.
- Verificación de ESTABLE en canal: v94.46-ESTABLE.
- Verificación de manifest: start_url apunta a v94.74-LAB.
- Verificación de ZIP: contenido y estructura.
- Verificación de sintaxis JavaScript de bloques inline.

No se declara la versión 100% verificada: las pruebas bancarias reales requieren ejecución con las cuentas conectadas del usuario.


### Regla de datos v94.74
Los registros financieros no se eliminan físicamente. La papelera es permanente y se sincroniza mediante Almacen cuando hay nube activa.


## v94.74 · Dashboard
- Eliminado del Dashboard el aviso visible «Para no perder nada»; las recomendaciones de copia/seguridad permanecen fuera del Dashboard.
- Pinceladas visuales: misma tipografía heredada de la interfaz/pestañas, jerarquía más limpia, navegación mensual oro y tarjetas ligeramente refinadas sin rediseño.

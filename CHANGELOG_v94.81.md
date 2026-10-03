# CHANGELOG v94.81-LAB (2026-10-03)

Sustituye a v94.80 (que traía un script roto y el selector de meses sin aplicar).

## Arreglado
- **Residuo de script en pantalla.** En v94.80 inyecté un `</script>` dentro de una cadena
  JS (exportación a Excel); cortó el script y el resto del código se mostraba como texto.
  Eliminado: 90 scripts inline, 0 errores de sintaxis.
- **"Nube pendiente de confirmación" contradictorio.** `renderFluxiaCloudIntegrity` usaba
  `window.Almacen` (no existe). Ahora usa `typeof Almacen`: con la nube activa muestra
  "Datos protegidos y sincronizados".
- **"Tus datos están solo en este dispositivo".** Ya no aparece si la nube está confirmada
  (`Almacen.estado === 'nube'`). Si la nube falla, vuelve a avisar (red de seguridad).

## Cambiado
- **Selector de mes en todas las pestañas con la mecánica del Dashboard**
  (‹ Mes · "Mes en curso" · Hoy ›) en lugar de las pills, con el color de cada pestaña:
  Ingresos teal · Fijos y Financiaciones marrón · Provisiones/Huchas dorado ·
  Variables violeta · resto teal. El mes sigue siendo global.
- Eliminado el CSS muerto `.mes-selector-unificado` de v94.80.

## Versión
- 8 puntos + manifest + canal + SW → v94.81-LAB.

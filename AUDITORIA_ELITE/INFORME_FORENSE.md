# Informe forense y correcciones ejecutadas

## Publicación
La reconstrucción solicitada desde main no actualizaba la rama efectiva. La v97.69 devolvía 404 pese a su workflow QA verde. Se añadió exclusivamente su blob ya validado a pages-v9731-real-final mediante commit db7790fb93f64f922d8091ee6018fb83f294c338. Pages run 38387603074 concluyó success. Ocho archivos HTTP 200 coincidieron por bytes, incluidos root, workers, manifiestos, v97.68 y v97.69. La raíz no cambió.

Se añade workflow soportado upload-pages-artifact/deploy-pages con pages:write e id-token:write, originado en la rama efectiva. El artefacto excluye el candidato no validado. Smoke de bytes y assets hace fallar la ejecución ante versión obsoleta. No usa POST /pages/builds ni oculta errores.

## Flujo contable
Proveedor → call autenticada → aplicarMovs → clasificación/vínculo → guardarMovimientos/Almacen → mergeCloudValue con revisiones y tombstones → cálculos autoritativos → vistas. Hay capas históricas de rehidratación, espejos, recuperación y reconciliación; no se ha sustituido el monolito.

Disponible vigente, conservado íntegramente: ingresosDe filtrados por fxIngresoCuentaDisponible − gastosFijosDisponibleTotal − provisionesParaDisponible − variablesTotal + impactoCajaCompartidosMes. Pensiones sin cobro reconocido se excluyen; fechas futuras previstas también. Fijos presupuestados siguen comprometidos antes de pagar; cargo vinculado real sustituye importe previsto. Provisiones = previsto + exceso mensual positivo, nunca se libera previsto por aportar menos. No igualar este indicador al saldo bancario.

## Causa raíz reproducida: falsas fusiones
En aplicarMovs (script 97), yaDup descartaba cualquier gasto bancario con mismo día/importe mediante `if(x.origen==="banco")return true`. Dos IDs distintos del mismo comercio también se colapsaban. Otra búsqueda gemelo cambiaba referencias de pagos confirmados por similitud. yaExisteManual y pendienteIgual asociaban por importe y fecha sin comercio/banco suficiente.

Se implementó candidato generado v97.70 en AUDITORIA_ELITE/candidate, sin publicar como LAB: retira dedupe genérico y sustitución de referencias confirmadas; manual/pending exige concepto normalizado, banco/cuenta compatibles y candidato único. Tres funciones cambiadas y un helper; resto de scripts y motor financiero idénticos. Seis pruebas rojas de v97.69 pasan después. 400 movimientos y diez reimportaciones conservan 400 registros/8.000 € sintéticos.

## Bloqueo encontrado antes de publicar candidato
Prueba extendida: mismo ID bruto en Caixa y Revolut aún colapsa dos pagos. El servidor devuelve id sin namespace de cuenta/proveedor y no devuelve accountId. Cliente, blacklist, ingresos y referencias comparten ID legado. Corregirlo requiere un contrato coordinado, compatibilidad de tombstones y dry-run por cuenta; renumerar IDs o reimportar datos reales automáticamente sería inseguro. Por ello **v97.70 NO APTA / NO PUBLICADA**. No ocultar esta prueba roja ni anunciar una LAB nueva.

## Seguridad real comprobada en catálogos
fluxia_contactos: RLS=false; anon/authenticated SELECT=true. Las políticas existentes no protegen filas mientras RLS esté desactivado. accept_invitation es SECURITY DEFINER, ejecutable por anon, no valida auth.uid contra usuario_id y devuelve éxito incluso cuando UPDATE afecta cero filas. Se preparó SEGURIDAD_PROPUESTA_NO_APLICADA.sql, sin ejecutarla: habilitar RLS y restringir RPC al destinatario autenticado, corregir FOUND/search_path y grants. Es un cambio sensible de producción pendiente de autorización y ensayo en copia.

fluxia_datos sí tiene RLS y políticas SELECT/INSERT/UPDATE/DELETE por auth.uid; UPDATE usa WITH CHECK. Función bancaria LAB valida token con auth.getUser y filtra sesiones por user_id aunque verify_jwt=false. Estas observaciones de código NO acreditan pruebas completas con dos JWT reales.

## Riesgos residuales
Avisos de sincronización tienen varias capas: evento banco-nuevos, toast y WebPush. No se certifica una sola notificación por cargo físico. Recuperaciones legacy y carreras nube/offline requieren ampliar ensayos. No se leyeron ni modificaron cuentas reales, no se corrigió retrospectivamente el Disponible del usuario ni se afirmó una cifra real sin sus datos. Sin ensayo iOS/API A-B, no hay promoción ni certificación profesional completa.

## Próximas cinco acciones
1. Aplicar seguridad contactos/RPC tras aprobación, backup y tests de destinatario (P0, alto impacto, esfuerzo bajo/medio).
2. Contrato bancario con provider/account/reference y compatibilidad legado/tombstones; dry-run por cuenta (P0, esfuerzo alto).
3. Ensayo cloud con dos cuentas sintéticas, dos sesiones/dispositivos y carreras offline (P0, medio/alto).
4. Captura de un único cargo: notificaciones, rechazo persistente y diez sincronizaciones reales (P0, medio).
5. Benchmark Safari/PWA y perfilado de tareas largas antes de cualquier optimización adicional (P1, medio).

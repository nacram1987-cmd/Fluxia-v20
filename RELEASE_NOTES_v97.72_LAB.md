# Fluxia v97.72-LAB — corregida la conciliación oculta de cargos bancarios a fijos

**Estado:** candidata LAB; publicación condicionada a QA, benchmark y smoke HTTP del workflow. ESTABLE/PWA raíz y v97.66/v97.68/v97.71 permanecen intactas.

## Causa raíz demostrada
- v97.71 encolaba una propuesta para `Apple.com/bill` (2,99 €) si un único fijo pendiente tenía ese importe, pero `leerPend()` descartaba después cualquier propuesta sin coincidencia textual. El aviso nunca aparecía.
- `revisarExistentes()` ignoraba cargos ya marcados «revisados» en un escaneo anterior incluso si nunca se produjo una conciliación real.

## Corrección quirúrgica
- Con `modo=importe`, revalidar fijo original, mes, importe con tolerancia 0,05 €, unicidad absoluta entre fijos pendientes y existencia del cargo; conservar propuesta visible de confirmación.
- Reexaminar cargos bancarios existentes de los últimos 45 días cuando exista candidato inequívoco, salvo decisión previa de rechazo, exclusión, archivo o enlace. No pagar sin confirmación por coincidencia solo de importe.
- Una vez confirmado, usar `aplicarVinculo()` canónico: el gasto deja de contar como variable y se enlaza al fijo. No crear otro movimiento ni modificar las fórmulas de Disponible.
- No reconocer automáticamente recibos que ya estaban pagados manualmente: permanece pendiente de diseñar un merge de pagos manuales/bancarios sin doble pago.

## Pruebas y limitaciones
- Reproducir fallo v97.71 (aviso oculto), validar aparición v97.72, confirmación una vez, revisión de cargo existente, empate ambiguo, «Nunca más».
- Comparar todos los scripts: solo controlador bancario/fijo (índice 96) alterado, sin cambiar contabilidad, banca PSD2 ni cálculos del Disponible.
- Mantener QA de v97.66–v97.71, 10 rondas de benchmark comparativo y comprobación de HTML/manifest/PWA LAB realmente servidos.
- **No verificado:** sesión bancaria de usuario, datos privados de octubre, Safari/iPhone físico; no hay promesa de cero errores fuera de escenarios ensayados.

# Auditoría del Disponible · v2.0.28-LAB

## Corrección

El motor de Disponible de LAB incluía el saldo pendiente de rescates temporales como sumando. El motor financiero estable no incluye los rescates en la fórmula y los identifica como movimientos internos. Se eliminó ese impacto de Disponible conservando el importe pendiente como dato informativo y el historial completo de la hucha. Una pensión sin cobro efectivo continúa excluida.

## Certificación

Estado: **PENDIENTE DE CERTIFICACIÓN**. La paridad de fórmula queda corregida; no se declara conciliación terminada porque aún deben cotejarse HTML y nube del mismo perfil/corte y aclararse discrepancias de identidad de movimientos/vínculos. No se tocaron los registros financieros ni el HTML estable.

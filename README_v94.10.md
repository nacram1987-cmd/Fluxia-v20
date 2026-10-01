# Fluxia BETA v94.10-LAB

## Corrección respecto a v94.8 / v94.9

En v94.8 se cambió **estructura** de ingresos (mal, no era quirúrgico):
- `ingresosTotal` solo sumaba cobrados → el total del mes salía 0 € + "pend."
- El formato del total en pantalla cambió

**v94.10 restaura la estructura:**
- `ingresosTotal` = todos los no-puente del mes (como siempre) → total del plan
- Grupos POR COBRAR / YA COBRADOS sin cambiar
- Total en pantalla: una sola cifra (sin "· pend.")
- **Disponible real** (`disponibleEfectivo`) = solo ingresos con `pagadoEl` − gastos
- Fecha de cobro futura → sigue en POR COBRAR con "Pendiente · cobro previsto" (no se marca cobrado)

## Edge Function
Incluye el TS v94.9 (refresco sesión CaixaBank). Si ya lo desplegaste, no hace falta otra vez.

## Cómo probar
1. `?v=v94.10-LAB`
2. Pestaña Ingresos: total = suma de todos (nómina + pensión + …)
3. Pensión 24 oct → POR COBRAR, no en disponible del dashboard

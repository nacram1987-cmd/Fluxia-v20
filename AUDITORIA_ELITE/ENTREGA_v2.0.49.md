# Fluxia Élite BETA v2.0.49 — corrección de «recuperación de pantalla» en Inicio

**Síntoma (iPhone, v2.0.48):** Inicio mostraba «Fluxia Élite · recuperación de pantalla — Invalid mix of BigInt and other type in subtraction».

**Causa (reproducida con datos reales del perfil, solo lectura):**
1. `huchaFinancialSnapshot` no usaba los vínculos persistentes `fluxia_rescue_links`; el historial de las huchas quedaba «provisional» por nombre aunque el uso estuviese vinculado por ID. El cálculo marcaba cada rescate como «historial incompleto» y no devolvía importe.
2. Sin importe, `verifyLedger` restaba un `BigInt` con un valor no BigInt → excepción → pantalla de recuperación.

**Cambios mínimos:**
- `rescueIdentityLinkFor()` (mismas condiciones estrictas que v2.0.48: ID, hucha, importe en céntimos, fecha y nombre) se usa también en el historial de la hucha.
- `verifyLedger` solo se invoca si el cálculo produjo un `BigInt` válido.
- Sin cambios en la fórmula del Disponible, datos, Supabase, producción ni PWA.

**Pruebas:** `lab/qa/elite-rescue-link-bigint-v2049.cjs` (falla en v2.0.48, pasa en v2.0.49); suite de los workflows Élite; se actualizó la aserción obsoleta de `elite-hucha-ledger-v1963` (rawSources ya usa colecciones actuales del perfil, commit eb471f1).

**Cifra de referencia (solo lectura, corte 16/10):** −373,80 € = −327,67 € − 46,13 € (3 cargos del 16/10). Estado PROVISIONAL: siguen abiertos [b] cotejo con HTML al mismo corte, [c] resto de rescates, [d] bancos.
**Rollback:** v2.0.48 intacta en `lab/versions/fluxia-elite-safari-v2.0.48.html`.

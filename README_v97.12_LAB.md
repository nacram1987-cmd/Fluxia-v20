# Fluxia v97.12-LAB
Base v97.11. PROMPT MAESTRO + performance execution rules remain authoritative.

- ATM/cajero/reintegro bank withdrawals are transfers Banco -> Efectivo, not variable expenses.
- Withdrawal remains as bank evidence; it is marked tipoInterno=traspaso_efectivo and excluded from Disponible.
- Equivalent cash entry is idempotent by bank reference/movement fingerprint to prevent duplicate wallet balance after bank resync.
- Actual later cash spending remains a real variable expense once.
- v97.11 interaction hot-path consolidation retained.
- Service worker shell bumped to v97.12; canonical index.html remains PWA entry.
- No intentional change to financial formula, Huchas, Ingresos, Fijos, Compartidos, user isolation or cloud authority.
- Physical iPhone/PWA timing remains device validation.
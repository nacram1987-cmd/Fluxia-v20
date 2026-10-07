# Fluxia v97.13-LAB
Base: v97.12-LAB. Visual authority: v97.6. Performance benchmark: v96.58.

## Cash-account philosophy
Bank and Dinero en mano describe WHERE money is. Variables/Fijos/Provisiones describe WHAT the money was used for.

- ATM withdrawals remain Banco -> Dinero en mano transfers, impact 0 on Disponible.
- Dinero en mano now has Meter, Gastar and Provisión actions.
- Provisión shows only provisions with positive real balance.
- Paying a provision from cash reduces cash and records a definitive provision use; it does NOT create a variable expense and therefore does not double-reduce Disponible.
- Example: Mantenimiento césped with 70 EUR available can be paid directly from Dinero en mano.
- Normal cash spending still creates one real variable expense.
- Targeted render path used for cash/provision payment; no renderAll in that operation.
- Service worker shell v97.13; canonical index.html remains PWA entry.
- No intentional change to Disponible formula, cloud authority, tombstones, user separation or historic provision rules.

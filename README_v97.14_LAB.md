# Fluxia v97.14-LAB
Base v97.13. Financial integrity first.

- One-time cloud-persisted reconciliation for Mantenimiento Césped: confirmed historical balance 70.00 EUR. Removes the erroneous extra 35 contribution when current total is above 70.
- The provision is marked _fxCesped70V9714 after reconciliation, so the migration is idempotent and does not cap or delete legitimate future contributions.
- Dinero en mano category selector reuses the exact emoji labels already defined in Gastos Variables instead of maintaining a second icon dictionary.
- Cash -> provision flow from v97.13 retained.
- ATM -> cash transfer flow retained.
- Global cross-tab visual normalization intentionally deferred to next version as requested.
- Service worker shell bumped to v97.14; canonical index.html remains the PWA entry.

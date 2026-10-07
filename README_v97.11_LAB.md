# Fluxia v97.11-LAB — Performance consolidation

Base: v97.10-LAB. Visual authority: v97.6. Financial/cloud rules unchanged.

Changes:
- Removed the global touch fastlane that toggled a body class on touchstart/touchmove/touchend and forced whole-tree style recalculation while scrolling.
- Removed redundant menu touch/compositor helper layers; the single native #btnMenu pointerdown -> openDrawer path remains.
- Removed periodic bank UI polling/focus refresh competition; one bank revalidation is deferred until after splash/idle.
- Preserved canonical index.html and added index_fluxia_v97.11_LAB.html for rollback/history.
- No redesign and no intentional changes to formulas, Disponible, Huchas, Ingresos, Fijos, Variables, Compartidos, persistence, tombstones, user separation or Supabase.

Physical iPhone/PWA timing and live authenticated financial equality remain user-device validation items.
# Fluxia v95.54-ARCH-LAB — cierre arquitectónico

- Recuperaciones v91.5, v95.38, Fijos y missing-block: retiradas del boot.
- Snapshot IndexedDB: conserva backup; restore únicamente manual; sin monkey-patch global de Storage.
- Disponible: autoridad única y desglose auditable; eliminado override v95.52 y fallback legacy/deuda oculta.
- Banca: auto-reconciliación que muta plan retirada de boot/visibility/pageshow/timer.
- Reglas bancarias aprendidas: sin aplicación temporizada automática.
- Huchas: guard transaccional de estado completo; detecta mutaciones internas, no solo IDs desaparecidos.
- Estable protegida: v95.39, no modificada por esta entrega.

Esta build debe permanecer LAB hasta prueba funcional con datos reales y validación del usuario.

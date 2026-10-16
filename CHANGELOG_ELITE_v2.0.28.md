# Fluxia Élite BETA v2.0.28-LAB · 16/10/2026

## Corrección contable

El cálculo de Disponible de LAB vuelve a coincidir con la regla del HTML estable: rescates y reposiciones de huchas son traspasos internos. Se mantienen en el historial y en el libro mayor con impacto de 0 céntimos; su saldo pendiente ya no se suma al Disponible. La pensión no cobrada continúa excluida.

## Integridad y alcance

- No se modificó el HTML estable ni ningún registro financiero en Supabase.
- El importe disponible en octubre se mantiene **PROVISIONAL** hasta completar la comparación con una copia HTML del mismo perfil/corte y resolver los duplicados de movimientos y vínculos de hucha no verificables detectados en la auditoría privada.
- Los casos de rescate y reposición se prueban con fixtures sintéticas; no certifican por sí mismos la contabilidad real.

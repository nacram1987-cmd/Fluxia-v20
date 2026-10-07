# CHECKLIST · Fluxia v96.77-LAB

## Corregido
- Canonicalización conservadora de Huchas en lectura cloud normal.
- Canonicalización en lectura masiva antes de reconciliar/pintar.
- Canonicalización antes de escritura para impedir que el duplicado vuelva a Supabase.
- Se reutiliza la regla validada excel + rebase_v9538; no se fusionan huchas manuales ni casos ambiguos.

## Preservado
- Gastos Variables v96.76 y su aislamiento de layout/pintado.
- Eliminación del antiguo v96.21-variable-regression.
- Interfaz v96.45.
- Cloud-first, CAS, tombstones, bancos y reglas de Disponible.

## Validación estática
- HTML v96.77: 2.232.851 caracteres.
- 0 referencias a v96.76-LAB.
- Parches de lectura, lectura masiva y escritura presentes.
- Bloque antiguo v96.21-variable-regression ausente.
- Manifest y service worker exclusivos v96.77 creados.

## Prueba real solicitada
Abrir Huchas, comprobar número/saldos, recargar y volver a entrar. Confirmar que Variables sigue fluido.

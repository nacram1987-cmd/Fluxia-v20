# Fluxia v95.71-LAB

- Corrige el bloqueo de **Siguiente** en Safari para una cuenta cloud existente sin perfil local utilizable.
- El login del paso 0 autentica primero directamente contra Supabase (`signInWithPassword`).
- Tras autenticarse, reutiliza la recuperación segura de perfil cloud bajo RLS y recarga el perfil reconstruido.
- No borra, mueve ni sobrescribe registros financieros durante la detección.
- v95.39 ESTABLE no se modifica.

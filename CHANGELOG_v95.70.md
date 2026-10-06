# Fluxia v95.70-LAB

- Corrige el bloqueo de Safari al iniciar sesión con una cuenta cloud existente cuando el perfil local fue eliminado.
- Tras autenticar, reconstruye el perfil únicamente desde las filas visibles al UUID autenticado mediante RLS.
- Reutiliza el selector seguro de perfil dominante de v95.69.
- No crea un plan a cero si encuentra el perfil cloud existente.
- No borra, mueve ni sobrescribe datos financieros durante la detección.
- v95.39 ESTABLE no se modifica.

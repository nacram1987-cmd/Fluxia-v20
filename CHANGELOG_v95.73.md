# Fluxia v95.73 LAB

## Corrección crítica de acceso Safari/PWA
- Corrige un error estructural HTML/JavaScript introducido en v95.72: faltaba el cierre `</script>` antes del interceptor de acceso de cuenta existente.
- Ese error impedía que Safari registrase el nuevo manejador del botón **Siguiente**, por lo que el botón parecía no hacer nada.
- Se mantiene el acceso directo: Supabase Auth → UUID autenticado → perfil cloud existente → reconstrucción local → carga del plan.
- No modifica ni elimina datos financieros durante la detección.
- v95.39 ESTABLE permanece intacta.

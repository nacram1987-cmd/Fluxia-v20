# Fluxia Élite BETA Safari v2.0.15

## Cambio
- Corregido **Más → Bancos → Sincronizar bancos**. La respuesta o el error podían escribirse en un elemento que se eliminaba al reconstruir el panel; ahora sobreviven al redibujado y se recuperan al reabrir Bancos.
- La bandeja sigue aislada por propietario/perfil; no se importa automáticamente al ledger ni cambia Disponible.

## Dónde probar
1. Abrir la LAB de Élite en Safari e iniciar sesión en el perfil correcto.
2. Ir a **Más → Bancos** y tocar **Sincronizar bancos**.
3. Confirmar que resultado o error concreto permanecen visibles tras la petición.
4. Reabrir Bancos y comprobar que se conserva el último estado.

## QA y límites
- Regresiones automatizadas de perfil, identidad estable, idempotencia, conflictos, motor cent-exact y parsing.
- La captura v2.0.14 muestra el texto inicial, pero no permite saber si Enable Banking respondió. La nueva versión mostrará la respuesta real; no simula un éxito del proveedor.
- Safari físico y conexión bancaria real requieren confirmación en el dispositivo. No cambia la PWA HTML estable ni escribe cargos en Supabase.

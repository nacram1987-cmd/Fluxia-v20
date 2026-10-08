# Fluxia v97.28-LAB · PWA FIX definitivo

Paquete mínimo para subir a la raíz de la rama `lab/ux-pwa-audit-20261008`.

Archivos incluidos:

- `index.html`
- `manifest.webmanifest`
- `fluxia-icon.png`
- `README.md`

Cambios v97.28-LAB:

- Corrige arranque en modo PWA/iOS standalone.
- `manifest.webmanifest` con `start_url` versionado para evitar caché antigua al añadir a pantalla de inicio.
- Mantiene menú normal integrado arriba.
- Oculta/elimina visualmente cualquier botón flotante negro heredado.
- Mueve `#btnMenu` al header si alguna capa antigua lo deja fuera en PWA.
- Añade versión visible `v97.28-LAB`.
- Intenta desregistrar service workers antiguos solo en modo standalone, sin borrar datos financieros.
- No modifica lógica financiera, Supabase, huchas, disponible ni movimientos.

Commit recomendado:

```
release: Fluxia v97.28 LAB pwa fix
```

# Fluxia v94.77-LAB

## Enlaces
1. `index.html?v=v94.77-LAB`
2. `index.html`

## Checklist
- [x] **Cerrar sesión** ya no llama a `Almacen.vaciar` (no borra datos)
- [x] Tras cerrar sesión → puerta de entrada + «Ya tengo un usuario»
- [x] **Dueño nunca aislado** (no se vacían huchas/rescates en memoria)
- [x] **Dual-write** provisiones/usos/movimientos (scoped + unscoped)
- [x] **Descartar / Es otro gasto** → blacklist permanente (no reaparecen al reañadir a inicio)
- [x] Estética fina tipo **Provisiones** en todas las pestañas
- [x] README en release

## Nota sobre v94.76
Si tu build instalada es 94.76 de otro árbol, fusiona estos puntos o sustituye por este `index.html` tras backup.

## ZIP
```bash
zip -9 fluxia_v94.77_LAB.zip index.html fluxia-sw.js fluxia-canal.json README_v94.77.md PROMPT_MAESTRO_v94.77.txt
```

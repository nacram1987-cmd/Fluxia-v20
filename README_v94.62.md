# Fluxia v94.62-ESTABLE

## Enlaces
1. **ESTABLE:** `index.html?v=v94.62-ESTABLE`
2. **Directo:** `index.html`

## Checklist
- [x] Crash ClaimOwner corregido
- [x] **Aislamiento seguro**: nuevo usuario → namespace vacío + force 0 en memoria
- [x] **NO borra** datos unscoped del dueño (copia huecos: usos/rescates incluidos)
- [x] Compartidos: misma estética hero crema/teal
- [x] Aportaciones ✎/✕
- [x] README en release

## Si perdiste rescates de hucha
Los datos **no se borran** del localStorage unscoped (`planRescate_v2_usos`).
Al entrar con tu usuario principal, v94.62 **rellena huecos** desde ahí.
Si aún faltan: Ajustes → Papelera / copia de seguridad anterior.

## ZIP (en tu Mac)
```bash
zip -9 fluxia_v94.62_ESTABLE.zip \
  index.html fluxia-sw.js fluxia-canal.json \
  README_v94.62.md PROMPT_MAESTRO_v94.62.txt
```

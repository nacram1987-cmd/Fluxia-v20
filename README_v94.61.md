# Fluxia v94.61-ESTABLE

## Enlaces
1. **ESTABLE:** `index.html?v=v94.61-ESTABLE`
2. **Directo:** `index.html`

## Checklist de esta versión
- [x] **Crash al crear usuario** — `fluxiaClaimOwnerIfNeeded` stub restaurado
- [x] **Aislamiento nuclear** — cada perfil `planRescate_v2_u_<id>_`
- [x] **Hermano / Pepe a 0** — sin bancos ni plan del dueño
- [x] **Aportaciones ✎ / ✕** — delegación estable + confirm nativo de respaldo
- [x] **Papelera** al borrar aportaciones
- [x] **Héroes A+D** todas las pestañas
- [x] README en cada release

## Cómo probar
1. Sube y abre `?v=v94.61-ESTABLE`
2. Crear usuario nuevo → **no debe crashear** → plan a 0
3. Hucha → historial → ✎ cambia importe · ✕ borra
4. Tu usuario principal → plan intacto

## ZIP
```bash
zip -9 fluxia_v94.61_ESTABLE.zip \
  index.html fluxia-sw.js fluxia-canal.json \
  README_v94.61.md PROMPT_MAESTRO_v94.61.txt
```

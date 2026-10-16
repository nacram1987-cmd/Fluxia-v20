# Fluxia Élite BETA v2.0.29-LAB

Ruta LAB: `lab/fluxia-elite-safari-datos-reales.html` (snapshot inmutable: `lab/versions/fluxia-elite-safari-v2.0.29.html`). El HTML/PWA estable no cambia.

## Evidencia local de `bancoRef` repetido (solo lectura, sin red)

```
node lab/tools/elite-reconcile-cli.cjs --cloud export-nube.json --month 2026-10 --cutoff 2026-10-15T10:00:00+02:00 \
  --history "copia 7 oct=nube-2026-10-07.json" --out ./privado
```
`informe-privado.json` (con IDs reales: no subir a GitHub) lista cada grupo con su clase, evidencia y fecha de aparición; `informe-publico.json` solo lleva recuentos y seudónimos.

## Rollback
`git revert` del commit v2.0.29, o servir `lab/versions/fluxia-elite-safari-v2.0.28.html`.

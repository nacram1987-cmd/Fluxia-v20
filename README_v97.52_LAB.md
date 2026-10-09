# Fluxia BETA v97.52-LAB — arranque rápido

## Entradas
- LAB (nueva): https://nacram1987-cmd.github.io/Fluxia-v20/lab/
- LAB directa: https://nacram1987-cmd.github.io/Fluxia-v20/lab/index.html
- Referencia raíz sin modificaciones (NO promover automáticamente): https://nacram1987-cmd.github.io/Fluxia-v20/

## Qué cambia
1. Chart.js deja de ser un script defer bloqueante de DOMContentLoaded y se carga al abrir Análisis/Presupuestos.
2. La sincronización bancaria automática se agenda para cuando termine la entrada y no haya habido interacción durante 1,4 s; la sincronización manual no cambia.
3. La LAB se instala independientemente en /lab/ con manifest y service worker propios.
4. Diagnóstico seguro y sin información personal con `?fxperf=1` y `FluxiaArranque9743.report()`.

## Origen
- LAB v97.52 construida directamente sobre `index-v97.51.html` de la rama real de GitHub Pages `pages-v9731-real-final` (no sobre el `main` anticuado).
- Raíz ESTABLE v97.46, sin tocar en la rama Pages.

## Qué se conserva
- Sin cambios en cálculos, guardado, conciliación, login, cuentas, huchas, importes, tombstones, rechazo definitivo de cargos, provisiones y reglas del Disponible.
- `index.html` de raíz y el SW raíz se dejan intactos.

## Verificación real pendiente
- [ ] Safari iPhone: inicio frío y caliente, tiempo al primer toque válido y menú.
- [ ] PWA LAB: instalación, segunda apertura, cero splash atascado.
- [ ] Dashboard, mes y datos financieros correctos.
- [ ] Análisis y Presupuestos cargan gráficos tras primer acceso.
- [ ] Bancos: sin duplicados ni cambios inesperados de disponible.
- [ ] Sesiones: separación de usuarios y datos.
- [ ] Reconexión y movimientos con la nube, sin resurrecciones.

**No promover como ESTABLE sin estas pruebas.**

## Paquete
El workflow `.github/workflows/fluxia-lab-v9752.yml` crea el ZIP completo como artefacto de GitHub Actions al publicar el commit. Incluye `lab/index.html`, SW/manifest/icons y activos, PROMPT_MAESTRO y README.

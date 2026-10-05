# Fluxia v95.47-LAB

Base funcional: **v95.46-LAB**. Estable protegida: **v95.39**.

## Checklist de cambios

- [x] **Diseño aprobado aplicado realmente a Gastos fijos**: hero teal, mes integrado, fecha visible, resumen de compromisos, progreso y tarjetas premium.
- [x] **Cabecera premium aprobada**: logo Fluxia, BETA oro, menú/campana y chips Bancos/Nube; sin saludo ni versión redundantes.
- [x] **Total contable coherente**: compromisos = gastos fijos normales + financiación del mes.
- [x] **Recuperación por clave de Gastos fijos**: si `profile:<perfil>:v2_fijos` está vacío, se recupera `v2_fijos` o `planRescate_v2_fijos` de la MISMA cuenta Supabase autenticada.
- [x] **Sin longest-list-wins**: prioridad por clave canónica + timestamp; backup previo y readback cloud obligatorio.
- [x] **Corrección de arranque v95.46→v95.44**: HTML, manifest y Service Worker LAB apuntan exclusivamente a v95.47.
- [x] **Puente para PWA antigua**: accesos LAB v95.44/v95.46 redirigen a v95.47 para evitar que un icono instalado siga abriendo la build vieja.
- [x] **Service Worker único de LAB** y limpieza de caches `fluxia-lab-*` antiguas.
- [x] **README = Ayuda → Checklist**.
- [x] **Estable protegida**: `index.html` sigue byte por byte la v95.39.

## Canales
- ESTABLE: v95.39
- LAB: v95.47-LAB

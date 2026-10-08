# Fluxia v97.26-LAB · Fase 1 Rendimiento

Paquete preparado en ChatGPT: `Fluxia_v97.26_LAB_FASE1_RENDIMIENTO.zip`.

## Estado

- Código recuperado desde v97.23-LAB.
- Generada entrada `index_fluxia_v97.26_LAB.html`.
- `index.html` apunta a v97.26-LAB.
- Manifest PWA actualizado con logo Fluxia azul verdoso.
- Fast-path de menú y optimización inicial de Variables/Bancos aplicada en el HTML generado.
- No se han tocado reglas financieras, Disponible, Dinero en mano ni Supabase.

## Despliegue manual si el conector no puede transmitir el ZIP completo

1. Descomprimir `Fluxia_v97.26_LAB_FASE1_RENDIMIENTO.zip`.
2. Entrar en la carpeta `vercel_lab/`.
3. Subir el contenido de `vercel_lab/` a la raíz de esta rama `lab/ux-pwa-audit-20261008`.
4. Commit recomendado: `release: Fluxia v97.26 LAB fase 1 rendimiento`.
5. Vercel debe desplegar el proyecto LAB automáticamente desde esta rama.

## Archivos clave esperados

- `index.html`
- `manifest.webmanifest`
- `fluxia-sw.js`
- `fluxia-icon.png`
- `fluxia-ui-v97.23.css`
- `assets/brands/*`
- `vercel.json`

## Verificación

Al abrir LAB debe verse `v97.26-LAB` y mantenerse la lógica financiera intacta.

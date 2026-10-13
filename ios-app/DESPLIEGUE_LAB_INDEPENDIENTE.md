# Fluxia Élite LAB — despliegue web independiente

**Solo demostración con datos ficticios.** No iniciar sesión ni introducir credenciales. Nunca desplegar el backend o las tablas financieras en esta vista.

## Configuración de Vercel (proyecto separado)

1. Importar el repositorio GitHub `nacram1987-cmd/Fluxia-v20` como un **proyecto nuevo**, no reutilizar el proyecto de Fluxia PWA estable.
2. Seleccionar **Production Branch**: `feature/fluxia-elite-ios-capacitor`.
3. **Root Directory**: `ios-app`. Framework preset: **Other**; Build command: vacío; Output Directory: `www`.
4. Revisar que el proyecto no tenga variables de entorno, tokens bancarios ni secretos.
5. Publicar en el dominio HTTPS propio del proyecto LAB. Verificar `/manifest.webmanifest`, `/sw.js` y que el banner indique datos ficticios.
6. En Safari iPhone: Compartir → Añadir a pantalla de inicio. La instalación es **web**, no un binario iOS/TestFlight.

## Aislamiento y seguridad

- **No modificar** GitHub Pages, la rama estable ni la URL de la PWA existente.
- El `vercel.json` de esta carpeta impide conexión de red desde scripts (`connect-src 'none'`) y desaconseja indexación.
- El service worker cachea únicamente los archivos estáticos de LAB y no los datos financieros.
- Antes de cualquier integración de autenticación o datos reales, retirar/revisar la política `connect-src 'none'`, separar los dominios, auditar RLS y completar pruebas multiusuario.
- Sin un proveedor de hosting conectado no existe una URL LAB verificable; los artefactos de GitHub Actions **no son** alojamiento web.

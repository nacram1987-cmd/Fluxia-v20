# Fluxia BETA — proyecto iOS (fase 0)

Inicio del proyecto nativo con Capacitor 7, aislado de la PWA estable. **No es una app financiera funcional todavía ni una compilación TestFlight.** El punto de entrada local es deliberadamente una pantalla segura de preparación: no copiar a ciegas el HTML monolítico, los tokens, ni el almacenamiento local de la PWA.

## Compilación en macOS

Requisitos: Mac con Xcode, Node.js, CocoaPods cuando Xcode/Capacitor lo requieran y cuenta de desarrollador Apple para TestFlight.

```sh
cd APP_IOS_BETA
npm install
npx cap add ios
npx cap sync ios
npx cap open ios
```

En Xcode: configurar Signing & Capabilities y un Bundle ID propio y disponible (el del ejemplo es provisional). Probar primero en simulador y después en dispositivo. **No distribuir por TestFlight hasta que el motor real esté integrado y pase QA.**

## Criterios de salida de fase 0

1. Restauración de sesión y datos desde nube, sin dependencia de localStorage/PWA ni mezcla entre cuentas.
2. Auditoría de Disponible, variables, fijos, financiaciones, compartidos y provisiones; reconciliación sin duplicados.
3. Conexiones bancarias, deep links de retorno, estado real y notificaciones idempotentes.
4. Navegación fluida y arranque medidos en iPhone; pruebas con red intermitente y reinstalación.
5. UI de Gastos variables: importe principal de gran tamaño, accesible, sin alterar cálculos.
6. Privacidad, credenciales, llavero, borrado de cuenta, política y revisión App Store.

La PWA estable permanece intacta. La LAB v97.72 sigue disponible en https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.72/index.html

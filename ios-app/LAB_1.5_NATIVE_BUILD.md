# Fluxia Élite App LAB 1.5 — compilación iOS de desarrollo

**Estado:** paquete web local de demostración integrado en Capacitor. Datos ficticios, sin login real ni bancos. No es una compilación iOS ya generada, firmada o probada en dispositivo.

## Compilar en Mac con Xcode

```bash
cd ios-app
npm install
npm run verify:dev
npm run ios:add             # una sola vez si ios/ todavía no existe
npm run ios:sync:dev
npm run ios:open
```

En Xcode seleccionar equipo de firma, identificador de bundle válido y un simulador/iPhone. La firma y TestFlight requieren cuenta Apple y pruebas específicas. El repositorio todavía no contiene proyecto Xcode generado.

## Seguridad y límites

- `www/index.html` incluye exclusivamente la experiencia visual LAB 1.5 con datos ficticios.
- `npm run ios:sync:dev` valida que el paquete sea de desarrollo, no sustituye QA financiera.
- `npm run ios:sync` continúa BLOQUEADO sin un manifiesto de auditoría válido.
- No introducir credenciales, tokens ni datos financieros en el prototipo.
- No modificar la PWA estable ni publicar la beta como si hubiera superado auditoría.

## Próxima fase

Auditar carga de identidad y datos desde el backend canónico; resolver callbacks OAuth/deep links de iOS y conciliación bancaria; pruebas multiusuario, offline, duplicados y rendimiento antes de habilitar finanzas reales.

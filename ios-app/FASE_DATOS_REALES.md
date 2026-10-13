# Fluxia Élite — Fase de datos reales (LAB)

## Estado
- Compilación Xcode para simulador: verificada en GitHub Actions run 38450659540 (LAB 1.5 sintético).
- Adaptador de instantáneas financieras de solo lectura: implementado en `src/readonly-finance.mjs`.
- Tests de aislamiento entre cuentas, cierre de sesión y precisión monetaria: `tests/readonly-finance.test.mjs`.
- Integración con autenticación real, base de datos y bancos: **NO IMPLEMENTADA**.

## Criterios antes de conectar producción
1. Identificar el backend real y el contrato de autenticación vigente sin copiar credenciales ni tokens al repositorio.
2. Exigir control de acceso del servidor (RLS o equivalente); no confiar en el identificador de usuario enviado por el cliente.
3. Endpoint de consulta solo lectura con esquema versionado y separación por usuario.
4. Pruebas de dos cuentas, sesión caducada, datos vacíos y desconexión.
5. Conciliación financiera con la PWA estable; no cambiar sus cálculos ni datos.
6. No activar escrituras, sincronización bancaria ni credenciales en el prototipo sintético.

No modificar la PWA estable ni fusionar esta rama sin auditoría y autorización.

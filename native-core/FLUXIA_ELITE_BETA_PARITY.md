# Fluxia Élite BETA — Contrato de paridad HTML → iOS
Fecha: 2026-10-14. Estado: especificación, no implementación terminada.

## Identidad invariable
- Nombre visible de app nativa: **Fluxia Élite BETA**.
- Pantalla de inicio, encabezado, splash, configuración, información y pruebas: mostrar **BETA** claramente, con acento dorado de marca.
- Nombre de instalación PWA existente: **Fluxia BETA**. No modificarlo ni cambiar id/start_url/scope; mantener ambas identidades diferenciadas.
- Icono: reutilizar logo oficial de Fluxia; no sustituirlo por una letra F genérica.
- Identificadores técnicos (bundle ID, URL, claves de datos) no requieren texto BETA si eso rompe compatibilidad.

## Paridad funcional requerida
1. Sesión y perfiles: login, logout, recuperación, cuenta nueva vacía, separación absoluta de usuarios y dispositivos.
2. Dashboard: Disponible correcto, ingresos, fijos, variables, huchas y compartidos; selector mensual consistente.
3. Ingresos: creación, edición, historial, persistencia y conciliación.
4. Variables: movimientos, categorías, estados, edición, papelera y total real mensual, sin confundirlo con Disponible.
5. Fijos: planificación, pagos, vencimientos, importaciones bancarias asociadas, historial y rechazo definitivo.
6. Huchas: plan mensual, aportaciones, usos, rescates, retroactividad y saldo histórico; regla de exceso sobre plan.
7. Compartidos: reparto, deuda, liquidación y vínculos entre cuentas.
8. Financiaciones: cuotas, pendientes, amortización, fechas e historial.
9. Bancos: conexiones, sincronización, clasificación, aviso único por cargo, deduplicación, rechazo persistente y trazabilidad.
10. Notificaciones: global y por módulo, descartes definitivos.
11. Estadísticas y presupuestos: tendencias, categorías, límites y cierres.
12. Apariencia: claro azul/oro aprobado, oscuro opcional, tarjetas compactas y navegación rápida.

## Migración segura
- No importar indiscriminadamente los 762 registros de `fluxia_datos`: incluyen respaldos, espejos, papelera y configuraciones.
- Construir inventario de claves activas y traductor por módulo, preservando IDs y fechas originales.
- Solo lectura inicialmente y únicamente para usuario autenticado; contrastar cifras con PWA.
- No publicar Disponible nativo hasta conciliación de motor y dos meses.
- No tocar rama estable de PWA ni tablas de producción con escrituras durante la etapa de lectura.

## Entregables de aceptación
- Matriz HTML → iOS: funcionalidad, fuente de datos, pantalla, prueba, resultado.
- Pruebas de dos usuarios, meses, dispositivos, offline/online, re-login, importación y cero duplicados.
- Medición real de rendimiento; no prometer cifras no medidas.
- Build verificable, enlace de prueba y ZIP completo solo cuando existan.

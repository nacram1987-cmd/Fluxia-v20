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


## PARIDAD HTML MADRE OBLIGATORIA — 14/10/2026

El objetivo no es una app financiera distinta, ni una demo con datos aproximados: **es reproducir el 100 % de la semántica, datos, operaciones, bancos, estados y resultados del HTML/PWA operativo actual** y evolucionar por seguridad, mantenimiento, rendimiento y diseño. Un módulo visual sin CRUD/persistencia original NO está implementado.

**Caso de bloqueo P0:** el HTML muestra 51 Variables en octubre según revisión del usuario; CSV `fluxia-variables-Octubre.csv` exportó 52 filas / 811,39 €; no aparece el cargo del 14/10 de 7,50 € de gasolinera categorizado Tabaco. Existen seis repeticiones por campos de texto en CSV, SIN IDs bancarios: no suprimirlas ni asumir que son duplicados. Comparar registros reales por IDs, importes en céntimos, fechas, categorías, estados y vínculos, para mismo usuario/periodo/corte.

Los módulos nativos deberán superar paridad en Dashboard/Disponible, Ingresos, Variables, Fijos, Huchas, Compartidos, Financiaciones, Bancos, notificaciones y archivo. Ni `MonthlyLedgerProjection` ni `BankImportSafety` por separado equivalen todavía al motor HTML: requieren adaptación comprobada contra sus reglas originales y datos actuales. Mantener lecturas seguras, sin escrituras de producción ni nueva conexión bancaria paralela hasta pruebas completas.

Condiciones de publicación: 0 registros ausentes, 0 dobles contabilizaciones, 0,00 € de discrepancia contable, acceso usuario aislado, QA automatizada y Safari/iPhone real, copia reversible. Al entregar compilación, proporcionar versión, checklist de cambios y dónde comprobarlos, pruebas y limitaciones explícitas. La estable HTML continúa intacta.

## Cobertura que faltaba en el contrato SwiftUI: Dinero en mano y módulos auxiliares (14/10/2026)

- Dinero en mano: reproducir saldo físico histórico, movimientos de entrada/salida, salidas desde provisión, crear/editar/archivar y relación 1:1 con Variables (gastoId/efectivoId), sin segunda deducción del Disponible.
- Presupuestos: límites reales por categoría/mes; análisis: desglose y proyecciones calculados por motor HTML; Simulador: Disponible hipotético derivado solo de saldo real reconciliado.
- Pagos/Usos, Notificaciones y papelera: estados persistentes y de no-resurrección iguales a HTML, sin deduplicar por nombre/importe exclusivamente.
- Ajustes/Ayuda: perfiles, exportación segura, notificaciones globales y guías; mantener navegación compacta aprobada de Élite y logo oficial.
- Safari LAB v1.9.1 ya recupera las pantallas y lectores read-only, pero **NO equivale** a funcionalidad financiera nativa completa. El loader de cartera histórica no permite declarar saldo actual si fuente de octubre está obsoleta.
- Jamás importar backups de otro perfil, aunque compartan dispositivo; los ficheros manuales se procesan solo en memoria. Escribir en nube requiere QA explícita y comprobar mismos 51 movimientos variables de octubre y saldos idénticos.

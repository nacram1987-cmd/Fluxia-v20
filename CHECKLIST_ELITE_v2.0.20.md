# Fluxia Élite BETA v2.0.20

## Cambios

- El Disponible del mes actual ya no se calcula desde colecciones de nube sin cotejo reciente.
- Para el mes en curso requiere una copia HTML reciente (máximo 48 horas), validada para el mismo usuario y perfil, con las seis colecciones financieras y los usos de huchas.
- Cuando se carga esa copia, el cálculo usa esas colecciones en memoria. No sube el archivo, no sincroniza ni modifica movimientos de Supabase.
- Si falta la copia, el perfil no coincide, está caducada o le faltan colecciones, Inicio muestra **PENDIENTE** con la causa; nunca presenta como actual un saldo derivado de datos históricos de nube.
- La copia aporta el corte del HTML madre; la certificación integral sigue bloqueada hasta cotejar nube, CSV, banco e identificadores conforme al contrato.

## Evidencia del incidente

- Lectura de solo consulta de Supabase en el perfil activo: las siete colecciones consultadas tenían `updated_at` del 23/09/2026; la colección de movimientos solo contenía fechas hasta el 06/10/2026.
- En la captura del 15/10/2026 Élite mostraba −2.653,82 € desde esos datos y señalaba pendiente el cotejo con HTML. La cifra no se considera actual ni se conserva como resultado válido.
- No se modificaron asientos ni valores de la base de datos.

## Pruebas

- Regresión `lab/qa/elite-dashboard-provisional-available-v2020.cjs`: copia HTML reciente del mismo perfil habilita cálculo; el cálculo lee el snapshot HTML; cálculo cloud-only del mes actual queda bloqueado.
- Pruebas y publicación de GitHub Actions: pendientes de ejecución tras el commit.
- Verificación física en Safari/PWA: pendiente. No se cambia la entrada estable ni su service worker.

## Cómo probar

1. Abre la LAB y entra en tu perfil.
2. En el HTML operativo crea **Copia solo este perfil** hoy.
3. En Élite pulsa **Cargar HTML** y selecciona esa copia.
4. Inicio calculará el Disponible provisional con las fuentes del HTML en memoria; el distintivo de conciliación seguirá indicando lo que falte.

## Rollback

Restaurar `lab/fluxia-elite-safari-datos-reales.html` al commit padre, retirar el archivo de versión 2.0.20, su QA y este checklist, y restaurar las rutas de prueba/paquete del workflow. La raíz ESTABLE no se modifica.

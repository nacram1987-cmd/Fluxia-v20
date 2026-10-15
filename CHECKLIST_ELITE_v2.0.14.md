# Fluxia Élite BETA Safari v2.0.14

## Cambios

- **Bancos:** «Más → Bancos → Sincronizar bancos» consulta el conector Enable Banking con la sesión autenticada, guarda la bandeja por propietario y perfil y muestra los movimientos tras la sincronización y recargas.
- **Identidad bancaria:** usa la misma referencia estable `fxbank9770` de Fluxia para reconocer cargos ya existentes, con el hash de cuenta y el ID estable del proveedor. IDs de fallback no se consideran válidos para escribir.
- **Conciliación:** el preflight coteja la bandeja con Variables canónicas del perfil; marca nuevos, existentes, excluidos, conflictos y registros no verificables. No carga automáticamente cargos en el libro.
- **Disponible:** el motor en céntimos cubre ingresos, fijos con cargo enlazado, financiación, variables reales, provisión del mes, exceso de aportaciones, impacto de Compartidos y rescates temporales pendientes. No suma dos veces los cargos fijos vinculados.
- **Versión/archivo:** página, título, metadatos, changelog y snapshot corresponden a 2.0.14. No modifica HTML estable/PWA ni escribe datos en Supabase.

## Dónde probar

1. Iniciar sesión en Fluxia Élite y abrir **Más → Bancos**.
2. Pulsar **Sincronizar bancos**. Revisar conteo y lista de movimientos de Enable Banking.
3. Recargar, entrar con el mismo usuario/perfil y verificar que la bandeja se conserva.
4. Revisar en el preflight etiquetas «nuevo», «ya está en el ledger», excluido y conflicto.
5. En Inicio y **Auditoría y conciliación**, consultar Disponible/desglose. Si falta evidencia, el panel enumera los bloqueos; nunca inventa un total.

## QA ejecutada localmente

- Suite Élite offline: conector, estabilidad de sesión, preflight, reimportación/idempotencia, conflictos, motor Disponible, certificación, huchas, paridad de módulos y separación de cuenta.
- Smoke sintético de módulos: 17/17.
- Cartera y provisiones: 33 invariantes.
- Importación de copia privada: 16/16.
- Sintaxis de todos los scripts inline y `git diff --check`.
- Identidad de referencia comparada con `AUDITORIA_ELITE/banco/identity9770.js` y el mapeo del Edge `Fluxia-banco`.

## Pendiente de verificar fuera de CI

- Flujo real de la pantalla en Safari/iPhone y pantalla de inicio.
- Relectura bancaria en la cuenta de usuario: CaixaBank puede responder HUB046 por límite diario; Revolut y el permiso bancario dependen del proveedor.
- La cifra de Disponible del perfil real requiere el snapshot HTML y CSV del mismo usuario/periodo y movimientos del libro conciliados. Sin ello, Élite muestra «Pendiente» con los datos que faltan.
- No se ha ejecutado importación contable automática ni escritura de datos financieros; PWA/HTML estable permanece aparte.

## Evaluación honesta

- Flujo de sincronización y bandeja local: QA sintética aprobada; falta sesión manual real.
- Identidad/dedupe: cobertura sintética aprobada; fallback sin ID estable bloqueado.
- Fórmula del motor: cobertura cent-exact aprobada; paridad integral perfil a perfil pendiente de HTML/CSV del mismo corte.
- iPhone Safari y PWA: NO VERIFICADOS.
- Rollback: devolver el enlace a la versión anterior (2.0.11) desde el commit anterior; la rama estable no se toca.

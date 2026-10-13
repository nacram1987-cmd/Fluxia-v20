# Cierre de ejecución autorizada · v97.70

Autorización expresa del usuario: «Yo lo autorizo todo» el 13/10/2026. Incluye RLS/RPC y correcciones bancarias sensibles con respaldo/pruebas; no se interpretó como la frase de promoción «con labora».

SEC-01/02: aplicadas por migración elite_contacts_rls_and_invitation_auth_20261013. Respaldos de definición/grants/políticas en seguridad/. RLS=true, anon_execute=false, auth_execute=true, search_path fijo. Esquema sintético con roles anon/authenticated y auth.uid real reproduce exposición y falso éxito antes; nueve asserts pasan después. Se eliminó esquema de QA. Sin filas privadas consultadas ni modificadas. Advisors ya no reporta RLS desactivado ni RPC ejecutable por anon.

BANK-01/02/03: 14 tests ampliados pasan. Identidad nueva namespaced; bancoRef antiguo se conserva y su alias se guarda aparte por perfil con respaldo reversible, sin reescribir registros financieros antiguos. Dos bancos/dos cuentas mismo ID no colapsan. Backend aislado proporciona digest de cuenta y referencia estable; transaction_id se considera dato de detalle, no identificador inmutable. API sin sesión/token inválido responde 401. Funciones anteriores conservadas. Datos sin identificación suficiente nunca se fusionan a ciegas; quedan advertidos para revisión.

NOTIF-01: se retiró propietario duplicado y emisión directa; un evento, un ledger por usuario y un canal visible/sistema. Diez eventos repetidos no duplican; cambio A/B no cruza avisos. Tombstones reales de la app no purgan cargos iguales de otra cuenta.

FIN/CLOUD/UX: finanzas y lógica original equivalentes salvo adapter scoped de archivo. 20 ciclos, 400 filas, meses históricos, aporte/exceso, transfers propios, merge remoto reciente/vacío y diez tombstones. A/B almacenamiento local real de la app reconstruye cada namespace; backend handler A/B sintético filtra por user_id. Sin redescribirlo como ensayo de dos iPhones o tokens PSD2 reales.

PERF: fase inicial retenida por diferencias de host; módulo ahora getter lazy y comparación controlada. Valores y rondas en BASELINE_RENDIMIENTO_v97.70.md/logs. No añadir consultas/listeners globales/timers para simular rapidez. El gate de promoción física se mantiene.

PUB/PWA: LAB bajo lab/v97.70.html y lab/v97.70/index.html con manifiesto/worker propios. Raíz, workers estables, lab/v97.68 y snapshots protegidos deben continuar con mismos hashes. GitHub → QA completa → deploy-pages → HTTP/version/recursos → ZIP y prerelease. No promoción estable.

Rollback LAB: volver a v97.69 (o referencia v97.68); ninguna entrada estable se sustituyó. Backend previo permanece disponible. Identidad solo añadió metadata respaldada, no renumeró referencias antiguas ni alteró importes. Rollback de seguridad solo explícito y con los grants/definición capturados; desactivar RLS reabriría el riesgo, no se automatiza.

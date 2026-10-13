# Fluxia v97.70-LAB · identidad bancaria y seguridad comprobable

Se conserva PWA estable, v97.68 y todas las referencias. Nueva LAB independiente; no promoción a raíz.

- Corregidas falsas fusiones: cargos distintos no desaparecen por mismo día/importe/comercio. 400 cargos y diez reimportaciones preservan total.
- Identidad por proveedor/cuenta/referencia estable. Se conserva bancoRef legado; se registra su alias en un registro separado por perfil, con checkpoint reversible, sin modificar el movimiento ni su fecha de revisión. Los IDs de detalle no se usan como referencia inmutable.
- Cuenta estable por digest de IBAN o hashes de identificación; UID como último recurso, con revisión explícita ante cambios de consentimiento ambiguos. No se envía IBAN al cliente.
- Archivo/blacklist por identidad: borrar un cargo no borra otro pago de otra cuenta con mismo importe/día. Rechazos históricos se respetan; datos sin identificación suficiente se preservan y se advierte el conflicto, sin inventar una asociación.
- Un solo propietario del aviso: eliminado listener legacy y llamadas directas duplicadas. Un aviso por cargo/usuario, persistido; un canal visible o sistema según estado. La entrega de push en iPhone aún no se ha ensayado.
- Motor de Disponible, presupuestos, aportaciones, rescates, compartidos y persistencia sin cambios de fórmula. Financieramente 1000 − 70 − 30 = 900; cargo real 73 deja 897 y gasto realizado 103. Hucha prevista 50 con aportes 20/50/80 descuenta 50/50/80.
- Seguridad autorizada aplicada: RLS Contactos activo, RPC solo destinatario autenticado y éxito real/idempotente. Se probaron dos vulnerabilidades antes y nueve invariantes después en esquema sintético eliminado; sin lectura/escritura de filas de usuarios reales.
- Backend LAB independiente Fluxia-banco-lab9770. Funciones anteriores no se sobrescribieron. Las peticiones sin sesión/credencial válida reciben 401 y no consultan el banco.
- Caché/manifiesto LAB propios bajo /lab/v97.70/. Instalación estable intacta, sin borrado de datos ni reinstalación.

## Pruebas y límites
14 pruebas bancarias ampliadas; handler completo A/B simulado; finanzas, archivo, nube merge/tombstones, sesiones locales A/B, 20 ciclos navegación, benchmark repetido y publicación HTTP por hashes. Cada resultado en AUDITORIA_ELITE/logs. Fuentes normativas del proveedor: https://enablebanking.com/docs/faq/ y https://enablebanking.com/docs/api/reference/ .

No son pruebas PSD2 vivas con tokens de usuarios ni de Safari físico. No se modifica un saldo real por deducción; casos antiguos ambiguos permanecen pendientes de revisión y se pueden registrar/corregir en los módulos existentes, con historial y backup. No se promete instantaneidad si el proveedor limita consultas. Se recomienda comprobar LAB en Safari antes de cualquier promoción.

LAB: https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.70.html
PWA LAB aislada: https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.70/index.html
ESTABLE intacta: https://nacram1987-cmd.github.io/Fluxia-v20/
Referencia de velocidad: https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.68.html

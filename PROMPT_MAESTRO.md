# 📋 PROMPT MAESTRO FLUXIA v93.8.2+
## Biblia de desarrollo, versionado, QA y entrega profesional

## Adenda Élite v2.0.18 — Disponible visible provisional (15/10/2026)

Inicio debe mostrar el importe de Disponible mensual cuando las colecciones canónicas e importes base están completos, aunque la paridad integral HTML/Supabase siga sin certificarse. Rotularlo **PROVISIONAL** y exponer con claridad qué cotejos faltan. Un rescate temporal con referencia explícita conflictiva, hucha ambigua, ID de operación duplicado, fecha/importes inválidos o reposiciones inconsistentes no se suma. Si no hay referencia ID pero el nombre de hucha coincide exactamente con una sola provisión y el uso tiene ID único, fecha válida e importe/reposiciones verificables, puede incluirse como provisional y el certificado permanece bloqueado hasta vincular por ID y cotejar el mismo perfil/corte. No hardcodear saldos ni escribir datos financieros por presentar la cifra. Disponible mensual y saldos bancarios son métricas independientes.

## Adenda Élite v2.0.06 — cotejo de cartera y separación de fuentes (15/10/2026)

Dinero en mano debe permitir cotejar, en modo de solo lectura, una copia privada validada del HTML operativo contra la colección nube del mismo perfil. Comparar movimientos por ID, fecha, tipo, importe exacto en céntimos, concepto, categoría y vínculos a variables/provisiones. Mostrar operaciones solo HTML, solo nube, mismo ID con campos distintos, IDs repetidos/sin ID y diferencia entre saldos históricos. En cada discrepancia del mismo ID se muestran ambos lados. Una copia ausente no significa saldo cero. Si cualquiera de las dos fuentes tiene avisos por importes inválidos o tipos desconocidos, mostrar los avisos y no certificar paridad aunque los snapshots coincidan.

El cotejo no fusiona, repara, importa ni escribe movimientos, y no convierte el efectivo en Disponible. El HTML madre sigue siendo el lugar operativo para meter, gastar o usar efectivo mientras Élite no tenga escritura idempotente certificada. Etiquetar saldos como instantánea histórica, nunca como confirmación de efectivo de hoy. Mantener el acceso exacto por usuario/perfil y limpiar toda copia al cambiar de sesión.

Huchas mantienen sus fuentes separadas: vista «HTML original» lee la copia privada exacta del perfil; vista «Nube Supabase» calcula solo con provisiones y usos de nube. No cruzar una aportación de una fuente con un rescate de otra. Seguir mostrando discrepancias entre fuentes sin importarlas ni alterar históricos. En el resumen de Huchas, mostrar «Pendiente de reponer» separado del saldo reservado y solo sumar usos temporales con reposiciones verificadas; si falta integridad, dejar la cifra sin certificar. El historial/cambios operativos continúan en el HTML hasta certificar paridad y persistencia.


## Adenda Élite v2.0.05 — gestión visual de provisiones y trazabilidad por hucha (15/10/2026)

La pantalla Huchas debe conservar la jerarquía del HTML: acción visible «Crear nueva provisión», tarjetas compactas con icono original, detalle financiero y acción «Historial de esta provisión». El historial se abre por hucha y conserva aportaciones por año/mes, rescates, reposiciones, fechas, identificadores y estado. La creación y edición real deben conservar el perfil, la sincronización y los controles de duplicados del HTML hasta que Élite tenga una escritura equivalente certificada.

## Adenda Élite v2.0.04 — rescates de huchas y cotejo de fuentes (15/10/2026)

El HTML original guarda los retiros en `v2_usos` y habitualmente referencia la hucha por el campo `provision` (nombre). Élite debe reconocer un nombre normalizado exacto solo cuando identifica una única hucha. El saldo así reconstruido se presenta como provisional y conserva la trazabilidad del ID de uso, tipo, importe, fecha y reposiciones. Un nombre ambiguo, una fuente ausente, un ID repetido o un registro incompleto bloquean el agregado; nunca se deduce un rescate de una cifra aproximada.

En Huchas, cotejar `v2_usos` de la copia «Copia solo este perfil» del HTML y de Supabase por ID y campos financieros. Mostrar las operaciones ausentes y diferentes sin importarlas ni escribir en ninguna fuente. La copia debe proceder del mismo perfil y momento de corte para aspirar a certificar los saldos. Mantener bloqueada la creación de rescates en Élite mientras no se certifiquen persistencia, no duplicación, Disponible y paridad con el HTML operativo. El HTML estable permanece intacto.

## Adenda Élite v2.0.03 — Huchas por periodo y símbolo original (15/10/2026)

- Mostrar separado: aportado en el mes seleccionado, aportado hasta ese mes, aportado de todo el histórico, saldo reconstruido al cierre del mes y saldo reconstruido de toda la vida. Las reposiciones se atribuyen por su propia fecha, no por la fecha del retiro.
- Agrupar aportaciones verificables por `YYYY-MM` derivado de la fecha real. Un mismo nombre de mes de años distintos no se fusiona. Si el contenedor mensual original discrepa de la fecha, bloquear la certificación de esa hucha.
- Reutilizar la precedencia de `PV_ICONOS`/`iconoProvision` del HTML madre para el símbolo de cada hucha; no lanzar búsqueda externa de logotipo comercial en esas tarjetas.
- Mantener la vista mensual dentro de un desplegable separado del botón Detalle. El total reconstruido se rotula provisional mientras falte cotejo con el HTML operativo; el Disponible real certificado permanece sin cifra.
- La funcionalidad original de aportar, usar, rescatar, editar y recuperar continúa pendiente de portabilidad segura a Élite. Ninguna presentación de este release autoriza escrituras bancarias o promoción a estable.

## Adenda Élite v2.0.02 — ausencia de fuente ≠ cero (15/10/2026)

- Una hucha sin objeto `aportaciones` no representa un saldo cero: mostrar fuente ausente y bloquear saldo, aportado mensual y retiros no verificables. Un objeto `aportaciones: {}` explícito sí permite un historial de aportación vacío si existe también la fuente de usos.
- No mostrar pendiente mensual calculado con aportaciones de un mes incompleto. Si hay dos campos de provisión prevista distintos, un importe con más de dos decimales o un campo no numérico, ocultar prevista y pendiente y marcar conflicto.
- En un desglose bruto, una hucha con aportaciones defectuosas muestra «Por conciliar», nunca 0 € inferido. Conservar la hucha verificable independiente y bloquear el agregado.
- La copia HTML operativa continúa siendo el oráculo hasta una comparación mismo usuario/perfil/periodo/corte. No activar contabilidad bancaria ni promover a estable.

## Adenda Élite v2.0.01 — fechas y reposiciones bajo conflicto (15/10/2026)

- No atribuir aportaciones o usos a un mes con una fecha de calendario imposible. Los importes pueden inspeccionarse, pero la hucha afectada y el agregado no se certifican.
- Un uso archivado/anulado no cuenta como retiro vigente en el balance reconstruido mientras no se demuestre su semántica original. Conservar su incidencia visible.
- Cada reposición debe tener ID, fecha válida e importe exacto en céntimos. Si se repite su ID en dos usos, marcar ambas huchas en conflicto y bloquear el agregado; el resumen `repuesto` sigue siendo control y nunca una segunda entrada de dinero.
- La paridad real con el HTML operativo y las puertas de seguridad/bancos/Disponible siguen pendientes. Élite permanece separada de la estable.

## Adenda Élite v2.0.00 — conciliación individual sin mezclar fuentes (15/10/2026)

- Cada tarjeta de Huchas emplea los usos de su propia fuente: copia HTML con copia HTML, Supabase con Supabase. No mezclar importes entre ellas ni entre perfiles.
- Un uso sin referencia original puede asociarse por nombre solo si coincide de forma exacta normalizada con una única hucha y no hay referencias contradictorias. El saldo resultante se etiqueta **provisional**; no certifica el Disponible.
- Duplicados, importes no expresables en céntimos, historiales ocultos, usos archivados y referencias ambiguas bloquean la certificación de la hucha afectada. Una incidencia aislada no oculta las demás huchas verificables. El agregado queda bloqueado mientras haya cualquier incidencia.
- Los importes reconstruidos por registros todavía necesitan cotejo con el HTML operativo en el mismo perfil, periodo y corte. Siguen prohibidas escrituras financieras nuevas, importación bancaria contable y promoción a la estable sin las puertas de paridad, seguridad, rendimiento y pruebas físicas.
- La versión 2.0.00 identifica una iteración BETA, no una certificación de banca, nube ni uso comercial.

## Adenda Élite v1.9.99 — cierre de sesión comprobable (15/10/2026)

- Cerrar sesión elimina de inmediato el estado privado y el refresh token locales; en segundo plano solicita a Supabase revocar **solo la sesión actual** (`scope=local`), sin cerrar otros dispositivos.
- Si la red o Auth no confirma la revocación, mostrar la incertidumbre al usuario. Un access token previamente emitido puede seguir siendo válido hasta su expiración; no afirmar revocación instantánea de JWT.
- La QA histórica de v97.73 compara contra su commit de origen y protege aparte los bytes actuales: mantiene la assertion de 168 scripts y cambios financieros originales sin confundir hotfixes visuales posteriores. Élite v2.0.00 requiere evidencia de paridad, seguridad y pruebas físicas, no solo un número.

## Adenda Élite v1.9.98 — protección de estable y avisos honestos (15/10/2026)

- La base histórica v97.66 y el `index.html` estable actual son artefactos distintos: verificar cada uno con su SHA sin cambiar el histórico ni alterar el HTML estable. La huella actual de la estable se fijó desde el commit previo `145560c16df8c0ce0902daacbb20ffb634a04bc7`.
- Un fallo de QA no equivale a una publicación abortada mientras GitHub Pages tenga una fuente de despliegue independiente. Informar ambos estados por separado y no proclamar certificación.
- Una campana no señalará avisos pendientes por defecto: mostrar estado de no leídos solo tras verificar la cola real. No duplicar navegación superior e inferior.
- El workflow de validación de Élite no publicará ni sobrescribirá un release histórico v97.73 al validar versiones de la serie v1.9.x.

## Adenda Élite v1.9.97 — evidencia antes de certificar (15/10/2026)

- La cabecera de Élite agrupa icono y nombre en un único bloque central; Salir pertenece a Ajustes y no compite con la marca. Las pestañas inferiores continúan siendo la navegación principal.
- Un error de red/servidor al renovar Auth no borra la sesión recordada. Un token inválido o de otra identidad sí bloquea el acceso; un fallo posterior de carga deja la sesión autenticada con reintento seguro.
- La transición entre cuentas limpia primero todo estado privado en memoria. El cierre local actual **no equivale a revocación de servidor**; no afirmar lo contrario.
- Interpretar los advisors de Supabase con el catálogo y código real: RLS activo sin políticas bloquea acceso directo; un aviso `SECURITY DEFINER` exige revisar la función, no prueba automáticamente una fuga.
- No promover Élite, habilitar escrituras financieras ni declarar aislamiento comercial hasta comparar HTML y Élite al mismo corte, probar dos usuarios reales de QA y verificar Edge/RLS y recuperación. La estable permanece intacta sin orden de promoción.
- Cada versión debe alinear título, metadato, runtime y marca, comprobar bytes HTTP de Pages y documentar pruebas no ejecutadas. Ver `AUDITORIA_ELITE/RECTIFICACION_Y_AVANCE_v1.9.97.md`.

**Versión de este documento:** 3.0  
**Aplicable desde:** index_fluxia_v93.8.2.html en adelante  
**Último revisado:** 29 Septiembre 2026  
**Responsable:** Arquitectura de Fluxia para NO volver a fallar

---

## 🎯 PROPÓSITO

Cualquier cambio en Fluxia debe:
1. Respetar versionado secuencial (**v91 → v91.1 → v92…**)
2. Badge + título + `FLUXIA_VERSION` + nombre de archivo coherentes
3. **Pasar checklist de regresiones CON QA REAL** (NO superficial)
4. Incluir **REAL ASSESSMENT** crítico (no marketing)
5. Entregar **ZIP estructurado** siempre (prompt + enlaces + docs)
6. Cuadrar datos **AL 100%** (papelera, ingresos, sincronización)

---

## 🏷️ IDENTIDAD DE MARCA (INQUEBRANTABLE)

Al añadir a pantalla de inicio / PWA:

| Campo | Valor FIJO |
|-------|------------|
| Nombre visible | **Fluxia BETA** |
| `apple-mobile-web-app-title` | **Fluxia BETA** |
| `application-name` | **Fluxia BETA** |
| `manifest.name` / `short_name` | **Fluxia BETA** |
| Icono | **Logo oficial** (gradiente azul + curvas infinity). NUNCA la «F» teal genérica |

```
❌ JAMÁS cambiar el logo al generar apple-touch-icon / manifest
❌ JAMÁS poner solo «Fluxia» sin BETA en el nombre de instalación
❌ JAMÁS icono con letra F sobre fondo plano como identidad principal
✅ SIEMPRE logo oficial SVG/PNG + «Fluxia BETA»
```

---

## 💾 INTEGRIDAD DE DATOS (VITAL — JAMÁS A 0)

**Problema histórico:** tras un tiempo, sync, o recarga, listas (movimientos, ingresos, fijos, compartidos…) aparecen a 0.

**Regla absoluta:**

```
❌ JAMÁS movimientos = [] si antes había datos (salvo plan nuevo EXPLÍCITO)
❌ JAMÁS guardarLS(key, []) cuando en storage había items
❌ JAMÁS sustituir por remoto vacío / backup vacío / merge agresivo
✅ Si actual.length === 0 && prev.length > 0 → CONSERVAR prev + registrar en auditoría
✅ Snapshot periódico de claves críticas (FluxiaProtegerDatos)
✅ Confirmar con el usuario solo el vaciado intencional de plan
```

Claves protegidas:
- `planRescate_v2_movimientos`
- `planRescate_v2_ingresos`
- `planRescate_v2_fijos`
- `planRescate_v2_provisiones`
- `planRescate_v2_financiaciones`
- `planRescate_v2_compartidos`
- `planRescate_v2_config_plan`

---

## 🔢 VERSIONADO

```
Archivo:   index_fluxia_v91.html
Title:     Fluxia BETA v91
Meta:      content="v91"
JS:        window.FLUXIA_VERSION = "v91"
Badge:     BETA v91
Checklist: Checklist v91 (en Ayuda)
```

Secuencia: v91 → v91.1 / v92… **sin saltos**.  
Cada instalación debe poder verse en Ayuda con **checklist de ESA versión**.

---

## 📦 ESTRUCTURA DE ENTREGA (NUEVO v3.0)

### **JAMÁS entregar versión sin ZIP estructurado**

Cada release debe incluir:

```
fluxia_v93.X.X_RELEASE.zip
│
├── 📄 index_fluxia_v93.X.X.html
│   ├─ HTML limpio (validado con qa_audit_v93.X.X.py)
│   ├─ Todos los 5 puntos de versioning sincronizados
│   └─ Production-ready
│
├── 📋 PROMPT_MAESTRO_FLUXIA_vXX.XX.md (COPIA ACTUALIZADA)
│   ├─ Con reglas aplicadas en esta versión
│   ├─ Nuevas restricciones QA si las hay
│   ├─ Checklist de bugs corregidos
│   └─ Real assessment template
│
├── 🔗 ENLACES_CLIENTE.txt (NUEVO)
│   ├─ URL ESTABLE: para usuarios finales
│   │   └─ https://nacram1987-cmd.github.io/Fluxia-v20/
│   │   └─ Siempre apunta a versión probada + estable
│   │
│   ├─ URL LAB: para testing / desarrolladores
│   │   └─ https://nacram1987-cmd.github.io/Fluxia-v20/?lab=v93.X.X
│   │   └─ Última versión en development
│   │
│   ├─ Instructions para amigos:
│   │   ├─ "Usa ESTABLE para datos reales"
│   │   ├─ "LAB solo si quieres probar cosas nuevas"
│   │   └─ "Reporta bugs en [CANAL]"
│
├── 📊 REAL_ASSESSMENT_v93.X.X.md
│   ├─ Análisis CRÍTICO (no marketing)
│   ├─ Qué sigue sin funcionar
│   ├─ Limitaciones conocidas
│   ├─ Security score HONESTO
│   ├─ Performance metrics reales
│   └─ Roadmap sincero
│
├── ✅ QA_CERTIFICATION.txt
│   ├─ Checks passed/failed
│   ├─ Bugs arreglados documentados
│   ├─ Bugs CONOCIDOS abiertos
│   └─ Approval signature
│
├── 🔒 SECURITY_AUDIT.md
│   ├─ Cifrado implementado
│   ├─ Vulnerabilidades conocidas
│   ├─ Rate limiting activo
│   ├─ GDPR compliance status
│   └─ PSD2 roadmap
│
├── 📖 RELEASE_NOTES.md
│   ├─ Changelog formal
│   ├─ Before/after visuals
│   ├─ Installation steps
│   └─ Troubleshooting
│
└── 📁 /js (si hay módulos nuevos)
    ├── fluxia-security-core.js
    ├── fluxia-session-security.js
    └── [otros módulos]
```

### **¿Por qué ZIP siempre?**

✅ Cliente tiene documentación + código junto  
✅ Fácil distribuir a amigos/inversores  
✅ Versionado claro (ZIP name = versión)  
✅ Histórico de releases accesible  
✅ Prompt maestro disponible para referencia  
✅ Enlaces LAB/ESTABLE claros en un archivo  

---

## 🎓 REAL ASSESSMENT (NUEVO v3.0)

### **Obligatorio en CADA release**

En lugar de marketing aspiracional, documento que:

#### **1. Sección: Lo Bueno ✅**
```markdown
### ✅ Lo que funciona perfectamente

- [x] Ingresos: carga y sincroniza al 100%
- [x] Gastos variables: registra y categoriza bien
- [x] Compartidos: cuadre correcto (deudas, pagos)
- [x] Exportación: JSON/CSV limpio
- [x] Seguridad: encriptación activa
```

**¿Por qué?** Para que el usuario CONFÍE en las funciones que SÍ funcionan.

#### **2. Sección: Lo Que No Funciona ❌**
```markdown
### ❌ Limitaciones HONESTAS

- [ ] Papelera: NO recibe archivos de Bank sync
  Status: ABIERTO
  Impacto: Media (usuario puede borrar manual)
  Fix ETA: v93.9 (semana del 6 de octubre)
  
- [ ] Ingresos recibidos: NO cargan automático
  Status: ABIERTO
  Impacto: Alta (critical para cuadre)
  Fix ETA: v93.9 (HIGH PRIORITY)
  
- [ ] RLS en Supabase: NO activo
  Status: PENDIENTE
  Impacto: Alta (seguridad)
  Fix ETA: v94 (Phase 2, ~4 semanas)
```

**¿Por qué?** Usuario SABE qué esperar. No hay sorpresas.

#### **3. Sección: Roadmap Crítico**
```markdown
### 🚗 Bugs críticos en desarrollo

| Bug | v93.8.2 | v93.9 | v94 |
|-----|---------|-------|-----|
| Papelera | ❌ Open | ✅ Fixed | - |
| Ingresos auto | ❌ Open | ✅ Fixed | - |
| RLS BD | ❌ Blocked | ⏳ Backend | ✅ |
| PSD2 tokens | ❌ Blocked | ⏳ Backend | ✅ |
```

**¿Por qué?** Usuario ve que hay PLAN. No es caótico.

#### **4. Sección: Confianza & Competencia**
```markdown
### 📊 Métricas REALES

**Security:**
- Encryption: 95/100 (falta RLS en BD)
- Authentication: 85/100 (falta 2FA backend)
- Overall: 90/100

**Performance:**
- Load time: 1.8s (bueno)
- Sync speed: 2-3s (aceptable)
- Battery impact: Low (muy bueno)

**Usability:**
- Onboarding: 8/10 (claro, pero 2 pasos innecesarios)
- Data entry: 9/10 (muy fluido)
- Compartidos UI: 7/10 (complejo para nuevos)

**Cuadre de datos:**
- Gastos: ✅ 100%
- Ingresos: ❌ 85% (falta automático)
- Compartidos: ✅ 100%
- Papelera: ❌ 40% (bugs)
```

**¿Por qué?** Números honestos = credibilidad.

---

## 🎯 CHECKLIST QA CRÍTICO (NUEVO v3.0)

### **JAMÁS RELEASE SIN 100% PASS**

```
NIVEL 1: ESTRUCTURA HTML
├─ [ ] 1 <html> tag
├─ [ ] 1 <head> tag
├─ [ ] 1 <body> tag
├─ [ ] Sin tags sueltos
├─ [ ] Versioning sincronizado (6 refs)
└─ [ ] Manifest.webmanifest referenciado

NIVEL 2: DATOS CRÍTICOS
├─ [ ] Movimientos NO desaparecen tras recarga
├─ [ ] Ingresos carga automático de banco ← FIX EN v93.9
├─ [ ] Papelera recibe archivos borrados ← FIX EN v93.9
├─ [ ] Compartidos cuadran al 100%
├─ [ ] Fijos se descuentan correctamente
└─ [ ] Provisiones se usan cuando deben

NIVEL 3: SINCRONIZACIÓN
├─ [ ] Bank sync NO duplica movimientos
├─ [ ] Bank sync NO borra legítimos
├─ [ ] Cloud sync preserva datos
├─ [ ] Export/Import cuadra al 100%
└─ [ ] Backup restaura en estado idéntico

NIVEL 4: SEGURIDAD
├─ [ ] No XSS en inputs
├─ [ ] PIN rate limiting activo
├─ [ ] Session timeout 30min
├─ [ ] Encriptación AES-256-GCM
└─ [ ] Audit log signed SHA-256

NIVEL 5: UX/VISUAL
├─ [ ] Sin elementos duplicados
├─ [ ] Sin overlaps
├─ [ ] Dashboard limpio
├─ [ ] Mobile responsive
├─ [ ] PWA instala correctamente
└─ [ ] Icons render bien

NIVEL 6: COMPLIANCE
├─ [ ] GDPR export/delete
├─ [ ] OWASP Top 10 checked
├─ [ ] NIST guidelines followed
├─ [ ] No hardcoded secrets
└─ [ ] Privacy policy updated
```

---

## ⚠️ BUGS CRÍTICOS ABIERTOS (v93.8.2 Status)

### **PAPELERA NO RECIBE ARCHIVOS** ❌

**Problema:**
- Cuando borras un movimiento, NO va a papelera
- Cuando borras ingreso, NO va a papelera
- Cuando vacías mes, NO va a papelera
- La sección "Papelera" siempre muestra vacía

**Impacto:** MEDIA (el usuario puede borrar = datos perdidos)

**Síntomas:**
```
Usuario borra movimiento "Mercadona -50€"
  ↓
App muestra: "Borrado ✓"
  ↓
Papelera abierta: VACÍA (debería mostrar "Mercadona -50€")
  ↓
30 días después: datos desaparecen (no recuperable)
```

**Root Cause:**
- `fluxia_papelera_v1_<userid>` NO se actualiza al borrar
- Función `addToPapelera()` NO se llama
- O localStorage key está corrompida

**Fix Plan (v93.9):**
```javascript
// Cuando se borra:
ANTES:
  movimientos.splice(index, 1);
  guardarLS('planRescate_v2_movimientos', movimientos);

DESPUÉS:
  const deleted = movimientos[index];
  addToPapelera('movimiento', deleted, new Date());
  
  papelera = cargarLS('fluxia_papelera_v1_' + userID) || [];
  papelera.push({
    tipo: 'movimiento',
    data: deleted,
    fecha_borrado: new Date(),
    recovery_hasta: new Date(Date.now() + 30*24*60*60*1000)
  });
  guardarLS('fluxia_papelera_v1_' + userID, papelera);
  
  movimientos.splice(index, 1);
  guardarLS('planRescate_v2_movimientos', movimientos);
```

**Testing v93.9:**
```
[ ] Borrar movimiento → aparece en papelera
[ ] Borrar ingreso → aparece en papelera
[ ] Borrar fijo → aparece en papelera
[ ] Borrar compartido → aparece en papelera
[ ] Restaurar desde papelera → vuelve con datos intactos
[ ] 30 días: se limpia automático
[ ] Papelera > 50 items: limpia automático
```

---

### **INGRESOS RECIBIDOS NO CARGAN AUTOMÁTICO** ❌

**Problema:**
- Ingresos de banco (transferencias, nómina) NO se sincronizan automáticos
- Usuario tiene que agregar manual cada ingreso
- Dinero "desaparece" de la realidad hasta que lo agrega manual

**Impacto:** ALTA (afecta cuadre total del mes)

**Síntomas:**
```
CaixaBank muestra: Saldo +1500€ (nómina recibida)
  ↓
Fluxia muestra: Disponible sin cambio
  ↓
Usuario agrega manual: "+1500 nómina"
  ↓
Finalmente cuadra
```

**Root Cause:**
- `FluxiaBancoSync.sync()` NO obtiene ingresos
- O endpoint banco NO devuelve "creditos"
- O mapeo de "tipo" NO incluye ingresos

**Fix Plan (v93.9):**
```javascript
// Sync bancario

// ANTES (incompleto):
FluxiaBancoSync.sync = async function() {
  const txn = await banco.getTransactions();
  // Solo toma débitos (gastos)
  txn.filter(t => t.amount < 0).forEach(t => {
    addMovimiento(t);
  });
}

// DESPUÉS (completo):
FluxiaBancoSync.sync = async function() {
  const txn = await banco.getTransactions();
  
  // GASTOS (débitos)
  txn.filter(t => t.amount < 0).forEach(t => {
    addMovimiento({
      concepto: t.description,
      importe: Math.abs(t.amount),
      tipo: 'gasto_variable',
      fecha: t.date,
      origen: 'banco'
    });
  });
  
  // INGRESOS (créditos) ← NUEVO
  txn.filter(t => t.amount > 0).forEach(t => {
    // Detectar tipo automático
    const tipo = detectarIngreso(t.description);
    addIngreso({
      concepto: t.description,
      importe: t.amount,
      tipo: tipo, // 'nómina', 'freelance', 'otro'
      fecha: t.date,
      origen: 'banco'
    });
  });
}

// Helper: detectar tipo de ingreso
function detectarIngreso(concepto) {
  const lower = concepto.toLowerCase();
  
  if (lower.includes('nómina') || 
      lower.includes('salario') ||
      lower.includes('empresa') ||
      lower.includes('sueldo')) {
    return 'nómina';
  }
  
  if (lower.includes('freelance') ||
      lower.includes('proyecto') ||
      lower.includes('factura')) {
    return 'freelance';
  }
  
  if (lower.includes('inversión') ||
      lower.includes('dividendo') ||
      lower.includes('interés')) {
    return 'inversión';
  }
  
  return 'otro';
}
```

**Testing v93.9:**
```
[ ] Nómina de banco: se agrega automático como 'nómina'
[ ] Transferencia personal: se agrega como 'otro'
[ ] Dividendos: se detectan como 'inversión'
[ ] Concepto se preserva exacto del banco
[ ] Fecha es exacta
[ ] Importe está positivo (sin negativos)
[ ] No duplica si sync dos veces mismo día
[ ] Cuadre total = banco.saldo (100%)
```

---

## ✅ CUADRE AL 100% (NUEVO v3.0)

**Regla de oro:**

```
CADA MES DEBE CUADRAR:

Disponible HOY = 
    Saldo inicial + Ingresos totales - Gastos totales + Ahorros - Deudas
    
Ejemplo:
    Saldo inicial: 2000€
    + Nómina: 1500€ ✅ (debe cargar automático)
    + Otro ingreso: 100€ ✅
    - Gastos variables: 850€ ✅
    - Fijos: 400€ ✅
    - Provisiones: 100€ ✅
    - Compartidos ME DEBEN: +150€ ✅
    - Compartidos DEBO: -200€ ✅
    ──────────────────
    = Disponible hoy: 2200€ ✅ (100% match con banco)
```

**Auditoría:**
```
function auditarCuadre() {
  const saldoInicial = config.saldo_inicio_mes;
  const ingresos = sumArray(cargarLS('planRescate_v2_ingresos'));
  const gastosVar = sumArray(cargarLS('planRescate_v2_movimientos'));
  const fijos = sumArray(cargarLS('planRescate_v2_fijos'));
  const provisiones = sumArray(cargarLS('planRescate_v2_provisiones'));
  
  const compartidos = cargarLS('planRescate_v2_compartidos') || [];
  const saldoCompartido = compartidos.reduce((sum, c) => {
    if (c.tipo_deuda === 'me_deben') return sum + c.neto;
    if (c.tipo_deuda === 'debo') return sum - c.neto;
    return sum;
  }, 0);
  
  const esperado = saldoInicial + ingresos - gastosVar - fijos - provisiones + saldoCompartido;
  const real = cargarLS('saldo_actual_hoy') || saldoInicial;
  
  const diferencia = Math.abs(esperado - real);
  
  if (diferencia > 0.01) {
    console.error('⚠️ CUADRE INCORRECTO', {
      esperado,
      real,
      diferencia,
      debug: {
        saldoInicial,
        ingresos,
        gastosVar,
        fijos,
        provisiones,
        saldoCompartido
      }
    });
    return false;
  }
  
  console.log('✅ CUADRE CORRECTO al 100%');
  return true;
}

// Ejecutar en:
// - Cada sync bancario
// - Cada mes nuevo
// - Cada exportación
// - Setup wizard
```

---

## 🌐 CANAL ESTABLE vs LAB (ACTUALIZADO v3.0)

**Mientras desarrollas:**

| Enlace para la gente | Qué es | Quién usa |
|----------------------|--------|----------|
| `https://nacram1987-cmd.github.io/Fluxia-v20/` | **Único enlace ESTABLE** | Clientes finales, amigos |
| `?lab=v93.X.X` | **LAB/development** | Tú, testers, desarrolladores |
| Controlado por `fluxia-canal.json` → campo `estable` | Qué HTML carga | Sistema de versioning |

```
✅ Clientes: SIEMPRE index.html (que redirige a ESTABLE)
✅ Amigos: pueden usar LAB si confían en el testing
❌ JAMÁS amigos directo a index_fluxia_vXX.html mientras pruebas
✅ Tú: puedes abrir el HTML de laboratorio directo
✅ Promover: solo entonces cambias fluxia-canal.json
```

---

## 🎓 REGLAS DE ORO (v3.0)

1. ❌ Nunca listas = backup/remoto vacío sin confirmación
2. ❌ Nunca datos a 0 por accidente
3. ❌ Nunca cambiar logo ni «Fluxia BETA» en instalación
4. ❌ Versionado secuencial + checklist de esa versión
5. ❌ Invitados → canal estable; laboratorio → HTML versionado
6. ✅ **Sincronización automática SIN pedir permiso cada vez**
7. ✅ **Si algo desaparece → auditoría + posibilidad de devolver (papelera)**
8. ✅ **ZIP SIEMPRE con prompt + enlaces + real assessment**
9. ✅ **Ingresos cargan automático (cuadre 100%)**
10. ✅ **Papelera recibe TODO lo borrado (30 días recovery)**
11. ✅ **Valoración CRÍTICA HONESTA en cada release (no marketing)**

---

## ⛔ BANCO / PSD2 — REGLA ABSOLUTA

**JAMÁS de los jamases se puede volver a tocar nada que afecte a la conexión bancaria.**

Incluye, sin excepción:
- Edge Function **Fluxia-banco** (código desplegado en Supabase)
- Cliente de bancos en el HTML: `call()`, `iniciarBanco`, `bancos()`, `estado`, sync, callback `code=`, desconectar
- Hash del módulo: `851a971e839c4eb4a02f61f2be13a514d42024eeb6a2b24fadaf817d52a8345e` (VERIFICAR ANTES DE ACTUALIZAR)

---

## 📋 CHECKLIST ANTES DE CADA RELEASE (v91+)

- [ ] Versión archivo = badge = meta = FLUXIA_VERSION = checklist Ayuda
- [ ] Logo oficial + nombre **Fluxia BETA** en metas y manifest
- [ ] **PAPELERA recibe archivos borrados (NUEVO)**
- [ ] **INGRESOS carga automático de banco (NUEVO)**
- [ ] Ningún guardado vacío pisa datos existentes
- [ ] Test: datos > 0 tras recarga y tras sync
- [ ] Compartidos: saldo de partida + nombre de persona en «Pagado por»
- [ ] Invitados siguen en `index.html` + canal.json sin tocar
- [ ] Notificaciones in-app no spam
- [ ] **Cuadre total 100%** (disponible = balance teórico)
- [ ] **ZIP entregado con estructura completa (NUEVO)**
- [ ] **REAL ASSESSMENT incluido (NUEVO)**
- [ ] **Enlaces LAB/ESTABLE documentados (NUEVO)**
- [ ] **Prompt maestro actualizado en ZIP (NUEVO)**

---

## 🎯 REAL ASSESSMENT TEMPLATE (v3.0)

```markdown
# Real Assessment — Fluxia v93.X.X

## ✅ Lo Que Funciona BIEN

- Ingresos fijos
- Categorización de gastos
- Exportación de datos
- UI responsiva en mobile
- Sincronización banco (débitos)

## ❌ Lo Que FALTA o NO FUNCIONA

| Feature | Status | Impacto | ETA |
|---------|--------|---------|-----|
| Ingresos automáticos | ❌ Open | ALTA | v93.9 |
| Papelera | ❌ Open | MEDIA | v93.9 |
| RLS Supabase | ❌ Blocked | ALTA | v94 |
| 2FA Backend | ❌ Blocked | MEDIA | v94 |

## 🔢 Métricas HONESTAS

**Seguridad:** 90/100 (falta RLS)
**Performance:** 85/100 (sync es lento en datos masivos)
**Usability:** 88/100 (Compartidos es complejo)
**Data Integrity:** 85/100 (ingresos no automático)

## 🚗 Roadmap

- v93.9: Fix ingresos + papelera
- v94: Backend security (RLS, PSD2)
- v95: Native features

## 📊 Competitive Positioning

**Vs Revolut:**
- ✅ Compartidos más flexible
- ❌ Sin crypto
- ❌ Sin inversiones

**Vs YNAB:**
- ✅ Más simple
- ✅ Más barato (gratis)
- ❌ Sin proyecciones ML

**Vs Tink:**
- ✅ Mejor UX
- ❌ Menos bancos soportados
- ❌ Sin APIs

## 🎯 Conclusion

Fluxia v93.X.X es una herramienta SERIA para gestión personal en España.
Funciona bien para el 80% de casos. Los 20% que faltan se arreglan en próximas 2 semanas.

**Recomendación:** Use para datos reales. Reporta bugs para mejorar.
```

---

## 🏆 ELITE STATUS GUARANTEE (v3.0)

Para afianzar el producto como ELITE:

✅ **Transparencia total:** Dices qué funciona y qué no  
✅ **Métricas reales:** Números honestos, no aspiracionales  
✅ **Timeline claro:** Fixes ETA específicas, no "pronto"  
✅ **Competencia sana:** Reconoces fortalezas/debilidades vs otros  
✅ **Entrega profesional:** ZIP estructurado, documentación completa  
✅ **Quality first:** 100% QA pass antes de release  
✅ **Security serious:** Audits reales, no checkbox compliance  

**Resultado:** Usuarios recomiendan porque CONFÍAN, no porque les venda marketing.

---

## 📞 VERSION CONTROL

| Doc | Versión | Fecha | Cambios |
|-----|---------|-------|---------|
| PROMPT_MAESTRO | 1.0 | 28-Sep-2026 | Base original |
| PROMPT_MAESTRO | 2.0 | 28-Sep-2026 | Agregó v92.2+ rules |
| PROMPT_MAESTRO | 2.1 | 28-Sep-2026 | Agregó v92.3+ rules |
| **PROMPT_MAESTRO** | **3.0** | **29-Sep-2026** | **ZIP obligatorio + Real Assessment + Papelera + Ingresos auto + Cuadre 100%** |

---

**EFFECTIVE IMMEDIATELY: Fluxia v93.8.2+**  
**NO RELEASE SIN CUMPLIR v3.0 CHECKLIST**


## LEY IMPERIAL · MÉTODO DE DISEÑO VISUAL BASADO EN CAPTURA REAL

Para cualquier cambio visual de Fluxia se seguirá, por defecto, este flujo de trabajo:

1. El usuario envía una captura real de la pantalla, módulo, tarjeta o componente que desea modificar.
2. Antes de modificar el código, se preparan varias propuestas visuales claramente diferenciadas (Modelo 1, Modelo 2, Modelo 3, etc.) aplicadas sobre la interfaz real de Fluxia y conservando, siempre que sea posible, sus datos, textos, jerarquía, contexto y elementos reales. No se usarán interfaces genéricas o inventadas cuando exista una captura real de referencia.
3. Las propuestas deben ser técnicamente reproducibles en la aplicación. No se presentará como opción un diseño que después no pueda implementarse con fidelidad razonable en Fluxia.
4. El usuario elige un modelo o combina elementos de varios modelos. Solo entonces se implementa en LAB, salvo que el usuario ordene expresamente ejecución directa.
5. La implementación debe reproducir con la máxima fidelidad el modelo elegido y modificar únicamente el ámbito visual acordado. No se alterarán cálculos, persistencia, sincronización, datos ni lógica financiera por un cambio puramente visual.
6. Si durante la implementación aparece una limitación técnica que impida reproducir fielmente el boceto elegido, se informa antes de sustituirlo silenciosamente por otro diseño.
7. Este método prevalece como flujo normal para decisiones de diseño visual: CAPTURA REAL → MODELOS REALES → ELECCIÓN → IMPLEMENTACIÓN FIEL → PRUEBA EN LAB.

Objetivo: reducir iteraciones a ciegas, acercar el resultado final a la intención visual del usuario y proteger simultáneamente la integridad funcional de Fluxia.

8. Cuando se presenten propuestas visuales, no se limitarán a dos o tres alternativas casi idénticas. Se entregará por defecto una batería amplia de modelos reales y técnicamente reproducibles, normalmente entre 6 y 10 cuando el componente lo permita. Deben incluir tanto variaciones refinadas de la línea visual actual como alternativas de estilo claramente distintas (composición, geometría, transparencia, jerarquía, densidad, ubicación de controles y tratamiento cromático), para que el usuario pueda comparar y decidir si conserva, combina o cambia de dirección estética.
9. Todos los modelos se aplicarán sobre la captura/interfaz real aportada por el usuario, conservando datos, textos, contexto y proporciones reconocibles. Las propuestas no deben ser simples descripciones: siempre que sea viable se mostrarán visualmente como bocetos/mockups reales antes de implementar.
10. La cantidad de modelos no justifica degradar su calidad: cada alternativa debe ser premium, coherente con Fluxia, legible, compacta, implementable y respetuosa con la integridad funcional.


### REGLA OBLIGATORIA - VARIEDAD DE MODELOS VISUALES REALES
Cuando el usuario solicite propuestas visuales a partir de una captura real, se presentaran normalmente entre 6 y 10 modelos claramente diferenciados cuando el componente y el espacio lo permitan. Deben incluir evoluciones del diseno actual y alternativas de estilo mas distintas en distribucion, geometria, transparencia, jerarquia, densidad, color, iconografia o composicion. Todos los modelos partiran de la captura o interfaz real, conservaran datos, textos y contexto reales siempre que sea posible y deberan poder implementarse con fidelidad razonable en Fluxia. No se usaran propuestas genericas cuando exista captura real. El usuario podra elegir un modelo completo o combinar elementos de varios antes de implementar. La variedad visual nunca podra modificar calculos, persistencia, sincronizacion, datos ni logica financiera.


### REGLA OBLIGATORIA - PRESENTACION INDIVIDUAL Y ORDENADA DE BOCETOS
Los bocetos visuales se entregaran siempre por separado, nunca agrupados en una unica lamina comparativa salvo peticion expresa del usuario. Se ordenaran de mayor a menor recomendacion profesional del asistente: Modelo 1 sera la opcion mas recomendada y los siguientes iran descendiendo en recomendacion. Cada modelo debe permitir apreciar con claridad el componente y sus detalles. Junto a cada propuesta, el asistente dara siempre una valoracion breve y concreta explicando sus ventajas, inconvenientes y encaje con la identidad premium de Fluxia. La eleccion del usuario puede ser un modelo completo o una combinacion de elementos de varios modelos.


---

## LEY IMPERIAL v97.20 · RENDIMIENTO, UNIFORMIDAD, IDENTIDAD Y HUCHAS

**Vigencia inmediata y permanente.** Estas reglas forman parte del contrato maestro de Fluxia y prevalecen sobre parches visuales o de rendimiento anteriores que entren en conflicto.

1. **Rendimiento como requisito funcional.** Fluxia debe responder de forma inmediata en navegación, apertura de pestañas, scroll, PWA y edición. Ninguna pestaña puede ejecutar renderizados globales, reconciliaciones, red, polling, observers o temporizadores innecesarios en la ruta crítica. El benchmark de velocidad no puede empeorar respecto a la referencia estable de rendimiento. Gastos variables debe abrir tan rápido como el resto y solo renderizar su propio contenido cuando sea el panel activo.
2. **Una sola geometría visual.** Todas las pestañas comparten ancho útil, márgenes, cabeceras de sección, radios, tipografía, densidad y espaciado. Cada módulo puede conservar su semántica, pero no puede parecer una aplicación distinta.
3. **Selector mensual único.** Existe un único selector de mes global, colocado arriba y en exactamente la misma posición, ancho, altura y alineación al cambiar de pestaña. Quedan prohibidos los selectores duplicados por panel, los relocalizadores DOM y los parches con temporizadores. El mes seleccionado es un estado único y persistente para toda Fluxia. Cambiar de mes solo repinta el panel visible y los derivados imprescindibles.
4. **Variables compactas.** Los gastos variables usan filas/tarjetas compactas, sin grandes huecos vacíos. Concepto, categoría/fecha, importe y acciones deben quedar legibles en una sola composición densa. La virtualización/pintado diferido visual puede usarse si no cambia datos ni interacción.
5. **Identidad canónica.** Una misma cuenta cloud/Supabase representa una sola identidad visible por dispositivo. No pueden coexistir alias duplicados del mismo usuario ni más de un perfil marcado como Principal. Un shell local vacío nunca debe competir con el perfil cloud que contiene los datos. Crear un usuario nuevo sigue creando un namespace totalmente aislado y a cero.
6. **PWA determinista y rápida.** `index.html` es la entrada canónica permanente. Reinstalar la PWA no forma parte del flujo normal de actualización. El Service Worker es el único dueño del shell/cache PWA, usa una versión coherente con el build, elimina shells obsoletos en activación y nunca deja la interfaz esperando indefinidamente a la red. Debe existir arranque local rápido y actualización de red acotada.
7. **Sincronización silenciosa por defecto.** Guardar/sincronizar correctamente es funcionamiento normal y no genera banners/toasts inferiores intrusivos. El estado puede mostrarse de forma discreta en la cabecera. Solo errores persistentes o situaciones que requieren una acción del usuario justifican una alerta visible.
8. **Huchas: aportación ≠ uso ≠ saldo.** La aportación mensual es un hecho histórico inmutable salvo edición explícita del usuario. Usar, rescatar o pagar con una hucha reduce su saldo, pero nunca convierte un mes ya aportado en “pendiente”. El cumplimiento mensual se calcula exclusivamente con aportaciones reales registradas para ese mes. El siguiente mes genera su nueva obligación mensual.
9. **Código cromático de Huchas.** Azul = aportación mensual pendiente o parcial. Dorado = aportación mensual cumplida. Un uso posterior del saldo no altera ese color de cumplimiento.
10. **Cero regresiones por acumulación de parches.** Antes de publicar una versión se debe comprobar que no quedan estilos, selectores mensuales, Service Workers, listeners o rutinas heredadas contradiciendo la implementación vigente. Una mejora nueva sustituye el mecanismo antiguo; no se limita a superponer otro parche.
11. **Entrega verificada.** No se declarará un cambio como terminado si no está presente en el código publicado y comprobado mediante validación estática/funcional disponible. Toda versión LAB debe documentar qué se cambió, qué no se tocó y las pruebas realizadas.

**Prioridad:** integridad financiera → aislamiento de usuarios → persistencia cloud → no resurrección/duplicados → rendimiento → coherencia visual.


---

## LEY IMPERIAL v97.34 · PUBLICACIÓN DIRECTA Y PRUEBAS EN SAFARI

**Regla obligatoria permanente, confirmada por el usuario el 08/10/2026:** al generar cada nueva versión, se debe **publicar desde el propio chat usando la integración de GitHub**, sin pedir al usuario que suba ZIPs o archivos manualmente. La publicación de Fluxia v97.34-LAB demostró que es posible subir un `index.html` de más de 2 MB reconstruyendo el contenido íntegro del archivo disponible y enviándolo a GitHub mediante `create_blob` / `create_file`, verificando el SHA del contenido recibido. Un fallo de lectura del archivo grande con `fetch_file` **no debe confundirse** con imposibilidad de publicarlo.

**Flujo de entrega:** modificar → validar → conservar la versión estable → publicar una LAB con número correlativo visible → verificar el SHA/commit en GitHub → comprobar la URL de GitHub Pages cuando sea accesible → entregar al usuario **enlace directo para Safari, respaldo ZIP completo, número de versión y cambios exactos**. Si el despliegue web no puede comprobarse desde la herramienta, diferenciar explícitamente «confirmado en GitHub» de «confirmado en Safari»; jamás fingir la segunda verificación.

**Ruta de aislamiento:** cuando una modificación afecte lógica financiera, preferir un archivo de prueba independiente (por ejemplo `lab-v97-34.html`) accesible en GitHub Pages antes de sustituir el `index.html` estable. Verificar también el Service Worker: jamás debe redirigir la ruta LAB al índice/cache estable. No promocionar un LAB a ESTABLE sin pruebas funcionales y conformidad del usuario.

**Identificador visible obligatorio:** cualquier badge o texto heredado que muestre una versión distinta de la cargada constituye un defecto de publicación que debe corregirse. En la prueba de v97.34-LAB se observó todavía un indicador `v97.28 LAB`; queda como incidencia abierta, no como corrección confirmada.

**Clasificación bancaria pendiente:** el usuario confirmó cuatro rechazos de la asociación del cargo `Apple.com/bill · 14,99 €` con «Loterías», y en la captura de la LAB volvió a aparecer la pregunta. La decisión de «Es otro gasto» debe persistir por usuario y movimiento, sin borrar el cargo, sin recontarlo y sin volver a preguntar. Este fallo permanece abierto hasta que el usuario valide su desaparición después de una sincronización.

**Prohibido:** volver a indicar al usuario que «no se puede subir a GitHub» sin antes intentar las rutas de publicación probadas (incluida creación directa de blobs y archivos con verificación), o volver a ofrecer como publicada una versión que solo está en local.


---

## LEY IMPERIAL v97.37 · SIN ETIQUETAS FLOTANTES, RENDIMIENTO REAL Y QA

1. **Prohibidas TODAS las etiquetas, franjas y badges de versión flotantes, fijos o superpuestos**, tanto en LAB como en ESTABLE, en Safari y en PWA. Esto sustituye la exigencia anterior de mostrar la versión mediante badge. El número de build se mantiene verificable en `<title>`, metadatos, registro de cambios, nombre del archivo LAB, repositorio y, si corresponde, en un apartado interno de Información/Ajustes que NO interfiera con la pantalla. No sustituir un badge antiguo por otro. Eliminar el código que los crea, no limitarse a `display:none`.
2. **Rendimiento reproducible:** optimizar basándose en mediciones antes/después (tiempo de primera apertura en Bancos y Gastos Variables, respuesta del menú, tareas de más de 50 ms, número de renderizados, repintados, operaciones cloud, tamaño y bloqueo del shell). No proclamar velocidad “máxima” sin evidencia. Trabajar sobre causas raíz: listeners duplicados, observadores sobre todo el DOM, bucles de sincronización/reconciliación, renderizados completos repetidos, y carga síncrona de datos innecesarios.
3. **Una implementación canónica por función:** evitar apilar scripts v97.27, v97.28, v97.31 y parches nuevos que controlan el mismo menú, mismo selector o misma cache. Consolidarlos sin perder ninguna función necesaria, y probar el menú abierto/cerrado, cambio de pestañas y navegación iOS.
4. **Integridad contable superior al rendimiento:** no alterar la fórmula de Disponible, importes, Imprimir, aportaciones, rescates, ingresos, gastos o decisiones bancarias salvo cambio explícitamente necesario y cubierto por pruebas; cero pérdida, resurrección, duplicados o mezcla entre usuarios. La recuperación desde nube debe conservarse incluso si la PWA o la caché se reinstalan.
5. **Bug abierto Apple.com/bill 14,99 €:** aunque las versiones v97.35 y v97.36 contengan protecciones nuevas, la captura del usuario confirmó que volvió a mostrarse «¿Es el fijo Loterías?» con un fijo ya pagado. No considerarlo resuelto hasta superar prueba real de rechazo, recarga y cuatro sincronizaciones, preservando un solo gasto normal.
6. **Publicación de prueba independiente y verificable:** la base de experimentación es `lab-v97-37.html` (sin etiquetas de versión flotantes); `index.html` estable se conserva. Una versión posterior debe tener numeración correlativa, URL real en GitHub Pages, ZIP del proyecto, QA y respaldo, sin afirmar éxito de renderizado/sincronización si no hay verificación real.


### Regla vinculante v97.38 — Los avisos bancarios no borran movimientos

- **«Es otro gasto», «Descartar» y «Nunca más» en las preguntas de asociación de un cargo bancario con un fijo son acciones de clasificación/notificación, NUNCA operaciones contables de borrado.** No llamar a `movimientos.splice`, blacklist bancaria, `_fluxiaRegistrarBorradoGV` ni mutar el Disponible desde esos tres botones.
- «Nunca más» debe almacenar una decisión definitiva por identidad de usuario y comercio/banco/importe o identificador persistente de movimiento, limpiar la cola de sugerencias y guardar/sincronizar la decisión en nube, manteniendo el movimiento real exactamente una vez.
- No sugerir un gasto fijo ya pagado. La igualdad de importe nunca justifica por sí sola asociar comercios distintos. Revalidar las preguntas históricas rehidratadas desde nube antes de mostrarlas en cualquier modalidad («nombre», «importe» u otras).
- Prueba de regresión obligatoria: cargo **Apple.com/bill · 14,99 €** no debe preguntarse como «Loterías»; tras «Es otro gasto» o «Nunca más» no debe volver a aparecer, ni desaparecer del libro de movimientos. No proclamar corrección final hasta verificarlo en Safari después de recargar y sincronizar.
- Regla visual vigente: **no mostrar franjas ni badges flotantes de versión**, ni siquiera como sustitutos de los antiguos. Mostrar el número en metadatos/Ajustes sin tapar contenido.

---

## LEY IMPERIAL v97.39 · ARCHIVO CANÓNICO REAL, CONTROL DE CACHÉ Y DECISIONES BANCARIAS

1. El archivo de entrada principal de Safari y PWA es `/Fluxia-v20/index.html`. En GitHub Pages una LAB HTML independiente puede estar contaminada por un Service Worker antiguo que responde con el índice canónico; antes de declarar una prueba fallida o correcta comprobar el documento realmente servido. **No seguir publicando sucesivas LAB que el navegador sustituye por la versión vieja.**
2. La versión previa de `main` se salvó en `respaldo-estable-antes-v97-39-20261008` antes de modificar `index.html`. Conservar la rama como reversión; no borrar ni reescribir sin petición explícita.
3. La versión v97.39-LAB actualiza por primera vez `index.html` directamente tras el diagnóstico de la PWA; junto con `fluxia-sw.js`, `sw.js` y `manifest.webmanifest`. El manifiesto debe mantener su identificador de instalación y usar `./index.html` como inicio permanente. El SW debe priorizar una respuesta fresca y admitir respaldo offline, sin redirigir páginas LAB independientes al índice.
4. **La coincidencia de importe y una regla aprendida históricamente NO son evidencia suficiente para reconciliar un movimiento bancario con un fijo.** Una sugerencia automática exige correspondencia verificable entre comerciante y nombre o alias semántico del fijo. No emparejar `Apple.com/bill · 14,99 €` con `Loterías` ni sugerir fijos ya pagados.
5. `Es otro gasto` y `Nunca más` son **decisiones de clasificación**, nunca órdenes de borrado ni de reducción de saldo. Persistir decisión por usuario y movimiento; evitar resurrecciones al importar; no destruir ni duplicar el movimiento.
6. **Cero indicadores o franjas flotantes de versión.** Versión verificable solo en título/metadatos/Ajustes y commit. En el `index.html` canónico v97.39 no existen `fluxia-lab-version`, `fluxia-lab-version-fixed`, `fx-lab-build-verified` ni el texto `v97.28 LAB`.
7. QA antes de promoción: probar desde iPhone/Safari la **raíz** `/Fluxia-v20/index.html?v=97.39` y la PWA, asegurarse de que desaparecieron los dos defectos, no cambió Disponible/Imprimir y los bancos se reconcilian sin pérdidas. La publicación GitHub verificada por SHA **NO equivale** a validación del navegador.

**Integridad primero:** disponible e Imprimir no se tocan; los datos reales en nube tampoco. Informar cualquier limitación de pruebas sin simular resultados.


---

## LEY IMPERIAL v97.39 · VERSIÓN ACTUAL EN SAFARI Y PWA

**Orden permanente confirmado por el usuario:** toda entrega debe cargar la última versión realmente publicada, en Safari y en la PWA, sin quedarse en una versión anterior (incidencia observada: se mostraba v97.32 pese a existir v97.39 en `main`). La versión en GitHub por sí sola NO confirma el despliegue de GitHub Pages.

1. Antes de afirmar «publicada», identificar la **rama y directorio de origen de GitHub Pages** (no suponer que es `main`); verificar que la ruta web sirve el archivo/commit y versión que se acaban de subir. En caso de duda, usar una ruta independiente de diagnóstico no destructivo, `comprobar-fluxia-v97-39.html`, que distingue ramas de publicación y SW antiguos. Si no hay acceso al sitio real, pedir una única comprobación al usuario y no prometer que el enlace ya carga la nueva versión.
2. En la app instalada y Safari, nunca devolver un `index.html` anterior en línea cuando esté disponible el más nuevo. El Service Worker debe tener una política única de actualización, respetar todas las rutas LAB, manejar fallo de red con último shell sano y no bloquear datos ni sesiones. No debe existir ninguna rutina que desregistre todos los workers en cada arranque de PWA, ni varias rutas de registro concurrentes.
3. **Número de versión coherente** en título, metadatos, información interna, commits, manifiesto de build y changelog. Sin etiquetas flotantes o franjas. La versión solo se declara aceptada si la **abertura real del usuario** corresponde al build esperado y los cambios son visibles.
4. Mantener copia de seguridad antes de toda intervención sobre la entrada principal. Eliminar cachés de shell caducados sin tocar almacenamiento financiero local, sesiones o bases de datos. No indicar reinstalación como mecanismo normal de actualización.


**Origen de publicación confirmado el 08/10/2026:** GitHub Pages sirve Fluxia desde la rama **`pages-v9731-real-final`**, NO desde `main`. Se verificó con el histórico `pages build and deployment` y el despliegue exitoso del commit `e9081378fdcbbef469cddf601b7d6db9bd282284`. **Toda actualización futura de la versión que abre el usuario debe propagarse a la rama de GitHub Pages realmente configurada**, preservando sus archivos/recursos, realizando copia de seguridad previa, confirmando SHA del `index.html`, y comprobando que el workflow de GitHub Pages concluye `success`. No entregar enlaces de versiones nuevas que solo existan en `main`. La rama puede cambiar en el futuro: verificar de nuevo el origen por los logs de despliegue antes de publicar.


---

## LEY IMPERIAL v97.39 · PRIORIDAD DE BANCOS EN EL ARRANQUE

**Validación del usuario (09/10/2026):** la versión actual ya carga correctamente y la navegación general va muy fluida. **NO alterar ni revertir este estado bueno** sin respaldo y pruebas. Persisten dos incidencias: Bancos no muestra el estado conectado nada más abrir la aplicación; la primera entrada en Gastos Variables sigue siendo lenta.

**Prioridad 1 — Bancos al arrancar:** tras autenticar al usuario, pintar de inmediato el último estado bancario guardado para esa cuenta, junto con su fecha/hora de actualización; distinguir expresamente estado en caché de conexión actual comprobada. Lanzar en segundo plano una sola verificación de conexión y sincronización incremental, sin bloquear la interfaz. Si la conexión no puede verificarse, informar sin afirmar falsamente «Conectado». Mostrar movimientos recibidos del proveedor en cuanto estén disponibles, sin prometer instantaneidad ajena al proveedor. Evitar consultas y avisos duplicados, importaciones repetidas, resurrecciones y doble conteo. La persistencia en nube sigue siendo fuente de verdad; nunca usar caché de otro usuario.

**Prioridad 2 — primera entrada en Gastos Variables:** medir el tiempo de primera apertura, localizar trabajo síncrono, renderizados y conciliaciones redundantes y corregirlos de forma focalizada. No romper la navegación, el menú, los importes ni el rendimiento ya confirmado por el usuario.

**Protocolo de cambios:** copia recuperable del estado actual, mediciones y pruebas antes/después, LAB independiente, QA de datos reales con cautela y publicación en la rama efectiva de GitHub Pages. No modificar Disponible ni Imprimir, ya validados. No dar por resuelta la conexión bancaria solo porque se haya mostrado su último estado guardado.


---

## LEY IMPERIAL 2026-10-09 · AUDITORÍA BANCARIA Y PUBLICACIÓN SEGURA

1. Nunca fusionar movimientos exclusivamente por `bancoRef`. Exigir identidad de usuario, cuenta, tipo, fecha, importe y equivalencia contable demostrable; los casos ambiguos quedan como conflictos sin mutación.
2. `FluxiaSalud.limpiarDuplicadosBancoRef` y cualquier rutina de limpieza automática deben ser idempotentes y no alterar el Disponible en una segunda sincronización sin novedades. No ejecutar borrados o fusiones durante el renderizado.
3. Antes de cada mutación, capturar snapshot reversible, huella de movimientos y Disponible. Si el Disponible cambia por una mera deduplicación, abortar y registrar diagnóstico, sin escrituras parciales.
4. Las transferencias internas CaixaBank ↔ Revolut son neutras en ingresos/gastos externos; conciliar ambos extremos sin duplicarlos. Preservar los pagos fijos ya conciliados y las operaciones de Dinero en mano.
5. Ejecutar los 12 casos de `auditorias/PRUEBAS_ACEPTACION_BANCOS_2026-10-09.md` en entorno aislado antes de publicar. Un documento de pruebas no equivale a pruebas superadas.
6. Comprobar siempre la rama efectiva de GitHub Pages. En la captura del usuario del 09/10/2026 es `pages-v9731-real-final`; `main` y dicha rama están divergidas, por lo que se prohíbe reemplazarlas o fusionarlas indiscriminadamente. Verificar configuración real en cada publicación.
7. LAB y ESTABLE deben tener rutas y cachés inequívocas; confirmar `index.html`, service workers, manifest, SHA, workflow Pages `success`, carga en Safari y PWA, y número de versión coherente antes de afirmar despliegue.
8. No cambiar datos reales, borrar cargos ni promover a estable mientras falten evidencias de reconciliación y persistencia. Entregar ZIP completo y enlaces LAB/ESTABLE solo tras comprobación real.

---

## ADENDA IMPERIAL v97.43-LAB — ARRANQUE INMEDIATO Y PRIORIDAD DE INTERACCIÓN (09/10/2026)

**Ámbito:** LAB independiente en `lab/index.html`. La entrada de referencia de raíz `index.html` queda INTACTA hasta aceptación y QA manual.

1. **Integridad financiera primero.** Ningún cambio de rendimiento puede alterar movimientos, ingresos, fijos, variables, huchas, cuentas compartidas, provisiones, deuda, rescates, tombstones, perfil activo, namespace, RLS o disponible. No reescribir snapshots, borrar ni resucitar cargos durante el arranque.
2. **Primer fotograma útil e interacción.** La interfaz, menú, selector de mes y navegación NO esperarán a Chart.js, análisis, animaciones ni refresco bancario secundario. La pantalla de carga no debe simular velocidad: medir también primer toque funcional.
3. **Gráficos de carga diferida.** Chart.js solo se solicita al entrar en Análisis o Presupuestos y se repinta la vista activa cuando termina la petición. Fallo del CDN de gráficos no bloqueará DOMContentLoaded, la nube, login, bancos ni navegación.
4. **Bancos sin competencia con los primeros gestos.** Refresco automático del banco solo después de splash, al menos 4,5 s de espera y 1,4 s sin interacción, preferentemente en idle. La consulta explícita «Sincronizar» nunca se ralentiza. Deduplicación, conciliación, veto permanente y reglas del Disponible siguen exactamente iguales.
5. **Separación ESTABLE/LAB.** La PWA de LAB usa scope `./` y su propia caché, sin controlar `/` ni sobrescribir el service worker de referencia; el usuario existente conserva su ruta. No borrar respaldos de ESTABLE.
6. **Métricas sin datos personales.** En LAB `window.FluxiaArranque9743.report()` expone tiempos de inicio, DOM, primera pintura estable y tareas largas; no importes, movimientos ni credenciales.
7. **Regresión obligatoria antes de promover:** arranque frío y caliente en Safari iOS y PWA, disponibilidad de ingresos/fijos/variables/huchas, conciliación bancaria sin duplicados, cambio de usuario aislado, offline/reconexión y navegación rápida. Sin medición en dispositivo no afirmar una cifra de segundos ni proclamar versión «estable».
8. **Entrega:** ZIP completo de LAB, checklist, PROMPT MAESTRO y enlaces LAB/ESTABLE. La rama/página publicada debe verificarse contra el código real, evitando mostrar una versión anterior.

**Estado:** v97.43-LAB propuesta de ensayo; no ha recibido todavía verificación de Safari/PWA real.

## REGLA IMPERIAL v97.52-LAB · ARRANQUE MEDIDO Y RAMA REAL DE PAGES (09/10/2026)
- Base de la LAB v97.52: `index-v97.51.html` de la rama `pages-v9731-real-final`, que es la rama real de publicación de GitHub Pages. NO usar `main/index.html` (v97.42 obsoleta) para desarrollar sobre datos financieros ni sustituir el `index.html` ESTABLE de Pages (v97.46).
- Prioridad de arranque: las interacciones, login, navegación, datos del perfil autenticado y fuentes autoritativas no deben esperar a Chart.js. Cargar los gráficos bajo demanda exclusivamente al entrar en Análisis o Presupuestos, repintar la vista cuando cargue; caída del CDN nunca congela el menú.
- Arranque bancario único y aplazado: un solo planificador de sincronización automática (ni por splash ni por DOM duplicado), tras al menos 4,5 segundos y 1,4 segundos de inactividad del usuario. La sincronización explícita nunca se retrasa. Mostrar al instante desde el estado local confiable cuántos bancos están conectados, sin afirmar una nueva sincronización.
- La conciliación no se modifica por rendimiento: no efectuar fusiones automáticas destructivas, no reaparecer cargos vetados ni reescribir Disponible o provisiones. Preservar todos los tombstones, namespace de usuario y la nube como verdad. No mostrar datos sensibles de otro usuario durante la carga.
- LAB aislada en `/lab/` con `lab/fluxia-sw.js`, `lab/manifest.webmanifest` y caché propia; prohibido cambiar root SW o root index por un ensayo. PWA debe llamarse Fluxia BETA.
- Medición y aceptación: diagnosticar `FluxiaArranque9752.report()` con solo métricas temporales (sin movimientos, importes ni IDs); probar arranque frío/caliente Safari iOS + PWA, primer toque, cambio de pestañas, gráficos diferidos, bancos, login multiusuario, huchas y disponible. **No declarar objetivo de velocidad ni promover LAB como ESTABLE sin validación real**.
- Entregables: ZIP completo y URLs separadas LAB/ESTABLE, PROMPT MAESTRO actualizado, checklist y GitHub Action de prueba de integridad. Verificar despliegue de la rama efectiva, no solo commit en main.

---

## ADENDA v97.53-LAB · UI CANÓNICA EN UNA FILA + ARRANQUE SIN BLOQUEO (09/10/2026)

**Base:** v97.52-LAB presente en main y Pages real `pages-v9731-real-final`.
**Incidencia real observada:** Safari iPhone mostró menú, marca y campana en 3 alturas distintas, con hueco blanco excesivo. El usuario reportó espera prolongada antes de respuesta.

- Mantener **una sola cabecera**: `#fx32Header` con `.fx30-headgrid` horizontal, 1 fila de menú original `#btnMenu`, marca y campana original `#headerNotifications`; no duplicar botones, no flotantes, no sobrescribir listeners.
- Aplicar contención visual en CSS crítico y una normalización **solo del DOM visible**, idempotente en DOMContentLoaded / pageshow. Sin loops, MutationObserver, recargas, ni cambios en finanzas o perfiles.
- Mantener `#fx34Context` debajo como dos estados gemelos y compactos: bancos y nube.
- El dashboard debe conservar importes y diseño premium; no se maquillan tiempos con un splash más largo.
- Mantener la sincronización bancaria diferida única de v97.52 y la lógica de gráficos diferidos; no reactivarla ni duplicarla durante la corrección visual.
- Instrumentar tiempo al primer gesto en LAB sin capturar eventos privados ni importes, para comparar en Safari iPhone. No atribuir mejoras de segundos sin medición de dispositivo.
- Invariantes: Disponible, ingresos, fijos, variables, huchas, bancos, tombstones, notificaciones rechazadas, credenciales y aislamiento entre usuarios no se alteran. LA NUBE sigue como verdad financiera.
- Estrictamente **LAB**, la entrada ESTABLE de raíz no se toca ni se promociona hasta QA con navegador real, arranque frío/caliente, PWA, dos cuentas, análisis, variables y banco sin duplicados.
- Cada entrega contiene ZIP completo, master, README, enlace LAB y referencia estable.

**Estado verificación:** estructura estática auditada y pendiente de Safari/PWA real. Nunca asumir que el bug está resuelto sin comprobar render en iPhone.


### Nota operativa PWA v97.53
Cada entrega LAB que cambie el HTML debe cambiar el nombre de la caché de su `lab/fluxia-sw.js` y el manifest. En incidencias de persistencia de PWA, mantener archivo de diagnóstico `lab/vNN.NN.html` (blob compartido de la versión) para acceso directo en Safari sin interceptar las rutas del service worker anterior. La entrada pública habitual sigue siendo `lab/index.html`, sin renombrarla. Nunca cambiar ni controlar el service worker ESTABLE de raíz.


## Adenda v97.54-LAB — prioridad de arranque y conciliación segura

- Se elimina el segundo `await FluxiaNube.usuario(); await Almacen.reconectar()` en la ruta de primer render. Nunca debe realizarse una segunda reconexión **antes de mostrar el dashboard**.
- El outbox durable **sí** debe cargarse antes del render; si falla, jamás se borra ni ignora silenciosamente.
- El primer render puede usar exclusivamente la caché **del perfil activo**; las lecturas remotas autoritativas de `Almacen.iniciar()` siguen vivas y aplican reconciliación y recarga cuando llegan, respetando RLS y tombstones. La caché no sustituye permanentemente a la nube.
- `Almacen.reconectar()` permanece disponible y se invoca en segundo plano **solo** tras haber confirmado estado local y sesión real; jamás duplica trabajos de red si la nube ya está conectada.
- El primer fotograma calcula ingresos, fijos, huchas, variables, disponible y cuadros; módulos visuales secundarios se envían a idle sin modificar datos.
- La cabecera v97.53 se conserva intacta. No introducir CSS ni pantallas de espera que simulen velocidad.
- Mantener bloqueo de credenciales para usuario nuevo, separación absoluta entre perfiles, papelera, rechazos permanentes, outbox persistente y recuperación desde la nube; no modificar motor financiero ni deduplicación.
- Regresión estática y temporización medible con `FluxiaTiempos9754.report()`; sin ensayos reales en iPhone no afirmar mejoras temporales cuantificadas ni promover a ESTABLE.
- Publicar **ambos** `lab/index.html` y `lab/v97.54.html`, SW LAB con caché nueva y artefacto ZIP; la raíz ESTABLE no se modifica.


## Adenda v97.55-LAB · sincronización única y servidor aislado
- Servidor activo auditado: `bandeja` es alias de `movimientos` con ventana de 40 días; una sincronización del cliente debe realizar una sola consulta y conservar esa cobertura.
- Las llamadas concurrentes comparten la misma promesa; un fallo no ejecuta conciliación ni marca una sincronización correcta. Respuestas de un perfil anterior se rechazan antes de procesarlas.
- El servidor LAB `Fluxia-banco-lab9755` consulta hasta dos bancos en paralelo, mantiene orden determinista, resultados parciales, blacklist, validación de usuario real y filtro por propietario. No modificar el servidor ESTABLE.
- Una actualización financiera solicita un solo fotograma para la vista activa. La persistencia permanece inmediata; no se altera cálculo, tombstones, huchas ni efectivo.
- Consulta automática al abrir y al recuperar conexión/primer plano, con mínimo 90 segundos desde consulta exitosa y cadencia de 12 minutos durante uso continuado. Pausar en segundo plano/offline y aplicar backoff 2–15 minutos por fallo. No prometer recepción instantánea ni push con app cerrada: depende del banco y no hay bandeja de webhook en este servidor.
- Entrega LAB v97.55 y referencia ESTABLE v97.46, ZIP completo de ambas. No promover sin pruebas reales de Safari/PWA, dos cuentas y cargos reales.

## Adenda v97.56-LAB — render sin cascadas y carga prioritaria
- El dashboard canónico sustituye el render de KPI y héroe legacy ocultos; no regenerar análisis ni metas ocultos desde renderKPIs.
- Los módulos secundarios de resumen se ejecutan uno por turno idle, solo si resumen sigue activo y no hay diálogo abierto. Invalidar trabajo antiguo al solicitar otro refresco.
- Quitar el plazo fijo de 1,1 segundos para pintar, no la espera del outbox durable; mantener reconciliación autoritativa y aislamiento por perfil.
- No consultar automáticamente el banco durante interacción reciente. Conservar endpoint y reglas LAB v97.55, cálculos, persistencia y deduplicación.
- Minificar solo comentarios y espacios de JS, sin compresión ni mangle. Mantener orden y separación de los scripts y CSS.
- Los tiempos JSDOM son evidencia sintética, no certificación iPhone. Conservar ESTABLE v97.46 hasta QA real Safari/PWA.

## Adenda v97.57-LAB — prioridad de gestos y DOM estable
- Trabajo visual secundario cede durante 600 ms tras gesto, edición de inputs, menú y confirmación. Cancelar con mecanismo correspondiente (idle o timeout); no apilar generaciones.
- Reutilizar selector solo si mes, plan, etiquetas y fecha siguen iguales. No cachear cálculos ni importes. Actualizar visibilidad y etiquetas de paneles.
- Pintura diferida para clase real mov-item de Variables, conservando foco y acciones. No virtualizar datos financieros.
- Mantener interfaz premium canónica; sin rediseño improvisado ni franjas/badges nuevos.
- Pruebas sintéticas no certifican iPhone. LAB v97.57 y ESTABLE v97.46 separadas, ZIP y evaluación honesta.


## Revisión v97.58 LAB — rendimiento de interacción
Mantener una única goToTab canónica y hooks idempotentes cancelables. Descartar trabajos de pestañas/perfiles abandonados; pausar renderizados pendientes durante apertura del menú. Conservar fallback de teclado. No reconstruir el selector de mes si no cambió. Análisis conserva resumen inmediato e importes y completa secundarios en tareas cancelables. No afirmar velocidad máxima ni Safari validado a partir de JSDOM o Chrome remoto. Mantener estable v97.46 hasta validar PWA, cuentas reales y banca. Evidencias y limitaciones en AUDITORIA_RENDIMIENTO_v97.58.md.

## Revisión v97.59 LAB — respuesta y reutilización
Render de navegación fuera del callback de animación para permitir pintura previa, cancelable por menú, pestaña y perfil. Filas de Variables reutilizadas solo si JSON completo y perfil coinciden; acciones con referencias actuales. Ediciones invalidan la reutilización. Resumen mantiene importes/avisos inmediatos y separa secundarios por mes/perfil/pestaña. No cachear cálculos financieros con heurísticas de longitud/último ID. Menor CPU síncrona no implica menor coste total ni mejor arranque. Estable v97.46 intacta hasta verificar Safari/PWA y cuentas reales.

## Adenda v97.60 — menú y logo
Activación única del menú por click; nunca mover el objetivo durante pointerdown. Logo oficial vuelve a Inicio con la navegación canónica y teclado. Mantener nodos originales, área táctil de 44 px y estado aria-expanded. No debilitar autenticación ni tocar bancos/datos. Chrome y pruebas sintéticas no equivalen a Safari/PWA del usuario. Actualizar ambos canales con cachés separadas y conservar builds anteriores. Corrección directa PWA autorizada por el usuario.

## Publicación directa PWA v97.59 — 10 octubre 2026
El usuario confirma mejora bancaria y solicita actualizar directamente la PWA. La raíz pasa de v97.46 a v97.59-PWA, promoviendo la LAB probada sin nuevos cambios de renderizado ni de lógica bancaria. Preservar id/start_url/scope del manifest instalado y datos locales. El nuevo worker solo se activa después de descargar el shell; caché raíz separada de LAB. La v97.46 se conserva como copia anterior en el ZIP, no como versión principal vigente. Esta promoción solicitada no implica certificación adicional de Safari o bancos reales.


## Adenda v97.61 — navegación reutilizada y tareas visibles (10/10/2026)
- Corregir el total de categorías de Variables: nunca usar una variable fuera de su ámbito. El total usa los mismos movimientos visibles y no cambia el motor financiero.
- Reutilizar únicamente DOM de pestañas cuya firma completa coincida: perfil, fecha, mes, plan, todas las listas financieras y controles. No cachear importes calculados. Toda escritura en Storage o renderAll invalida la reutilización.
- Al volver a Variables, reanudar la lista incompleta con los objetos del mismo perfil. La primera carga conserva el render canónico.
- Checklist, Ajustes y Compartidos se inicializan con los hooks de navegación; quitar la reconstrucción repetida a 200/1400 ms. Historial de salidas solo pinta el panel activo. Retirar la auditoría visual antigua del héroe oculto.
- Preservar funciones financieras, guardado, nube, outbox, autenticación, bancos, rechazos permanentes y nodos originales de menú/logo.
- Actualización directa de raíz/PWA autorizada en la sesión; conservar identidad instalada, LAB independiente y referencia v97.46. No exigir reinstalación ni borrar datos.
- Las métricas JSDOM y Chrome remoto no certifican Safari/PWA del usuario. No prometer segundos de arranque ni dar por resueltos todos los problemas sin su comprobación.


## Adenda v97.62 — clasificación bancaria visible
Preparar el banner de clasificación solo en Inicio o Ingresos activos. No construir diagnósticos ni filas de Ingresos durante Inicio. Una sola tarea pendiente de pintura; reaccionar a cambios reales de pestaña incluso mediante navegación programática. Conservar sin cambios motor bancario, sincronización, clasificación, guardado y outbox durable. La descarga de GitHub Pages ya usa gzip; no atribuir a la red el tamaño HTML sin comprimir. Mantener pruebas sintéticas separadas de la validación real del iPhone.


## Adenda v97.63 — retirar cola global de animaciones legacy
No iniciar animaciones escalonadas sobre todas las tarjetas al abrir la app. La interfaz canónica conserva sus transiciones; las funciones explícitas de animación permanecen disponibles. Evitar temporizadores decorativos para tarjetas ocultas. Conservar cálculos, nube, outbox, bancos, seguridad y navegación. Validar ausencia de cola y funcionalidad; no confundir fin de animaciones con tiempo medido de disponibilidad real.


## Adenda v97.64 — navegación móvil y scroll
Cabecera sticky opaca sin blur, con safe-area sin recorte de altura; menú y logo originales siempre accesibles. Logo como botón HTML nativo, una sola activación por click/teclado. Al abrir menú, fijar body compensando scroll; al cerrar restaurar posición antes de navegación canónica. Drawer por encima de overlay/cabecera, contenido visible sin content-visibility/contain para evitar recorte móvil. Preservar funciones financieras, nube, bancos y datos. Pruebas de navegador remotas no certifican Safari/PWA física.


## Adenda v97.65 — activación única de controles del encabezado
Usar un único manejador delegado capture para menú/logo, registrado temprano. Nunca acumular listeners por reconstrucción del encabezado. Identificar control incluso desde SVG/span; hijos no interceptan toques. Menú alterna apertura/cierre mediante funciones canónicas; logo usa goToTab. Botones HTML nativos conservan teclado, touch-action manipulation y objetivo inmóvil. Conservar aislamiento/auth: overlays de acceso siguen bloqueando interacción; no retirar gate ni debilitar permisos. Evitar declarar causa móvil confirmada si solo se ha reproducido en navegador remoto.

## Regla permanente v97.66 — Gastos variables sin Disponible (10/10/2026)

- Gastos variables muestra únicamente sus gastos, totales del mes y del plan, registro, búsqueda, exportación y categorías. No debe mostrar el Disponible, «Te queda este mes», ni un saldo residual después de ingresos, fijos o huchas. El Disponible canónico de Inicio y sus cálculos se conservan sin cambios.
- Eliminar el componente legado y el código que lo rellena; ocultarlo con CSS no es una corrección suficiente. No reintroducir `gvAjustadoVal` ni llamar a `disponibleEfectivo` desde `renderGastosVariables` para pintar un saldo en ese panel.
- Antes de publicar, probar entrada desde menú y tarjeta de Inicio, ambas subvistas de Variables, cambio de mes, regreso por logo, navegación repetida y tareas diferidas. Debe existir un único panel activo, sin arrastre visual del dashboard ni mezcla de datos entre perfiles.
- Prueba de regresión permanente: con datos sintéticos cuyo Disponible sea distinto del gasto variable, los totales de Variables deben coincidir con `resumenMovimientosVariables`, mientras Disponible conserva su importe en Inicio. Comprobar que la navegación, el cambio de mes y las tareas diferidas no mutan listas financieras ni ejecutan el cálculo de Disponible desde el render de Variables.
- El usuario confirma que Bancos va mejor. Preservar las mejoras vigentes y verificar que motor bancario, sincronización, clasificación, rechazos, persistencia, outbox y aislamiento no cambian. Esta corrección de presentación no autoriza nuevos cambios contables ni en el servidor bancario.
- Entrega correlativa con raíz/PWA, LAB, cachés nuevas y separadas, PROMPT actualizado, pruebas reproducibles y ZIP completo. No afirmar que nunca habrá regresiones ni certificar Safari/iPhone físico a partir de pruebas sintéticas o Chrome remoto.

## Base vinculante v97.66 — rendimiento sin retrocesos (11/10/2026, Canarias)

El usuario establece expresamente v97.66 como base de todo desarrollo posterior. Conservar el snapshot `b1d53c08fa0cc99356ab5f3f54e5e45b694f1a4c` en `baseline-v97.66-performance`, los archivos v97.66 y sus hashes. Ninguna versión antigua vuelve a ser base de trabajo por comodidad. La v97.46 es únicamente histórica.

Leer y cumplir AGENTS.md y BASE_RENDIMIENTO_v97.66.md en cada cambio. Las mejoras de navegación, render visible, bancos, menú/logo, Variables y PWA de v97.66 son requisitos mínimos permanentes. No reactivar mecanismos heredados que las contradigan.

La promoción requiere pruebas funcionales y comparación reproducible del candidato con v97.66 bajo las mismas condiciones de dispositivo, datos, perfil y arranque frío/caliente. Medir primer gesto, menú, Variables, Bancos, tareas largas y número de renderizados/consultas. Una regresión reproducible bloquea la promoción hasta corregirla, manteniendo la base desplegada. No eliminar assertions ni sustituir evidencia por promesas de velocidad. Conservar integridad, nube, outbox e identidad por encima de cualquier optimización.

Esta fijación de base no modifica el runtime v97.66 ni certifica ensayos en iPhone físico que no se han realizado. Mantener respaldo, ZIP, PROMPT, pruebas y límites explícitos en cada entrega.

## Orden permanente «con labora» — actualización de pantalla de inicio (11/10/2026)

Cuando el usuario diga «con labora», promover la última LAB validada a la PWA instalada: publicar el HTML en la raíz canónica `index.html`, junto con el Service Worker y manifiesto coherentes. Entregar la actualización real de pantalla de inicio, no solo un enlace de laboratorio. La frase constituye autorización de promoción, manteniendo previamente las pruebas obligatorias de integridad y rendimiento de la base v97.66.

Conservar identidad PWA, entrada permanente, datos locales/cloud y cachés separadas. No exigir reinstalación ni borrar almacenamiento. Verificar documento realmente servido, versión, worker y despliegue efectivo; no declarar actualización en iPhone sin evidencia del dispositivo. Si raíz/PWA y LAB ya tienen la misma versión, confirmar la coincidencia sin generar un build ficticio.


---

## Adenda v97.67-LAB · Navegación inmediata sin sacrificar integridad (12/10/2026)

**Base inmutable:** v97.66, respaldo `baseline-v97.66-performance`, con QA permanente. Esta LAB NO sustituye la PWA hasta orden «con labora» y validación de sus pruebas.

1. En pestañas que no tienen firma previa válida, ejecutar solo el render y calcular UNA firma después de pintar. En pestañas ya visitadas, mantener comparación integral para reconocer ediciones in-place, perfil, mes y storage. PROHIBIDO reemplazar la firma completa por longitudes de listas o referencias de objetos.
2. En navegación desde menú evitar duplicar la planificación al cerrarlo, pero mantener el comportamiento normal al cerrarlo manualmente (overlay, botón, menú).
3. Evitar `will-change:transform` y transformación 3D global permanente en paneles si genera sobrecarga. No desactivar animaciones o transiciones de elementos interactivos ajenos a los paneles.
4. Reducir trabajo en ruta crítica únicamente si la integridad está demostrada. Las funciones de Disponible, Ingresos, Fijos, Provisiones, Variables, persistencia, auth, outbox y bancos no pueden cambiar por optimizar UI.
5. Benchmark exigido antes de promoción: mismo iPhone/Safari y estado frío/caliente, 20 cambios de pestaña, menú/logo, Variables, Bancos, mediana y peor cola, errores, tareas largas y estado bancario; impedir promoción por regresión reproducible. JSDOM/Chrome sirven para prevención, no como prueba definitiva iOS.
6. QA: `node auditorias/qa-v97.66/verify-baseline.cjs`, `npm test` en `auditorias/qa-v97.66`, `node auditorias/qa-v97.67/regression-lab.cjs` con la misma instalación de dependencias.
7. Versiones y entregables: publicar siempre LAB y referencia ESTABLE, ZIP completo, cambios, límites y pruebas; la PWA estable no se promueve por una mera solicitud de optimización. Publicarla cuando el usuario diga «con labora» tras superar QA.

**Principio rector:** rendimiento de élite significa respuesta y render sin trabajo superfluo medidos objetivamente, no ocultar los retrasos ni sacrificar contabilidad/seguridad para aparentar rapidez.


## ⚡ REGLA PERMANENTE DE RENDIMIENTO — actualización v97.68-LAB (13/10/2026)

1. **La misma Fluxia, más rápida.** Ninguna optimización permite alterar interfaz, jerarquía, navegación, reglas financieras, persistencia, acceso y separación de usuarios ni conciliación. Conservar la base aceptada v97.66 y el historial de estables.
2. **Priorización:** integridad financiera > aislamiento de cuentas > nube como fuente de verdad > idempotencia y no-resurrección > rendimiento > diseño inalterado.
3. **Línea base y QA obligatorios:** conservar comparación de código con v97.66; medir en el mismo dispositivo, datos y red el arranque frío/caliente, primer gesto útil, menú/logo, pestañas, Variables, Bancos, LCP, INP, CLS, desplazamiento, memoria y consultas. Registrar medianas y dispersión; sin datos reales no adjudicar métricas.
4. **Presupuesto orientativo, no resultado garantizado:** menú y botones <100 ms, pestaña ya cargada <200 ms, INP <200 ms, LCP <2,5 s, CLS <0,1 y scroll ~60 FPS; no declarar cumplimiento sin pruebas repetibles.
5. **Sin parches falsos:** no reducir esperas únicamente por apariencia ni usar saldos provisionales; evitar tareas redundantes de scroll, reanudación, serialización y rendering; mantener invalidación completa ante cambios in-place y locales/remotos.
6. **LAB antes de ESTABLE:** cada candidato debe entregar ZIP completo, enlaces diferenciados, prueba automatizada, registro de cambios, comparativa operativa y limitaciones. PWA y `index.html` estables no se tocan hasta promoción autorizada («con labora») y verificada.
7. **Regla antirregresión:** toda nueva versión debe mantener o mejorar el rendimiento medido, sin sacrificar exactitud financiera ni accesibilidad. Si empeora de forma reproducible, se rechaza y se preserva la base.

**v97.68-LAB:** micro-optimización de firma de render con una asignación menos, supresión de scroll duplicado al navegar desde menú y omisión de reanudación diferida de lista al salir de la vista. Cierre manual sigue intacto; cifras reales de iPhone pendientes de medición. Cualquier discrepancia contable o visual bloquea la versión.


---

## 🔒 REGLA PERMANENTE · AUDITORÍA PREVIA OBLIGATORIA + TRAZABILIDAD DE FIJOS (13/10/2026)

**Origen:** petición expresa del usuario tras confirmar que v97.68-LAB funciona con buena fluidez. Mantener v97.68-LAB como referencia funcional y de velocidad, sin modificarla; preservar también el respaldo inmutable v97.66 y el canal ESTABLE.

**Auditoría antes de toda entrega:** analizar exhaustivamente la versión candidata contra la última aceptada (código, contabilidad, persistencia, bancos, cuentas, PWA, UI, tiempos de carga y respuesta); ejecutar QA sintética y pruebas representativas de Safari iOS/PWA donde sea posible. Bloquear la publicación si hay pérdida de datos, duplicados, diferencia injustificada de Disponible, cambios de diseño no autorizados, controles inoperativos o degradación reproducible de velocidad. Entregar comparativa, riesgos abiertos, LAB, ESTABLE, ZIP completo y PROMPT actualizado. No afirmar «100 %» de velocidad sin medición real.

**Separar importes sin perder trazabilidad:** mostrar el total correcto de gastos variables del mes, el total de gastos fijos realmente pagados, el gasto global realizado y, en otro apartado, fijos pendientes. Nunca presentar pagos futuros o previstos como desembolsos ya realizados. El campo histórico «Total del plan» ha de utilizar un filtro contable correcto, no una suma bruta de movimientos.

**Cargos de fijos visibles sin doble contabilización:** cuando un gasto bancario esté inequívocamente conciliado con un fijo, mantener una sola transacción, enlazada por sus IDs estables; permitir verla en el historial unificado marcada «Fijo · Pagado», con fecha, importe y fuente bancaria. Excluirla siempre del subtotal de Variables, porque su impacto ya está en Fijos. Las partidas fijas aún pendientes deben aparecer como pendientes de calendario, no como movimientos bancarios ficticios. Los pagos marcados manualmente deben distinguirse de los confirmados por banco. La vista de fijos enlazados debe evitar acciones de edición/borrado como variable; remitir al módulo Fijos. No cambiar regla de Disponible, idempotencia de sincronización, histórico, estados, fechas, cloud ni aislamiento de usuarios.

**Contrato de aceptación técnico y escenarios de prueba obligatorios:** `auditorias/REQUISITOS_VARIABLES_FIJOS_Y_RENDIMIENTO_2026-10-13.md`. La presente adenda es normativa; **no da por implementados los cambios funcionales hasta entregar y validar una LAB nueva**.


---

## 🏆 NORMA IMPERIAL FLUXIA ÉLITE — auditoría, remediación, seguridad, despliegue y velocidad (13/10/2026)

**Esta norma es vinculante para ChatGPT, Work, agentes y toda nueva versión de Fluxia.** Prioridad del sistema: (1) exactitud contable; (2) privacidad, autenticación y aislamiento real de cuentas; (3) conservación y persistencia en nube; (4) idempotencia de cargos y ausencia de resurrecciones; (5) despliegue reversible; (6) rendimiento medido y nunca degradado de forma reproducible; (7) experiencia de usuario y diseño premium sin alteraciones no solicitadas. **Cada mejora suma; ninguna mejora sacrifica integridad ni velocidad.**

### 1. Bases inmutables, diagnóstico previo y reglas de intervención
- **v97.66**: snapshot técnico inmutable `baseline-v97.66-performance` con pruebas congeladas. **v97.68-LAB**: referencia percibida por el usuario como especialmente rápida y referencia mínima de experiencia de navegación. **v97.69-LAB**: candidato funcional con cambios de totales/historial y QA sintética, **no promovido automáticamente a PWA**. La versión que sirve actualmente GitHub Pages y el estado del `index.html` han de **verificarse, no suponerse**. Antes de actuar, inspeccionar HEAD, Pages, Releases, Service Worker, manifiesto, cachés y SHA de artefactos; si aparece una nueva versión, adaptar la auditoría al estado real.
- Todo agente DEBE leer `PROMPT_MAESTRO.md`, `AGENTS.md`, `BASE_RENDIMIENTO_v97.66.md`, `auditorias/REQUISITOS_VARIABLES_FIJOS_Y_RENDIMIENTO_2026-10-13.md` y los informes QA vigentes. Congelar hash/copia verificable de cada entrada antes de editar.
- Prohibido sustituir de golpe el frontend monolítico o borrar datos/código histórico sin análisis de dependencias y plan reversible. Cambios **pequeños, aislados, versionados, medibles y probados**; una mejora visual no puede modificar el libro contable.
- No efectuar cambios destructivos en cuentas, base de datos, reglas de autenticación, migraciones irreversibles o producción sin copia, plan de rollback y autorización adecuada. Nunca solicitar ni almacenar contraseñas/tokens en el código, informes o repositorio. Usar pruebas anonimizadas.

### 2. Integridad financiera verificable — prioridad P0
- Construir un **inventario de invariantes** y pruebas de propiedades para ingresos, gastos fijos, variables, financiaciones, provisiones/huchas, compartidos, Disponible, saldo bancario, transferencias propias, efectivo, histórico y anulaciones. Todo dato monetario se calcula en céntimos o con una política decimal controlada; verificar redondeos.
- Mantener la regla de Disponible del PROMPT vigente, sin efectos secundarios por edición retroactiva; distinguir **previsiones**, **pagos realizados**, **movimientos bancarios** y **balances**. Variables ≠ Disponible. Fijos vinculados se muestran en historial como **Fijo** sin convertirse en gasto Variable ni restarse dos veces. No inventar pagos de fijos pendientes.
- Los movimientos deben mantener identidad estable por usuario, cuenta, proveedor, referencia bancaria y fechas. Reconciliación **idempotente** ante importación, reconexión, refresco, reintento, cambio de mes o dispositivo. Borrados/rechazos son tombstones/archivos persistidos: ningún proceso asíncrono puede resucitar cargos.
- Auditar conflictos de escritura offline/online, hidrataciones, restauraciones, outbox, sincronización y recuperación histórica antes de introducir migraciones. Probar importes bancarios diferentes de los previstos, pagos manuales, múltiples candidatos, devoluciones, rescates, transacciones retroactivas y 400+ registros.
- Operaciones de reparación de datos: ejecutar **dry-run**, copia verificable y reporte de antes/después; no corregir automáticamente saldos reales sin trazabilidad y verificación.

### 3. Aislamiento, nube y seguridad — prioridad P0
- La nube es la fuente de verdad después del login. Un usuario nuevo sin datos comienza en cero; usuario A jamás puede leer/escribir datos de B, incluso compartiendo dispositivo. Verificar restricciones de servidor, RLS/ACL cuando procedan, funciones de backend, sesiones, tokens, cachés y stores locales; las pruebas visuales no bastan.
- Cerrar sesión/reinstalar PWA/limpiar caché nunca borra el dato remoto ni mezcla perfiles. Tras autenticar, reconstruir desde servidor por identidad/versión, sin pisar datos recientes con caché antigua. Probar dos cuentas y dos dispositivos, offline→online, carreras y errores de red.
- Banco conectado no equivale a banco sincronizado: representar estado real, última sincronización, latencia, límites del proveedor, errores y reintentos con backoff. No prometer tiempo real si el proveedor no lo entrega. **Una notificación por cargo** y rechazo definitivo persistente.

### 4. Rendimiento élite con línea base y pruebas de no regresión — prioridad P0
- Instrumentar **arranque frío/caliente, primer gesto útil, clic en menú/logo, cambio de pestaña, Variables con listas grandes, Bancos, tiempo de render, tareas largas, memoria y llamadas red**. Separar medida de laboratorio (JSDOM/Chrome) de medida física (Safari/PWA iPhone).
- Comparar con **v97.68 aceptada**, y con el último candidato aceptado si es mejor, sobre **mismos datos, dispositivo, conectividad y secuencia**. Registrar mediana, p95, errores, FPS/scroll e INP/LCP/CLS si la plataforma permite medirlos. Mínimo 10 repeticiones de arranque por escenario y 20 operaciones repetidas de menú/pestañas; no inventar cifras.
- Objetivos de diseño orientativos: interacción menú ≤100 ms, pestaña caliente ≤200 ms, INP ≤200 ms, LCP ≤2,5 s, CLS ≤0,1 y scroll cercano a 60 FPS. Son metas, **no certificaciones**. El presupuesto de rendimiento no permite falsificar datos, usar saldos provisionales ni retrasar artificialmente UI para aparentar rapidez.
- Evitar listeners repetidos, render de paneles ocultos, serializaciones redundantes, consultas bancarias duplicadas, trabajo pesado sin prioridad y animaciones costosas. Mantener firma de datos con invalidación real tras modificaciones in-place y desde nube; jamás sustituirla por mera longitud de listas sin demostrar equivalencia.
- **Puerta bloqueante:** si hay regresión reproducible frente a la versión aceptada, abortar promoción y corregir. Si no existe acceso a iPhone, dejar estado `RENDIMIENTO_IOS_NO_VERIFICADO` en vez de declararlo aprobado.

### 5. Publicaciones y PWA reproducibles — prioridad P0
- Corregir de raíz la cadena **GitHub → QA → artefacto → GitHub Pages → navegador Safari → PWA**. La ejecución de Actions «success» no demuestra que Pages haya actualizado; comprobar versión **realmente servida** en URL, versión del HTML, rutas, cachés, estado del worker, manifest `id/start_url/scope` y comportamiento tras abrir desde icono.
- Incidencia observada el **13/10/2026**: el workflow v97.69 generó y publicó ZIP y HTML en el repositorio con QA verde, pero la petición adicional `POST /pages/builds` devolvió **HTTP 403** y no se verificó una nueva ejecución de `pages build and deployment`. Diagnosticar configuración real de Pages (rama frente a Actions), permisos y triggers; solucionar con mecanismo soportado y auditable, **no ocultar el 403 con `|| true`**.
- Mantener entrada canónica `index.html` y **PWA ESTABLE inmóvil** durante trabajo LAB. Solo promocionar cuando el usuario diga **«con labora»** y tras QA/aceptación y despliegue verificables. No exigir borrar caché, reinstalar, cambiar de URL ni perder datos para actualizar.
- Toda LAB nueva: número correlativo real, changelog, matriz de pruebas, SHA, enlace LAB, referencia ESTABLE, ZIP **completo descargable y verificable** y README claro. No generar enlaces ficticios ni declarar entrega/publicación si faltan permisos o confirmación del servidor.

### 6. Calidad, mantenibilidad y seguridad evolutiva
- Crear o fortalecer CI como **quality gate**: baseline hash, sintaxis de todos los scripts, pruebas unitarias/propiedades del libro contable, regresión financiera, 400+ movimientos, sincronización repetida, aislamiento multiusuario, interacción menú/logo, cambios de pestañas, acceso a Bancos, smoke visual móvil y smoke de despliegue.
- Priorizar eliminación de causas raíz frente a parches superficiales; modernizar incrementalmente el HTML monolítico solo tras crear pruebas, sin alterar UX/branding aprobado. Nunca modificar backend, sincronización, seguridad o finanzas por el mero objetivo de micro-optimizar.
- Mantener un **registro de problemas P0/P1/P2**, causa raíz, commit de corrección, prueba que demuestra cierre, riesgos residuales y plan de reversión. **No dar por solucionado lo que no se ha medido o probado.**
- Adjuntar valoración crítica por dimensión (0–100) únicamente como estimación explícita sustentada en evidencias; puntuación global no certifica seguridad ni disponibilidad bancaria. Dar recomendaciones concretas priorizadas por riesgo, esfuerzo e impacto.

### 7. Encargo operativo a ChatGPT Work
La ejecución detallada se encuentra en **`PROMPT_WORK_FLUXIA_ELITE_EJECUCION_INTEGRAL_2026-10-13.md`**, que forma parte del presente marco normativo. Work debe **diagnosticar y ejecutar las correcciones permitidas, no limitarse a describirlas**; aplicar primero P0 de publicación, integridad, persistencia y seguridad, luego optimización no regresiva, con entregas LAB progresivas y pruebas en cada paso. Trabajar autónomamente dentro de los permisos concedidos y pedir intervención solo para autenticación, permisos o cambios destructivos/producción que realmente lo exijan. El objetivo «élite» se alcanza por **evidencia medible**, nunca por una proclamación.


## Adenda Élite · ejecución 13/10/2026, evidencia y bloqueo de publicación

- v97.69 se publicó efectivamente en Pages mediante db7790fb93f64f922d8091ee6018fb83f294c338; ocho rutas comparadas por bytes. Mantener workflow soportado desde rama efectiva y smoke HTTP: QA verde o commit en main no prueba despliegue. Prohibido usar POST /pages/builds como vía de integración o silenciar su error.
- Pruebas obligatorias nuevas: dos cargos distintos mismo importe/día; dos IDs distintos mismo comercio; manual/pending comercio distinto; 400 IDs bancarios/diez reimportaciones; mismo ID bruto en bancos/cuentas distintas. No fusionar pagos confirmados por huella ni asociar manual/pending por importe únicamente.
- Generador de candidato v97.70 corrige falsas fusiones pero queda BLOQUEADO por identidad bancaria sin cuenta/proveedor y compatibilidad de referencias/tombstones. No convertirlo en LAB pública ni promover por pasar un subconjunto. Mantener visible el test crítico rojo.
- Seguridad: catálogos confirmaron contactos sin RLS y RPC de invitaciones SECURITY DEFINER invocable por anon. No declarar aislamiento integral. SQL preparado en AUDITORIA_ELITE/SEGURIDAD_PROPUESTA_NO_APLICADA.sql; aprobación y prueba en copia antes de cambios sensibles.
- Benchmarks JSDOM de diez repeticiones son evidencia de trabajo JS/DOM, no tiempos iPhone, INP/LCP/CLS/FPS. Safari/PWA físicos siguen NO VERIFICADOS. Ninguna prueba sintética ni puntuación autoriza promoción automática.
- Preservar raíz v97.66, LAB v97.68, referencias y almacenamiento; no reparar cifras reales mediante borrado/renumeración/reimportación ciega. Las correcciones pendientes y el dry-run forman parte de cada entrega.


## Adenda v97.70 · cierre de correcciones autorizadas y evaluación comparable

- El usuario autorizó todas las intervenciones el 13/10/2026. RLS Contactos/RPC de invitaciones aplicadas con backup y prueba sintética de roles. No pedir de nuevo esa aprobación. La promoción PWA sigue requiriendo «con labora».
- El bloqueo de IDs de v97.70 inicial queda superado por namespace proveedor/cuenta/referencia estable, pruebas ampliadas y backend LAB propio. entry_reference es la referencia de matching; transaction_id no es una referencia inmutable. Preservar bancoRef antiguo, checkpoint metadata y conflictos explícitos ante identificación insuficiente; no fusionar ni borrar para fabricar cuadre.
- Un solo propietario del aviso bancario, ledger durable por identidad/usuario y un canal según primer/segundo plano. Reimportar diez veces conserva cargos/importe y no multiplica avisos.
- El módulo de identidad se instancia bajo demanda, instalado antes del libro para que el archivo scoped sea seguro en recargas. No ejecutar bancos ni render oculto en ruta crítica.
- La valoración de una auditoría inicial de riesgos no es una caída medida de la app. Comparar versiones con mismos criterios/pruebas; separar estado operativo, cobertura y riesgos nuevos. No inflar una nota ni declarar mejora física sin medición.
- Mantener todas las bases/estables, fórmula financiera y SHA protegidos. QA completa y HTTP por bytes antes de declarar LAB publicada. Safari/PWA física, tokens reales y latencia PSD2 no se certifican a partir de simulaciones.

## Adenda v97.71 · papelera explícita y conciliación prudente de fijos (13/10/2026)

- Un guardado de lista no demuestra que el usuario borró sus filas: no inferir eliminaciones comparando snapshots, listas parciales o estados aún hidratándose. La Papelera solo recibe una fila desde una acción explícita de borrado; esa acción archiva una copia recuperable y es idempotente por ID.
- No restaurar filas de Papelera automáticamente al arrancar ni durante sincronización. La recuperación debe ser manual por elemento. Nunca borrar el original/histórico para corregir una falsa clasificación.
- No asociar un cargo de banco a un fijo por importe solamente. Texto inequívoco puede proponer/conciliar según las reglas vigentes; con comercio desconocido y un solo fijo de igual importe, preguntar y esperar confirmación explícita. Con varios candidatos o empate, no escoger.
- Mantener fijo pendiente, pago confirmado y cargo bancario como estados distintos. Una sugerencia no marca «pagado», no altera Disponible ni cambia la categoría contable hasta confirmar una vinculación válida.
- Investigar supuestos duplicados con proveedor, cuenta y referencia estable; mismo nombre, fecha o importe no autoriza fusionar. No editar, eliminar ni reimportar datos reales para fabricar un cuadre.
- Gates específicos del incidente: guardado parcial no archiva ITV; borrado manual sí puede recuperarse; carga no resucita papelera antigua; Apple.com/bill €2,99 pregunta solo con un candidato único; ambigüedad/empate no vincula. Mantener v97.68 y ESTABLE intactas.


## Regla de reconciliación fijada 13/10/2026 (incidencia Apple 2,99 €)
No basta con crear una sugerencia de vinculación bancario→fijo: debe atravesar el filtro de pendientes y verse en UI. Cuando el banco describe «Apple.com/bill» y existe un único fijo pendiente de 2,99 € del mes, mostrar propuesta persistente para confirmación, NO pagar automáticamente basándose solo en importe. Revalidar unicidad, mes, monto y estado al mostrar/confirmar; respetar descartes/«Nunca más» y no resucitar archivos. Cargos bancarios existentes previamente escaneados sin decisión explícita se pueden reconsiderar de forma acotada; la marca técnica «revisado» nunca debe bloquear para siempre una conciliación que no ocurrió. Tras confirmar, conservar un único cargo vinculado en la contabilidad autoritativa sin doble recuento Fijos/Variables ni alteración de la fórmula de Disponible. Probar visibles, no solo array de sugerencias, con escenario rojo v97.71 y verde candidato; mantener ESTABLE intacta hasta «con labora» y QA. Los fijos previamente pagados manualmente necesitan reconciliación separada sin generar otro pago: **NO se considera resuelto ese escenario**.


## Norma v97.73 — Compartidos Tricount sin doble conteo
Presentar importe mensual de gastos compartidos agrupando por gastoId único, con grupos, personas, fecha y pagador. Excluir reembolsos, préstamos puente y compensaciones de ticket gasto. Resumen de solo lectura; no modificar Disponible, nube, banco ni registros. Variables debe enseñar variables del mes, fijos/cuotas efectivamente pagados y total realizado sin incluir pendientes. Mantener estable intacta; QA y velocidad obligatorios antes de publicar. Beta app nativa después de validar funciones.


## LEY IMPERIAL 14/10/2026 — EL HTML ES LA BASE MADRE OBLIGATORIA DE ÉLITE

Toda app Fluxia Élite (PWA LAB, app SwiftUI, futura API) es evolución del HTML operativo; **nunca un producto distinto con reglas distintas**. Especificación funcional: HTML original actual. Élite puede mejorar experiencia, estructura, seguridad y rendimiento, pero debe preservar hasta el último registro, operación, estado, cálculo y enlace bancario.

- **Prohibida la migración selectiva** de 6 colecciones como si fueran el libro mayor completo. Rastrear todas las fuentes activas, almacenamiento por perfil, banco, espejo, exclusiones, papelera, provisiones, compartidos, fijos y fechas.
- **Prohibido declarar paridad por cantidad** o por una exportación de CSV incompleta. Auditar mismo usuario/perfil/mes y misma hora de corte por ID, importe en céntimos, fecha, categoría, origen, estado, duplicados y saldos; resultado exigido: 0 ausentes, 0 extras indebidos, 0 campos divergentes y 0,00 € de desfase.
- **Caso de aceptación de octubre del usuario:** 51 gastos variables visibles en HTML; archivo CSV exportado del mismo periodo da 52 filas / 811,39 €, y no incluye todavía un gasto de 7,50 € de gasolinera categorizado Tabaco del 14/10. Las repeticiones del CSV sin ID son sólo candidatas a revisión, jamás borrado automático. Cuadrar estas observaciones con trazabilidad.
- **Bancos:** usar el mismo sistema existente de permisos y conciliación; nuevos cargos sin duplicar y sin resurrección de descartes. Jamás añadir un cargo manual para ocultar un fallo bancario sin comprobar su fuente.
- **Versiones:** entregar checklist localizable con cada cambio ejecutable, QA, estado real, valoración y rollback; el diseño visual aprobado de Élite se mantiene salvo autorización expresa.
- **Guardarraíl:** mientras HTML y Élite no cuadren a nivel contable y de registros, **Élite no es apta para operar ni sustituir la estable**. Evitar promesas de “perfecta” basadas en mocks o tests sintéticos.

Véase `AUDITORIA_ELITE/CONTRATO_PARIDAD_HTML_MADRE_2026-10-14.md` para matriz de módulos, pruebas de reconciliación y política de aceptación.


## LEY IMPERIAL EXTENDIDA · COBERTURA TOTAL DE MÓDULOS (ÉLITE v1.9.1, 14/10/2026)
- El HTML BETA contiene, además de Inicio/Fijos/Variables/Huchas/Ingresos/Compartidos/Financiaciones: **Dinero en mano**, **Presupuestos**, **Pagos/Usos**, **Simular**, **Análisis**, **Bancos**, **Notificaciones**, **Ajustes** y **Ayuda**. Son obligatorios en Élite y no se aceptan versiones finales con pantallas vacías disfrazadas de función.
- **Dinero en mano** no es Disponible. Meter efectivo solo cambia cartera; gastar crea un único gasto Variable vinculado y reduce cartera; pagar desde una provisión afecta cartera y provisión sin doble reducción del Disponible. Edición y borrado deben corregir las dos entidades enlazadas de forma transaccional, con auditoría.
- Lecturas antiguas de Supabase (incluida una cartera con saldo 0 del 5/10) NO son cifras actuales. Mostrar fecha y fuente, y usar un guion/sin conciliar cuando corresponda.
- Élite permite comparar en memoria la cartera de un backup hecho por «Copia solo este perfil» del HTML: verificar identidad exacta y rechazar cualquier perfil distinto o clave global ambigua. Jamás enviar el archivo a servidores o usarlo para escribir movimientos en producción.
- Mientras no supere paridad bancaria/contable (incluido 51/51 Variables de octubre), cualquier escritura nueva de efectivo, provisión o presupuesto se ejecuta exclusivamente en el HTML ESTABLE. La interfaz Élite deberá explicarlo y no fingir guardados.
- Barra inferior compacta con Inicio/Fijos/Variables/Huchas/Más; el resto organizado en grupos de fácil acceso; mantener diseño aprobado y velocidad.
- Releases: versión diferenciada, checklist de novedades concreto, snapshots archivados, pruebas de seguridad y regresión, valoración /100 y ZIP completo o explicación expresa del bloqueo de su generación.


## Hotfix HTML: Disponible tras rescate temporal de hucha (15/10/2026)

- Alcance: HTML/PWA operativo, no Fluxia Élite. No modificar raíz/PWA estable ni el backend bancario.
- Regla: el rescate temporal pendiente de reponer aumenta Disponible en el mes de la fecha del rescate; se suma solo el saldo pendiente (`importe - repuesto`, mínimo cero), redondeado a céntimos. El rescate es efectivo disponible transferido desde una provisión, no ingreso bancario ordinario. La reposición reduce este efecto. El gasto definitivo de una provisión no incrementa Disponible.
- Ejemplo obligatorio: Disponible −200 € y rescate pendiente 100 € = −100 €. Recalcular/repintar no acumula el importe. Las operaciones retroactivas afectan al mes histórico de su fecha, no al mes actual.
- No aplicar esta regla a transferencias propias sin rescate de hucha identificado. No alterar movimientos bancarios, datos reales, importes, Variables ni la fórmula de aportaciones planificadas.
- QA dirigida ejecutada: diez casos de Disponible, idempotencia, rescate registrado de 150 €, reposición parcial/total, uso definitivo y separación entre meses/años. Suite HTML completa ejecutada: pruebas de 400 movimientos, navegación y bancos intactos, más la regresión del rescate; todo aprobado. QA baseline: seis archivos inmutables confirmados. Rendimiento físico iPhone: pendiente. GitHub Actions completo (QA, benchmark, deploy y smoke) pasó en el commit `040f894ac8d62713b876625213498750f01aba46`. HTTP 200 confirmado en la URL LAB con los marcadores de hotfix; HTTP 200 en la raíz estable sin el fix.
- Identificación de entrega: hotfix HTML de Disponible (15/10/2026) sobre la base LAB servida v97.66; no se presenta como nueva versión numerada. El build `hotfix-disponible-20261015` está publicado en `/lab/`. La raíz/PWA estable v97.66 continúa intacta hasta una autorización exacta «con labora».

## Élite v2.0.14 — cálculo de Disponible y lectura bancaria (15/10/2026)

La LAB Safari v2.0.14 persiste por propietario/perfil la bandeja de Enable Banking y presenta los cargos recibidos sin importarlos automáticamente al libro. El Disponible conserva la fórmula madre: ingresos − fijos con importe real enlazado − financiación − variables reales − provisiones previstas − exceso de aportación + impacto neto de Compartidos + rescates temporales pendientes de reponer. El motor cent-exact exige todos los componentes y la UI informa pendientes; no se permite adivinar datos ni usar una colección auxiliar como asiento contable. QA offline: `elite-banking-available-v2012.cjs`, `elite-financial-engine-v1977.cjs` y las regresiones de bancos, huchas y sesión. No actualizar PWA estable sin «con labora».


## Élite v2.0.15 — respuesta visible de sincronización bancaria (15/10/2026)

La respuesta y el error de **Bancos → Sincronizar bancos** deben mantenerse en el panel después de reconstruirlo y recuperarse al reabrir. No declarar conexión exitosa hasta mostrar la respuesta real de Enable Banking. La corrección conserva el aislamiento propietario/perfil, la bandeja de lectura y el guardarraíl sin escritura al ledger. QA de versiones, scripts, conector, preflight, idempotencia, conflictos y Disponible. No actualizar la PWA HTML estable.


## Fluxia Élite v2.0.16 (2026-10-15)
- Bancos guarda el último resultado y fecha/hora por usuario/perfil en localStorage aislado; al recargar se restaura el estado.
- Los avisos del proveedor por banco siguen visibles; los movimientos recibidos se mantienen en la bandeja.
- La importación al libro y el Disponible permanecen bajo conciliación explícita; esta versión no altera saldos ni escribe en Supabase.


## Fluxia Élite v2.0.17 (2026-10-15)
- «Sincronizar bancos» consulta movimientos y saldos reales por cuenta en `Fluxia-banco`, conserva resultado por usuario/perfil y muestra un total actual por moneda separado del Disponible mensual del libro.
- Saldos en caché cuando un proveedor bloquea por HUB046 se muestran con fecha y no se suman como actuales.
- La Edge Function prioriza `ITAV`/`CLAV`/`FWAV` sobre balances contables para identificar los importes disponibles.

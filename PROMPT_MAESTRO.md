# 📋 PROMPT MAESTRO FLUXIA v93.8.2+
## Biblia de desarrollo, versionado, QA y entrega profesional

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

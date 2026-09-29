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

# 📋 PROMPT MAESTRO FLUXIA v91+
## Biblia de desarrollo, versionado y prevención de regresiones

**Versión de este documento:** 2.0  
**Aplicable desde:** index_fluxia_v91.html en adelante  
**Último revisado:** 27 Septiembre 2026  
**Responsable:** Arquitectura de Fluxia para que JAMÁS vuelva a fallar

---

## 🎯 PROPÓSITO

Cualquier cambio en Fluxia debe:
1. Respetar versionado secuencial (**v91 → v91.1 → v92…**)
2. Badge + título + `FLUXIA_VERSION` + nombre de archivo coherentes
3. Pasar checklist de regresiones **con el número de versión instalado**
4. Documentar qué cambió y por qué
5. **Nunca** romper logo, nombre de app, ni datos del usuario

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

Si iOS cachea un icono viejo: el usuario debe quitar la app de inicio y volver a añadirla. El código debe seguir sirviendo el logo oficial.

---

## 💾 INTEGRIDAD DE DATOS (VITAL — JAMÁS A 0)

**Problema:** tras un tiempo, sync, o recarga, listas (movimientos, ingresos, fijos, compartidos…) aparecen a 0.

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

Checklist obligatorio en cada release:
- [ ] Importar copia real → cerrar app 5 min → reabrir → mismos totales
- [ ] Sync banco → no baja el recuento de movimientos legítimos
- [ ] `FluxiaSalud.exportar()` muestra conteos > 0 si el usuario tiene datos

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

## 🌐 CANAL ESTABLE (INVITADOS)

Mientras tú modificas `index_fluxia_v91.html`, `v92`…:

| Enlace para la gente | Qué es |
|----------------------|--------|
| `https://USUARIO.github.io/REPO/` o `…/index.html` | **Único enlace estable** |
| Controlado por `fluxia-canal.json` → campo `estable` | Qué HTML cargan |

```
✅ Invitados: SIEMPRE index.html (loader)
❌ Invitados: NUNCA index_fluxia_v91.html directo mientras pruebas
✅ Tú: puedes abrir el HTML de laboratorio
✅ Promover: solo entonces cambias fluxia-canal.json
```

`fluxia-canal.json` **no guarda gastos**. Solo elige qué archivo HTML es oficial.

---

## 🤝 COMPARTIDOS

### Saldo de partida
Permitir crear cuenta/grupo con deuda previa (ej. «Ana me debe 150 €»).  
Los gastos y pagos posteriores **ajustan** ese saldo:
- Ella paga un gasto compartido → puede subir lo que tú le debes
- Tú pagas → se descuenta lo que ella te debía (o sube lo que te deben)

Botón: **💶 Saldo de partida** en Compartidos.

### Pagado por
Si el contexto es un grupo/persona (ej. Ana), el selector y etiquetas deben mostrar **Ana**, no el genérico «Otra persona».

### Comportamiento general
- Nuevo grupo → participantes
- Gastos con pagador + reparto
- Registrar pago (Bizum) descuenta saldo
- Nunca borrar liquidaciones sin confirmación

---

## 🔔 NOTIFICACIONES

### Dentro de la app
- Toasts discretos (tamaño/opacidad moderados)
- Notificaciones programadas (diaria/presupuesto) **off por defecto**
- Solo avisar lo importante (error guardado, cargos banco, deudas críticas)

### Cargos bancarios (estilo Revolut)
- Con app abierta: Notification + detalle concepto · importe
- Con app cerrada: Web Push + Edge Function del banco (servidor)
- Título: **Fluxia** · Cuerpo: concepto · importe · logo oficial

---

## 🚨 REGRESIONES HISTÓRICAS (siguen vigentes)

1. No borrar gastos al sincronizar  
2. No duplicar por backup dentro de sync  
3. No sustituir listas por copias internas automáticamente  
4. Auto-login favorito / usuario real  
5. Gate: solo 2 botones hasta «Ya tengo usuario»

---

## 📋 CHECKLIST ANTES DE CADA RELEASE (v91+)

- [ ] Versión archivo = badge = meta = FLUXIA_VERSION = checklist Ayuda
- [ ] Logo oficial + nombre **Fluxia BETA** en metas y manifest
- [ ] Ningún guardado vacío pisa datos existentes
- [ ] Test: datos > 0 tras recarga y tras sync
- [ ] Compartidos: saldo de partida + nombre de persona en «Pagado por»
- [ ] Invitados siguen en `index.html` + canal.json sin tocar
- [ ] Notificaciones in-app no spam
- [ ] Meses ocultos en Ajustes/Ayuda

---

## 🎓 REGLAS DE ORO

1. Nunca listas = backup/remoto vacío sin confirmación  
2. Nunca datos a 0 por accidente  
3. Nunca cambiar logo ni «Fluxia BETA» en instalación  
4. Versionado secuencial + checklist de esa versión  
5. Invitados → canal estable; laboratorio → HTML versionado  
6. Sincronización automática sin pedir permiso cada vez  
7. Si algo desaparece → auditoría + posibilidad de devolver  

---

## 🏁 CONCLUSIÓN

v91 refuerza **marca**, **integridad de datos** y **compartidos con partida**.  
Si ves datos a 0, icono «F» genérico, o nombre sin BETA al instalar: **DETENTE y corrige antes de subir.**


---

## ⛔ v91.2 — DATOS A 0 (REGLA ABSOLUTA)

Ocultar/borrar **notificaciones NUNCA** puede llamar a lógica que recargue o vacíe el plan.
- `ocultarNotificacion` / silencio → solo flags de UI, **sin** `renderAll()` que dispare guardados vacíos.
- `guardarLS` **bloquea** arrays `[]` si había datos.
- `FluxiaAntiCero` escanea localStorage y restaura si la UI muestra 0.
- Toda baja de gasto/ingreso/fijo/compartido → **Papelera 30 días** (`FluxiaPapelera`).

Si el usuario ve 0: Ajustes → «Recuperar datos si aparecen a 0».


---

## ⛔ v91.5 — CAUSA RAÍZ «DATOS A 0»

Los datos se guardan como `fluxia_user_<id>__planRescate_v2_*`.  
Si el perfil activo es otro o `sin-perfil`, la app **lee vacío** aunque los datos existan.

**Reglas:**
1. `Almacen.getItem` debe buscar en **todos** los prefijos si la clave actual está vacía y migrar.
2. El remoto **nunca** gana si viene `[]` y local tiene items.
3. Botón **Recuperar plan si está a 0** en Ajustes.
4. `FluxiaRecuperarPlan()` al arrancar y al volver a la app.

Checklist: borrar notificaciones, cambiar de pestaña, background 10 min → totales iguales.


---

## v91.6 — BORRAR VARIABLE + ATRÁS NUEVO USUARIO

1. Onboarding nuevo usuario: **Atrás/Cancelar** vuelve a la puerta (Crear / Ya tengo) sin atascarse.
2. Al borrar un gasto variable (manual o banco):
   - Va a **papelera** (30 días)
   - Se guarda en `fluxia_gv_borrados_v1` (id, bancoRef, huella)
   - `aplicarMovs` **no reimporta** ese cargo aunque el banco lo siga enviando o cambies de index
3. La lista de borrados es del dispositivo (y Almacén si hay nube); sobrevive a actualizaciones de HTML.


---

## v91.7 — ORDEN DE ARRANQUE (INQUEBRANTABLE)

Tras añadir a pantalla de inicio / abrir app:

1. **Splash** (logo oficial + Fluxia BETA)
2. **Puerta de bienvenida** (Crear nuevo usuario / Ya tengo un usuario) si no hay sesión real
3. Onboarding del usuario nuevo (con Atrás)
4. **Protege Fluxia** (Face ID / clave) **solo** cuando ya hay usuario configurado — nunca en la 1ª visita vacía

```
❌ JAMÁS abrir con «Protege Fluxia» sin usuario
✅ Recordar sesión solo tras credenciales / usuario creado
✅ Siguiente entrada: splash → (bloqueo si está activo) → app
```

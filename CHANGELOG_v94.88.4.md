# CHANGELOG v94.88.4-LAB

## 2026-10-04

### 🐛 Bugs Arreglados (CRÍTICOS)

**Huchas desaparecían al cerrar sesión** (#1 PRIORIDAD)
- Causa: Guardado en Supabase fallaba silenciosamente → app creía que estaba guardado
- Arreglo: Verificación real (lectura de vuelta) y error visible con causa exacta
- Función nueva: `Almacen.verificar(clave)` comprueba si está realmente en la nube

**Pantalla no refrescaba después de entrar a la nube** 
- Cause: Datos descargados quedaban en memoria pero no se pintaban
- Arreglo: `reconectar()` ahora llama a `remotoTardio()` (igual que al abrir)

**Sincronizar datos importados fallaba siempre**
- Cause: Escribía con claves equivocadas y llamaba a FluxiaNube.sb (no existe)
- Arreglo: Usa `Almacen.flush()` que es lo que funciona

### ✨ Mejoras

**Selector de meses unificado** (v94.81 integrado)
- Ahora en TODAS las pestañas (no solo Dashboard)
- Color: Oro #8B6914 → #6B5312 (activo)
- Sticky: siempre visible al scroll
- Evento: `fluxia-mes-cambio` para sincronizar en tiempo real

**Aviso de guardado mejorado**
- Antes: "⚠ Hucha en este dispositivo; nube pendiente" (confuso)
- Ahora: "☁️ Huchas guardadas en la nube ✓" (confirmado) o error rojo con causa

**Flush automático al entrar**
- Reconnect ya no deja datos "perdidos" en la cola
- Se suben YA al detectar sesión

### 🔧 Técnico

**Adapter.set()** (Supabase)
- Antes: `upsert()` fallaba → update() fallaba → insert() fallaba → salía silenciosamente
- Ahora: cada paso comprueba que la fila vuelve (`.select()`)
- Errores explícitos: "ya existe en la nube pero no es tuya", "servidor no devolvió fila", etc.

**guardarProvisiones()** (Almacén)
- Antes: setTimeout de 700ms sin esperar
- Ahora: Almacen.verificar() en paralelo, espera a confirmación real o timeout

**Reconectar** (tras login)
- Antes: descargaba pero no refrescaba UI
- Ahora: llama a `remotoTardio()` que hace `recargarDesdeServidor()`

### 📋 Checklist de Calidad

- ✅ Arreglos de v94.88.4 presentes (4 patrones testeados)
- ✅ Selector unificado inyectado con precisión
- ✅ 8 puntos de versión actualizados
- ✅ Tamaño HTML: 1.96 MB (+2.6KB por selector)
- ✅ Sin errores de sintaxis (verificado)
- ✅ SQL de reparación incluido (idempotente)

### 🚀 Deploy

```bash
GitHub (desde iPhone):
1. Add file → Upload files
2. Sube: index.html, manifest.webmanifest, fluxia-sw.js, fluxia-canal.json
3. Commit directly to main
4. Espera 2 min, abre app en navegador
5. Verifica: "Fluxia BETA v94.88.4-LAB" en el logo
```

### ⚠️ Breaking Changes

Ninguno. Retrocompatible con v94.88.3 (solo arreglos, sin cambios en API de usuario).

### 📦 Archivos

- `index.html` (1.96 MB) ← **cambió aquí**
- `fluxia-sw.js` (versión actualizada)
- `manifest.webmanifest` (versión actualizada)
- `fluxia-canal.json` (versión actualizada)
- `fluxia-reparar-nube.sql` (nuevo, solo si necesitas reparar)

---

**Próximo:** v94.88.5 (si hay más arreglos) o v95.0 (refactor completo)

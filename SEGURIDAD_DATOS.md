# ¿Se pierden los datos si cambio el index en GitHub?

## Respuesta corta: **NO**

Los datos se guardan en **tres lugares completamente independientes** del archivo index.html:

### 1. **localStorage del navegador** (lo principal)
- **Dónde**: En el almacenamiento privado del navegador/app del iPhone
- **Cómo se guarda**: Cuando haces cambios (agregar un gasto, ahorrar dinero, etc.)
- **Duración**: Permanente, incluso si cierras Safari y reabres
- **Independencia**: No se toca NUNCA aunque cambies el index

```
localStorage = la bóveda de seguridad del iPhone
index.html = la interfaz para acceder a esa bóveda
```

Cambiar index es como rediseñar la interfaz de un banco: tus dineros siguen en la caja fuerte.

### 2. **Servidor Render** (si está configurado)
- Tus datos también se guardan allí
- Se sincronizan automáticamente
- Completamente independiente de GitHub

### 3. **localStorage del navegador en GitHub Pages** (viejo)
- Si vienen desde la URL antigua de GitHub Pages
- También intacto

---

## Casos donde NO hay riesgo

- ✅ Cambias diseño o colores
- ✅ Añades una pestaña nueva
- ✅ Corriges un cálculo (la estructura de datos sigue igual)
- ✅ Cambias mensajes de texto
- ✅ Actualizas logos

## Únicos casos con riesgo (evitarlos)

- ❌ Cambias las **claves de localStorage** (ej: `planRescate_v2_ingresos` por `planRescate_v3_ingresos`)
- ❌ Cambias cómo se serializa/deserializa el JSON
- ❌ Cambias radicalmente la estructura de provisiones, fijos, etc.

---

## Cómo protegerse aún más

Si haces cambios importantes:

1. **Haz una copia de respaldo PRIMERO**:
   - Tu app: *Datos → Descargar copia*
   - Pareja: lo mismo

2. **Después cambias en GitHub**

3. **Si algo falla** (muy raro):
   - *Datos → Cargar copia* y tienes todo de vuelta

4. **Mejor aún**: usa el servidor Render
   - Los datos no dependen de nada
   - Se replican automáticamente entre dispositivos

---

## En resumen

| Cambio | localStorage | Servidor | Riesgo |
|--------|---|---|---|
| Diseño/colores | ✅ Intacto | ✅ Intacto | 0% |
| Nuevas funciones | ✅ Intacto | ✅ Intacto | 0% |
| Corregir bug | ✅ Intacto | ✅ Intacto | 0% |
| Cambiar claves | ❌ PIERDE | ❌ PIERDE | 100% |

Los datos de tu pareja **solo se pierden** si cambias las claves o estructuras de localStorage. **Nunca hagas eso sin avisar.**

# Fluxia v94.88.4-LAB

**Fecha:** 2026-10-04  
**Cambios principales:**
- ✅ **ARREGLO CRÍTICO:** Guardado de huchas en Supabase con verificación real (no fallaba silenciosamente)
- ✅ **Selector unificado de meses** en TODAS las pestañas (v94.81 integrado)
- ✅ **Verificación en la nube** tras guardar: si falla, se ve el error con la causa
- ✅ **Flush automático** al entrar: los datos descargados se refrescan en pantalla sin recargar

## Qué se arregló

### Problema (v94.88.3 y anteriores)
Cuando Supabase rechazaba el guardado de una hucha (error en índice único, permisos RLS, etc), la app:
1. No lo veía
2. Mostraba "guardado" en la nube
3. Al cerrar sesión y volver a entrar: **la hucha desaparecía**

Verificamos que pasaba en estos casos:
- Sin índice único `(user_id, clave)` en Supabase
- Clave primaria solo en `clave` (otra cuenta ya la tenía)
- RLS sin política UPDATE

### Arreglo (v94.88.4)
Cada guardado ahora:
1. Escribe en Supabase
2. **Lee de vuelta** la fila (`.select()`) para confirmar que realmente se guardó
3. Si falla en cualquier paso → error visible con la causa exacta
4. Función nueva `Almacen.verificar(clave)` para checar en tiempo real si está en la nube

## Cómo verificar que funciona

1. **Abre la app** en https://nacram1987-cmd.github.io/Fluxia-v20/
2. **Entra a tu cuenta**
3. **Ve a Huchas**
4. **Crea o edita una hucha** (ej: "Seguro" con 100€)
5. **Guarda** → deberías ver: `☁️ Huchas guardadas en la nube ✓` (en 1-2 segundos)
6. **ESPERA** a que aparezca el aviso (no cierres sesión de inmediato)
7. **Cierra sesión** → vuelve a entrar
8. **Abre Huchas** → debe estar la hucha ahí

Si sale rojo con un error, la causa te dirá qué falta en Supabase.

## SQL de reparación (solo si ves errores)

En **Supabase → SQL Editor**, pega el PASO 1 de `fluxia-reparar-nube.sql`:
- Quita filas duplicadas
- Crea índice único `(user_id, clave)`
- Limpia 13 políticas RLS viejas → 4 políticas limpias

Es idempotente: puedes repetirlo sin miedo.

## Archivos

- `index.html` → **suelta en el repo raíz** (el navegador la sirve)
- `manifest.webmanifest` → suelta en la raíz (PWA manifest)
- `fluxia-sw.js` → suelta en la raíz (service worker)
- `fluxia-canal.json` → suelta en la raíz (define versión)
- `fluxia-reparar-nube.sql` → úsalo en Supabase si ves errores

## Instalación (desde iPhone)

1. **GitHub → tu repo fluxia**
2. **Add file → Upload files**
3. Sube los 4 archivos:
   - index.html
   - manifest.webmanifest
   - fluxia-sw.js
   - fluxia-canal.json
4. **Commit directly to main**
5. **Espera 2 minutos** (Pages actualiza)
6. Abre la app en el navegador (F5 / reload si la tenías abierta)
7. Verifica que dice **"Fluxia BETA v94.88.4-LAB"** en el logo

## Si aún no tienes la tabla en Supabase

**Primero:** crea la tabla base (el SQL que tenías).  
**Luego:** ejecuta el PASO 1 de `fluxia-reparar-nube.sql`.

## Soporte

Si ves un error al guardar una hucha:
- Cópialo exacto
- Pega el PASO 1 de `fluxia-reparar-nube.sql` en SQL Editor
- Intenta de nuevo
- Si persiste, mándame el error

---

**Versión:** v94.88.4-LAB  
**Estado:** Listo para producción  
**Selector de meses:** En todas las 7 pestañas (Inicio, Ingresos, Fijos, Variables, Compartidos, Huchas, Ayuda)  
**Color selector:** Oro #8B6914 → #6B5312 (activo)

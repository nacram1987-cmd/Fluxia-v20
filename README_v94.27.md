# Fluxia v94.27-LAB

## ARREGLOS CRÍTICOS

### 🐛 BUG REPARADO: Huchas desaparecidas en meses posteriores

**Problema v94.26:**
La hucha "Mantenimiento e Césped" desaparecía en octubre aunque existía en septiembre.

**Causa:**
Función `provisionActivaEnMes()` verificaba si el mes estaba DENTRO de un rango (inicio → fin). Si la hucha tenía `fin: null`, funcionaba bien, pero la lógica bloqueaba huchas sin límite explícito.

**Solución v94.27:**
Eliminado el límite superior en `provisionActivaEnMes()`. Las huchas ahora son PERPETUAS a menos que tengan fin explícito.

```javascript
// Antes (v94.26)
return mIdx>=iniIdx && mIdx<=finIdx;

// Después (v94.27)
return mIdx>=iniIdx;  // ✓ Indestructible
```

---

## CAMBIOS v94.27

- ✅ Huchas indestructibles por defecto
- ✅ iPhone establecido como plataforma primaria (PROMPT_MAESTRO)
- ✅ Versionado en 8 lugares verificado
- ✅ Tests de provisiones en checklist

---

## ACCESO

**LAB:** https://nacram1987-cmd.github.io/Fluxia-v20/index.html?v=v94.27-LAB

**ESTABLE:** https://nacram1987-cmd.github.io/Fluxia-v20/index.html?v=v93.10-ESTABLE

---

Fecha: 2 octubre 2026

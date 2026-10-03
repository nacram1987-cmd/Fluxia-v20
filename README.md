# Fluxia v94.67-LAB

Tu control financiero personal · Presupuestos · Ingresos · Gastos · Tarjetas · Préstamos

## Cambios v94.65 → v94.66-LAB

### ✨ Mejoras Visuales
- **Paleta "Tu mes"**: Degradado azul marino (#0F3A5C) → teal → oro para mayor profundidad

### 🏗️ Arquitectura
- **Checklist integrado**: 6 items reales sincronizados desde README
- **Diagnóstico de gastos faltantes**: Suite paralela a ingresos
- **Origen en papelera**: User vs System tracking
- **Multi-dispositivo**: Debounce 500ms mejorado
- **Avisos banco→fijo**: Fecha siempre visible

## 🐛 Problemas Conocidos
- **Cargo Abarrotao ~18€**: Movimiento fantasma (multi-dispositivo)
- **Presupuesto fantasma**: Se crea sin datos de entrada
- **Duplicados papelera**: Después de restaurar

## 📦 Cómo Usar

1. **Navegador**: Abre index.html en Chrome/Safari/Firefox
2. **PWA**: En Chrome → Instalar desde la barra de dirección
3. **Servidor web**: Sube TODOS los archivos a tu servidor

## 🔧 Configuración Técnica

**localStorage**: ~5-10 MB | **Offline**: No (en desarrollo) | **Sync**: Eventual consistency

## 🎯 Versionado (8 puntos)
✅ `<title>` · `<meta>` · `window.FLUXIA_VERSION` · `#fluxiaVersion` · `#fluxiaLabVersionLabel` · Archivo · `manifest.webmanifest` · `fluxia-canal.json`

---
v94.66-LAB · 4 Oct 2026 · Listo para usar


## v94.67-LAB · consolidación
- Dashboard principal simplificado: Disponible real como cifra protagonista.
- Entradas, compromisos, provisiones y variables quedan como desglose único.
- Navegación mensual anterior / Hoy / siguiente sin cambiar de mes al navegar por pestañas.
- Notificaciones internas con un único temporizador.
- LAB y ESTABLE siguen siendo canales separados; el manifest no se utiliza para cambiar el canal estable.

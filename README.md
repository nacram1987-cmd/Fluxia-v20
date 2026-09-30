# Fluxia v93.10-LAB

**Versión:** v93.10-LAB  
**Estado:** Testing (Developers y testers)  
**Datos:** De prueba solamente  
**URL:** https://nacram1987-cmd.github.io/Fluxia-v20/index_fluxia_v93.10_LAB.html

## Cambios en v93.10

1. **HTML limpio**
   - ✓ Eliminado bloque HTML duplicado
   - ✓ Eliminado residuo `</section> html>`
   - ✓ Ahora contiene solo 1 DOCTYPE, 1 html, 1 body

2. **Menú lateral fijo**
   - ✓ Encabezado (nombre usuario + cerrar sesión) permanece fijo
   - ✓ Solo scrollea la lista de opciones
   - ✓ Respeta área segura en iPhone (notch)

3. **Retorno bancario robusto (CaixaBank)**
   - ✓ Espera a que la sesión esté disponible (hasta 10 seg)
   - ✓ Guarda el código de banco si falta sesión
   - ✓ Muestra mensajes de error claros
   - ✓ Guía al usuario a volver a la app instalada

## Checklist

- [x] Versionado coincide (archivo, código, meta, title)
- [x] HTML abre sin errores (F12 limpia)
- [x] Menú lateral probado
- [x] CaixaBank: retorno manejado
- [x] ZIP contiene TODOS los archivos
- [x] README incluido

## Prueba 1-2 días. Si OK → promover a ESTABLE.

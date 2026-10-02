# Fluxia BETA v94.45-LAB · Fases 3 y 4

## ¿Qué es el "ping" del banco? (no tienes que hacer nada raro)

El **ping** no es un botón en el móvil. Es una llamada interna:

1. Abres **Ajustes → Bancos** (o el icono de banco).
2. La app pregunta al servidor: `accion: "ping"`.
3. El servidor responde algo como: `{ "success": true, "pong": true, "version": "fluxia-banco-v94.30" }`.

**Si ya subiste el .ts a Supabase**, al abrir Bancos debería comportarse con:
- HUB046 = límite diario (no “sesión rota”)
- Cabeceras PSU en sincronización manual

**No hace falta** entrar a consola ni a Enable Banking solo por el ping.  
Si Caixa muestra “Conectado · límite diario” o “Conectado” y no te fuerza a reconectar sin motivo, el servidor está bien.

Para comprobar a conciencia (opcional, en el PC): Network del navegador → petición a la Edge Function → respuesta del `ping`.

---

## Fase 3 (robustez de datos)
- Editar **fijo / hucha / financiación** guarda por **id** (aunque la lista se haya recargado con el modal abierto).
- Marcar **pagado** también escribe en el objeto actual de la lista.
- Edición de reembolso en compartidos por **id**.
- Héroes de efectivo / presupuestos / financiaciones alineados al estilo cálido.

## Fase 4 (confianza / no perder datos)
- Aviso en **Inicio** si hace mucho que no hay copia o no hay nube.
- Al exportar copia (`descargarBackup`) se recuerda la fecha de última copia.
- Onboarding “Sin cuenta” y copia cifrada siguen siendo la vía única (sin duplicar botones).

## Estable
**v94.38-ESTABLE** (sin cambio).

## Qué probar cuando vuelvas
1. Editar un fijo, esperar 2 s, guardar → debe persistir al recargar.
2. Marcar un fijo pagado → confirmación + queda pagado.
3. Ajustes: abrir un bloque, ir a Ingresos y volver → todo plegado.
4. Bancos: ver saldos (vivos o “último conocido”).
5. Inicio: si no hay copia reciente, el aviso de “Para no perder nada”.

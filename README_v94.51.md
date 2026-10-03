# v94.51-LAB

## UI (definitivo)
Mismo CSS que el bloque Dashboard `#tuMes` / `.tu-mes`:
`linear-gradient(150deg, gold-soft → surface → teal-soft)`
Número serif grande en `var(--teal)`.
CSS inyectado al **final del body** para que gane a reglas viejas.

## Sin cuenta
1. Prefijo de almacenamiento del perfil nuevo
2. Reset nuclear de ese prefijo
3. **location.reload()** para no dejar en memoria los datos del perfil anterior

## IMPORTANTE en el iPhone
Si sigue viendo el estilo viejo:
1. Ajustes → Safari → Borrar historial y datos del sitio, O
2. Quitar Fluxia de pantalla de inicio y volver a abrir la URL con `?v=v94.51-LAB`
La PWA a veces cachea el HTML antiguo.

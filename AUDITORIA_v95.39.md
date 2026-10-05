# Auditoría v95.39

## Alcance
Esta LAB parte de v95.38, preservando la reparación cloud-first de Huchas e Ingresos. No modifica la fórmula de Disponible ni la reconciliación financiera.

## Cambio funcional
Los pagos definitivos de Huchas almacenan la fecha elegida por el usuario. El mes se deriva de dicha fecha. La conversión «Era un pago» ofrece el mismo control.

## Rendimiento / estabilidad visual
- Toast reutilizable fuera del flujo del documento.
- Avisos no críticos de arranque silenciados durante 1,8 s.
- Coalescencia de render global solapado en un único frame.
- Transiciones suspendidas durante el repintado global para reducir parpadeo.
- El estado de nube se pinta localmente, sin forzar un render completo adicional.

## Gate
La ESTABLE continúa siendo v95.25. v95.39 permanece LAB hasta validación manual.

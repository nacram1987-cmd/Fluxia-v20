# Evaluación v97.65

Fallo encontrado: se guardaba el scroll al abrir menú pero body se fijaba sin top negativo; al cerrar tampoco se restauraba. Cabecera heredaba position:relative y desaparecía con scroll. El logo era un div con listeners de teclado manuales. Se corrigen estas causas concretas y se conserva la navegación canónica. La mejora de rendimiento elimina blur y evita renderizar el contenido de menú mediante content-visibility automático. No garantiza ser «la mejor app» ni una latencia exacta; pendiente validación física Safari/PWA.

La v97.65 refuerza el envío de eventos de menú/logo. No se ha confirmado la causa exacta del nuevo reporte en iPhone; se cubren hijos SVG, DOM reconstruido y listeners únicos.

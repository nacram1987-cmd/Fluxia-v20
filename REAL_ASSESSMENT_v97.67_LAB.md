# Evaluación real · Fluxia v97.67-LAB
- **Mejora determinista:** una serialización completa menos en la primera renderización de cada panel (2 → 1).
- **Mejora de flujo:** suprime reanudación/programación redundante durante navegación desde menú, preservando cierre manual.
- **Compositor:** elimina `will-change:transform` y `translateZ(0)` aplicados globalmente a paneles, con el objetivo de evitar capas GPU permanentes en Safari.
- **Qué NO prueba:** ninguna cifra de ms en iPhone, rendimiento de conexión bancaria en red móvil, latencia del arranque en dispositivo, mejora universal frente a otras aplicaciones.
- **Riesgos:** la mejora de paneles con animaciones o composición específica puede variar entre motores. Medir antes de promover a PWA.
- **Fiabilidad:** cálculos/contabilidad y scripts bancarios sin cambios; la navegación aún utiliza firmas completas por integridad ante mutaciones in-place.
- **Rollback:** ESTABLE y copia inmutable v97.66 no alterados. Basta dejar de usar la URL LAB si se observa regresión.

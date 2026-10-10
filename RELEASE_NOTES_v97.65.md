# v97.65 — menú y logo con scroll

Corregir body fijo sin compensación al abrir menú: guardar posición, aplicar top negativo y restaurar scroll al cerrar. Navegar a otra pestaña conserva scroll a Inicio del flujo canónico. Cabecera sticky, opaca y sin blur; safe-area sin altura máxima que recorte botones. Logo convertido a botón nativo, sin keydown duplicado. Drawer/overlay con orden explícito y contenido visible sin contain. Conserva mejoras de velocidad v97.61–63. No modifica cálculos, motor bancario, nube ni guardado.

Activación delegada capture única: menú/logo llaman funciones canónicas; se retiran los dos listeners directos anteriores. Iconos no interceptan eventos. Menú admite toggle. Se conserva teclado nativo.

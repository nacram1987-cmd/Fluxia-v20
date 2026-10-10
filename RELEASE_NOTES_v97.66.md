# v97.66 — Gastos variables sin Disponible

Origen reproducido en v97.65: el propio panel de Variables contenía `gvAjustadoVal`, que el render diferido rellenaba con `disponibleEfectivo(mes)`. Se elimina ese bloque del HTML y su escritura, no se oculta mediante un parche CSS. Se mantienen los dos totales específicos de Variables.

El motor financiero, Disponible de Inicio, Imprimir, navegación, menú/logo, nube, perfiles y módulo bancario se preservan. No se han ejecutado sincronizaciones de cuentas reales ni se han modificado sus datos.

El PROMPT MAESTRO incorpora la restricción permanente y el test reproducible correspondiente. Nuevas cachés raíz/LAB v97.66, misma identidad y entrada PWA.

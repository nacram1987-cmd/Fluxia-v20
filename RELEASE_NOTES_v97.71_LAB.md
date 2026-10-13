# Fluxia v97.71-LAB — Papelera segura y propuesta de fijo

Versión LAB publicada tras QA sintética, despliegue y smoke HTTP por bytes. ESTABLE y v97.68 permanecen intactas; no promover sin la instrucción expresa «con labora».

## Correcciones

- Un guardado con lista parcial ya no manda cargos ausentes a Papelera.
- El borrado explícito de movimiento conserva una copia recuperable en Papelera.
- No se restauran cargos de Papelera automáticamente al arrancar.
- `Apple.com/bill` puede generar una propuesta de asociación si solo hay un fijo pendiente por el mismo importe. El cargo no se marca pagado hasta que el usuario confirme. Ambigüedad y empates no se vinculan.

## Límites

No se altera ni limpia información real del usuario. La clasificación de cargos Valkiria no puede resolverse sin una sincronización/exportación autenticada que exponga sus referencias estables. Safari/iPhone y proveedor PSD2 con credenciales reales no fueron probados.

LAB: https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.71.html
PWA LAB: https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.71/index.html
ESTABLE intacta: https://nacram1987-cmd.github.io/Fluxia-v20/
Referencia: https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.68.html

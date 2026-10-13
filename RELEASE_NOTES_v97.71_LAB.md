# Fluxia v97.71-LAB — Papelera segura y propuesta de fijo

Versión LAB independiente en preparación. ESTABLE y v97.68 permanecen intactas; no promover sin la instrucción expresa «con labora».

## Correcciones

- Un guardado con lista parcial ya no manda cargos ausentes a Papelera.
- El borrado explícito de movimiento conserva una copia recuperable en Papelera.
- No se restauran cargos de Papelera automáticamente al arrancar.
- `Apple.com/bill` puede generar una propuesta de asociación si solo hay un fijo pendiente por el mismo importe. El cargo no se marca pagado hasta que el usuario confirme. Ambigüedad y empates no se vinculan.

## Límites

No se altera ni limpia información real del usuario. La clasificación de cargos Valkiria no puede resolverse sin una sincronización/exportación autenticada que exponga sus referencias estables. Esta versión necesita superar QA y smoke HTTP antes de publicarse.

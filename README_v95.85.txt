FLUXIA v95.85-LAB
Base: v95.84, conservando el fix bancario.

ARREGLO PRINCIPAL
- Elimina en lectura/sincronización la duplicidad conocida Excel + rebase_v9538.
- Conserva una sola identidad canónica para las 7 huchas.
- Sella la colección canónica para que planRescate legacy no pueda sustituirla.
- Si detecta la familia duplicada en el namespace actual, guarda de nuevo la colección limpia.
- No modifica ingresos ni gastos fijos.

BANCA
- Se conserva el fix v95.84: HUB046 de CaixaBank no bloquea Revolut ni otros bancos.

SUBIDA
Sube TODOS los archivos del ZIP a la raíz de Fluxia-v20.

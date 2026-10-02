# Fluxia v94.35-LAB
Base: v94.34. Cambio (solo cliente; el .ts NO cambia):

- HUCHAS: corrige el aviso «¿Sigue activa?». Si la lista se recargaba con el cuadro abierto, el «Sí» no guardaba nada.
  Ahora busca la hucha por id, verifica que se guardó y, si sigue sin salir, dice por qué.
  Vuelve a preguntar una vez (clave nueva; la anterior se conserva).

Incluye todo lo anterior (v94.30–v94.34).

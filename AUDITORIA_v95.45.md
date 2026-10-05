# AUDITORÍA v95.45-LAB

## Causa raíz confirmada
v95.39 guardaba `v2_*` directamente bajo el `user_id` Supabase. v95.44 introdujo aislamiento cloud por `profile:<profile_id>:<clave>`. La función de lectura de v95.44 filtraba las filas legacy cuando el perfil no era legacy. `tieneDatos()` contaba cualquier fila del usuario, por lo que el onboarding podía concluir "cuenta encontrada" y después el Almacén leer cero filas visibles del perfil. Resultado: credenciales correctas + Dashboard a cero.

## Corrección
- Detectar la cuenta autenticada y sus filas legacy no prefijadas.
- Si el namespace actual está vacío, copiar solo claves financieras/funcionales permitidas al prefijo del perfil.
- No copiar claves `profile:*`.
- No tocar otro `user_id`.
- No borrar el origen legacy.
- Verificar lectura exacta de payloads destino.
- Eliminar solo vacíos técnicos pendientes del onboarding para evitar que una outbox vacía pise lo recuperado.

## Riesgo residual
No se puede confirmar desde la build la existencia real de los datos de la cuenta sin que el usuario inicie sesión. La prueba final debe hacerse con la cuenta real y comprobar que el número de bloques recuperados es >0 y que el estado termina en nube confirmada.

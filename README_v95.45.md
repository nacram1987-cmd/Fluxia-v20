# Fluxia v95.45-LAB · recuperación de datos cloud v95.39

**ESTABLE protegida:** v95.39. `index.html` procede de la entrega estable y no contiene el motor LAB v95.45.

## Motivo de esta versión
La LAB v95.44 aisló correctamente perfiles, pero v95.39 guardaba el plan de una cuenta autenticada en claves cloud sin prefijo. v95.44 solo leía `profile:<profile_id>:...`, por lo que unas credenciales correctas podían encontrar filas en Supabase y aun así renderizar todo a cero.

v95.45 migra de forma segura esos bloques legacy al namespace del perfil activo autenticado. La fuente original no se borra.

## Checklist de cambios (debe reflejarse también en Ayuda → Checklist)

| Cambio | Implementado | Probado | Resultado |
| --- | --- | --- | --- |
| Detectar datos cloud legacy de v95.39 bajo el mismo Supabase user_id | Sí | Test estático + simulación helper | Pasa |
| Copiar legacy → `profile:<profile_id>:` solo si el namespace está vacío | Sí | Simulación lógica | Pasa |
| Verificar por lectura posterior cada payload migrado | Sí | Revisión de código + test | Pasa |
| Conservar filas legacy originales | Sí | Revisión de código | Pasa |
| No copiar `profile:*` de otros perfiles | Sí | Test de filtro | Pasa |
| Descartar solo vacíos técnicos de outbox durante login existente | Sí | Test helper | Pasa |
| `tieneDatos()` pasa a semántica por perfil | Sí | Revisión de código | Pasa |
| Reconectar + flush tras login y migración | Sí | Revisión de flujo | Pasa |
| Configuración pública Supabase incluida en JSON | Sí | JSON parse | Pasa |
| ESTABLE v95.39 preservada en `index.html` | Sí | SHA256 contra v95.39 | Pasa |
| Supabase real con las credenciales personales del usuario | Pendiente usuario | Requiere login real | Debe validarse en LAB |

## Seguridad de credenciales
El ZIP incluye la URL del proyecto y la **publishable key** de Supabase porque son credenciales públicas de cliente que ya forman parte del frontend. No incluye ni guarda la contraseña personal del usuario. El email puede recordarse en el dispositivo; la contraseña no se persiste.

## Prueba recomendada
1. Abrir LAB v95.45.
2. Elegir/crear el perfil del propietario y escribir las credenciales reales de la cuenta existente.
3. Si hay datos legacy v95.39, Fluxia los copia a su namespace y recarga.
4. Deben reaparecer Ingresos, Fijos, Variables, Huchas y demás bloques que existan en la nube.
5. El estado debe pasar de `Pendiente de sincronizar` a `Guardado en nube` solo tras confirmación.

LAB: https://nacram1987-cmd.github.io/Fluxia-v20/index_fluxia_v95.45_LAB.html?v=v95.45-LAB

ESTABLE: https://nacram1987-cmd.github.io/Fluxia-v20/index.html?v=v95.39

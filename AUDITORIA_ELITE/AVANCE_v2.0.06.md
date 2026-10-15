# Fluxia Élite BETA v2.0.06 · cotejo de cartera y separación de fuentes

15/10/2026. Rama `elite-v2.0.06-hucha-html-source-priority`. Base: v2.0.05, commit `60559be717d1e10560d157f8d2fdbae842929d0c`.

## Cambio aplicado

- Dinero en mano compara en solo lectura una copia privada validada del HTML con el estado de nube del mismo perfil.
- Cruza movimientos por ID y compara fecha, tipo, importe exacto en céntimos, concepto, categoría y vínculos.
- Muestra conteos y diferencias solo HTML/solo nube, campos discordantes, IDs repetidos/sin ID y saldo histórico de ambas fuentes. En movimientos discordantes expone ambos lados.
- La tarjeta aparece cuando se carga la copia HTML. Se valida el perfil contra la sesión activa antes de leer.
- Huchas mantiene las vistas aisladas: HTML usa el snapshot exacto importado; Supabase usa sus huchas/usos, sin cruzarlos.
- El HTML sigue siendo el lugar para meter, gastar, aportar y rescatar. Élite no escribe en la cartera o las provisiones.

## Validación ejecutada con Node.js

- Cartera: **27/27** invariantes, incluida fixture sintética con entrada 20 € + gasto 30 €, que muestra dos movimientos faltantes y delta de saldo −10 €, y snapshots idénticos con tipo desconocido o importe inválido que deben bloquear certificación.
- Huchas: fuente de cada vista, respaldo exacto de perfil y reconstrucción/duplicados: pruebas superadas.
- JavaScript inline: parseado sin errores.
- No se verificó Safari/PWA en iPhone, datos del perfil real ni sincronización tras publicar. No se certifica paridad, Disponible ni escritura.

## Protección y estado

- Rama LAB: `elite-v2.0.06-hucha-html-source-priority`.
- PWA estable y HTML raíz sin cambios.
- Rollback: `lab/versions/fluxia-elite-safari-v2.0.05.html`.
- La rama candidata aún no está publicada por Pages; no se anuncia como enlace operativo.


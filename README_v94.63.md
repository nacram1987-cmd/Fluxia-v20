# Fluxia v94.63 · INTEGRIDAD DE DATOS (LAB y ESTABLE: mismo código)

Parte del index **v94.62** real (no de una copia). 34 parches exactos (`patch.py`) + módulo `FluxiaRecV63`.

## Causas encontradas en el código de v94.62
1. **Plan partido en dos** · desde v94.55 `LS_PREFIX = planRescate_v2_u_<id>_`: lo nuevo iba a un sitio y lo de siempre quedaba congelado (va contra la regla v94.52).
2. **Vaciado al abrir** · `fluxiaForzarVacioSiAislado()` ponía a [] gastos variables, huchas y rescates 400 ms después de cargar, también al dueño (el onboarding le marcaba «aislado»). Un guardado entre medias dejaba lo anterior solo en la papelera → **rescates perdidos**.
3. **«Recuperación total» v91.5** · cogía la lista MÁS LARGA de cualquier clave del móvil (otro usuario, espacio u_, copias viejas) y sustituía la tuya si era más corta, al abrir y cada vez que volvías a la app → **gastos que se ponen y se quitan**, borrados que vuelven, datos de un perfil en otro, disponible falso al abrir.
4. **Cierre del mes** · se comprobaba antes de tener los datos reales y su marca estaba en el espacio partido.
5. **Veto de borrados** · borrar un gasto MANUAL vetaba cualquier cargo del banco con la misma fecha e importe.
6. **Banco→fijo / bancos** · v94.57/60 cambiaron las claves: se perdían reglas aprendidas, revisados y la fecha de corte de cada banco (volvía a preguntar).

## Arreglos
- `LS_PREFIX` SIEMPRE base. El aislamiento entre usuarios lo hace Almacen (ya lo hacía).
- Vaciado al abrir y migración cruda: desactivados (funciones conservadas como no-op).
- Almacen, AntiCero y «recuperación total»: solo claves de ESTE perfil, y la última solo si la lista está VACÍA.
- **FluxiaRecV63**: une el espacio u_ de tu perfil con el de siempre (por id; si choca, gana la versión guardada más tarde) y devuelve de la papelera los rescates y gastos perdidos SOLOS desde anoche. No resucita vetados, borrados a mano ni datos de otro perfil. Copia previa en `fluxia_v63_pre_<id>`. Aviso en Inicio con «Ver detalle» → «Quitar» (doble confirmación) o «Usar la anterior».
- Cierre del mes: espera a datos reales, marca también en el móvil, una sola vez.
- Veto: gasto manual borrado = solo su id. Cargos del banco: igual que antes.
- Banco→fijo, conexiones y fechas de corte de antes de v94.57/60: se leen para el dueño (sin borrar nada).
- Doble confirmación en los borrados nuevos de v94.58–61 (PRINCIPIO #14).
- Sin cuenta: nunca vacía el plan crudo (legacy) ni el del dueño con datos.
- «Crear usuario» ya no escribe [] con el prefijo (con prefijo base habría borrado el plan del dueño).

## Pruebas EJECUTADAS (Chromium real, sobre el index.html de dentro del ZIP)
- `syntax.py`: 87 bloques, 0 errores.
- `tests/e2e_v9463.js`: 16/16 (v94.62 con el mismo escenario: 8/16).
- `tests/e2e_v9463b.js`: 12/12 (dueño legacy, veto, cierre, Quitar, Sin cuenta).

## NO probado
- Nube real (Supabase) y iPhone: sin red en las pruebas. Al abrir, revisa el aviso «🛟 Recuperado».
- Suites antiguas (test_ingresos, test_fijos, test_clasif, test_real_v945…): no venían en el ZIP; no se han podido ejecutar.
- Los gastos que estuvieran solo en otro dispositivo con v94.62 llegarán cuando ese dispositivo abra v94.63.

TS sin cambios (hash c4d30337d63fbbc7).

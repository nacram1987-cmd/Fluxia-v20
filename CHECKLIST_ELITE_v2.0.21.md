# Fluxia Élite BETA v2.0.21

## Corrección
- Todas las colecciones modernas del perfil sustituyen sus espejos antiguos; el Disponible no mezcla fuentes.
- Recuperadas las reglas del HTML operativo: mes contable, ingreso bancario único, pensión pendiente, gastos de efectivo, reintegros, devoluciones, fijo conciliado y compartidos.
- Nube completa permite cálculo sin cargar HTML. Las fuentes incompletas siguen bloqueadas.
- La tarjeta indica origen cloud y ofrece Actualizar. Rescate por nombre único sigue identificado como provisional, sin inventar enlaces.

## Comprobación
- `node lab/qa/elite-modern-cloud-v2021.cjs`
- `node lab/qa/elite-dashboard-provisional-available-v2020.cjs`
- `node lab/qa/elite-header-actions-v1994.cjs`
- `node lab/qa/elite-release-guard-v1998.cjs`
- Baseline v97.66 y suite de espejo conservados.
- Comparación privada del mismo conjunto de registros contra funciones extraídas de `lab/index.html`: misma cifra en céntimos; datos privados no empaquetados.

## Uso
Abrir `lab/fluxia-elite-safari-datos-reales.html?v=2.0.21`, iniciar sesión y comprobar la versión, mes y tarjeta. No hace falta subir HTML para un perfil moderno completo.

## Límites y reversión
No se ha probado una sesión autenticada en iPhone físico. Certificación completa de paridad visual pendiente. Los meses sin año siguen el año actual del plan; para históricos con otro año se requiere mes explícito. No se modifica ESTABLE ni la base de datos. Revertir el commit de esta release restaura el candidato anterior, no los datos.

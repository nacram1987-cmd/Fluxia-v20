# Rollback v2.0.26
SHA de partida: base estable `6394e5c789872ee904168eff2c45af2a4dce3436` (pages-v9731-real-final) · rama doc LAB `459788ef3283ee147e83b48b78830689b5f15eb5`.
1. La app estable (`index.html`, SW, manifest, `lab/v97.*`) no se ha tocado: no hay nada que revertir en producción.
2. Rama: `git revert` del PR de `lab/elite-v2.0.26-sonnet` o simplemente no fusionar; la rama estable nunca recibe commits de LAB.
3. Versión anterior de Élite disponible en `lab/versions/fluxia-elite-safari-v2.0.24.html` y `…v2.0.25.html`.
4. Datos: v2.0.26 es de solo lectura; no hay migración que deshacer. Las decisiones «distintos» y la delimitación bancaria viven en localStorage por cuenta/perfil; borrables desde el navegador.

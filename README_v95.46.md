# Fluxia v95.46-LAB

Base: v95.44/v95.45 forense, con **v95.39 preservada como ESTABLE**.

## Objetivo de esta release
Resolver la desaparición de Gastos fijos sin reabrir el motor de datos y aplicar la dirección visual aprobada al Dashboard.

## Checklist de cambios

- [x] **Recuperación por clave de Gastos fijos**: si el namespace del perfil ya contiene otros bloques pero `v2_fijos` falta o está vacío, se busca `v2_fijos`/`planRescate_v2_fijos` exclusivamente en la **misma cuenta Supabase autenticada**, se respalda el valor actual, se copia y se verifica por lectura posterior.
- [x] **No se embeben datos personales en el código público**: no hay hardcode de tus gastos fijos.
- [x] **Fijos coherentes**: Dashboard y pestaña Gastos fijos usan `gastosFijosTotal(mes)` = gastos fijos + financiación. La pestaña muestra subtotal de Gastos fijos y subtotal de Financiación.
- [x] **Dashboard premium aprobado**: sin `Hola, Nacho` ni versión duplicados en el contenido; logo/BETA oro/menú/campana se conservan.
- [x] **Bancos y nube**: chips compactos bajo la cabecera.
- [x] **Mes + fecha**: el Dashboard muestra `Octubre` + `Hoy · 5 de octubre`; el selector global añade la fecha actual en el resto de pestañas.
- [x] **Estable protegida**: `index.html` sigue siendo v95.39.
- [x] **README = Checklist**: los mismos puntos se muestran en Ayuda.

## Pruebas
- Parseo de todos los scripts inline de LAB.
- JSON/manifest/service worker válidos.
- Prueba de decisión de recuperación por clave: namespace parcialmente migrado + `v2_fijos=[]` + legacy no vacío => se recupera solo `v2_fijos`.
- Prueba de no recuperación cuando `v2_fijos` actual ya contiene datos.
- Prueba matemática de `fijosTotal = fijos normales + financiación`.

## Canales
- ESTABLE: v95.39
- LAB: v95.46-LAB

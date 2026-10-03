# v94.57-LAB · URGENTE: aislamiento + avisos fijos

## Por qué Pepe/Hermano veían tu plan
El dueño se asignaba con `hasData` (tus claves globales existen) → el primer secundario en entrar se convertía en “dueño” y leía tu plan.

## Fix aislamiento
- Owner **solo** el perfil más antiguo / legacy (nunca por hasData solo)
- Todo lo demás → `planRescate_v2_u_<id>_` + flag aislado permanente
- Bancos (`conexiones`) también por perfil: aislado ve 0 bancos

## Avisos «¿Es este cargo un gasto fijo?»
- Descartar / Es otro gasto / Sí → **huella permanente** (fecha+importe+concepto)
- No vuelven al cambiar de index
- Claves pend/rev/reglas por perfil

## Cómo probar
1. Entra como **tú** (usuario antiguo) → plan intacto  
2. Entra como **Hermano** o **Pepe** → 0 €, 0 bancos, sin Ana  
3. Descarta un aviso de fijo → recarga / cambia index → **no reaparece**

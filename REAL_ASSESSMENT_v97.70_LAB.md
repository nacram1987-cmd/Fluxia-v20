# Evaluación crítica v97.70 · evidencia y comparabilidad

El 54/100 de la auditoría inicial fue una estimación de riesgos/cobertura, no una medición de degradación respecto a una versión previa comparable. No se había medido una caída de velocidad o calidad provocada por optimizar. Esa cifra no debía presentarse como un descenso de la app. A partir de ahora separar evolución de pruebas idénticas, evidencia operativa y riesgos nuevos detectados.

| Dimensión | Estimación subjetiva /100 | Evidencia actual y límite |
|---|---:|---|
| Publicación | 95 | Pages OIDC y HTTP por bytes; actualización física pendiente |
| Integridad | 75 | Fórmula conservada, 14 casos bancarios y finanzas exactas; libro real no reescrito |
| Conciliación bancaria | 78 | IDs por cuenta/proveedor y alias legado; datos ambiguos requieren revisión |
| Seguridad | 80 | RLS/RPC aplicados y 9 casos; quedan avisos de contraseña comprometida y funciones históricas |
| Persistencia | 70 | Namespace A/B, archivo y merge/tombstones probados; concurrencia real pendiente |
| Rendimiento | 65 | Base aceptada preservada y ensayos repetidos; no puntuación iPhone inventada |
| Mantenibilidad | 40 | Un módulo de identidad separado y regresión ampliada; 168 scripts heredados |

No se publica una nueva media global como si fuera una certificación. El avance verificable es cierre de RLS/RPC, identidad bancaria antes fallida ahora pasando pruebas, aviso único y pipeline reproducible. Velocidad física: pendiente de prueba, no se afirma que haya empeorado ni mejorado sin medirla.

Siguientes cinco acciones por impacto: validar una sincronización real propia en Safari/PWA; resolver manualmente cualquier identidad histórica ambigua con dry-run; probar dos JWT reales y dos dispositivos; medir INP/LCP/CLS/scroll en iPhone; abordar deuda de módulos/avisos de seguridad restantes sin cambiar reglas financieras. Mantener PWA estable y v97.68 intactas hasta aceptación y «con labora».

# Fluxia v95.44-LAB · candidata en validación

**No publicar todavía.** Esta carpeta contiene una candidata LAB construida desde `index_fluxia_v95.39_LAB.html`. `index.html` se copió byte a byte del ZIP v95.39 y no se editó. El ZIP de origen declara v95.25 en el canal estable; el estado real de GitHub no se pudo comprobar. El HTML LAB no se ha probado contra datos reales de Supabase.

## Checklist de cambios (también en Ayuda → Checklist v95.44)

| Cambio | Implementado | Probado | Resultado |
| --- | --- | --- | --- |
| Outbox IndexedDB por perfil con payload y operación | Sí | Simulación offline, cuota llena, cierre y reconexión | Pasa; falta Safari real |
| Nube reemplaza caché sin pendiente; clave local antigua no se sube | Sí | Simulación de nube y caché desfasada | Pasa |
| Escritura CAS y lectura posterior | Sí | Dos clientes simulados, dos variables | Pasa; falta Supabase real |
| Dos aportaciones iguales voluntarias | Sí | Merge con IDs distintos | Ambas sobreviven |
| Borrado explícito por ID | Sí | Tombstone de aportación e ingreso | El borrado no reaparece en simulación |
| Aislamiento A/B/A y perfil B vacío | Parcial | Almacén simulado | Pasa en el motor; falta flujo visual y RLS real |
| Edición manual de ingreso frente al banco | Sí | Merge simulado con revisión bancaria posterior | Prevalece edición manual |
| Seeds/reparadores financieros en boot | Parcial | Revisión estática de rutas conocidas | Desactivados los hallados; no demostrada cobertura total |
| Recuperación interna manual por propietario | Parcial | Revisión estática | Banner automático retirado; falta ensayo real de restauración |
| Onboarding/Metas con localStorage lleno | Sí | Sintaxis + regresión estática de helpers seguros | El cierre de Metas y “Ahora no/Sin cuenta” ya no dependen de `localStorage` directo; falta ensayo iPhone real |
| Dashboard 390/430 px | No validado | Navegador remoto bloqueó localhost | Sin resultado visual |
| 2 minutos, otro index, PWA/iPhone y nube real | No validado | No ejecutado | Bloquea publicación |

Ejecutar `node pruebas_integridad_v9544.cjs` en esta carpeta. Las comprobaciones son reproducibles y usan nube e IndexedDB simulados; no modifican datos reales.

## Archivos

`index_fluxia_v95.44_LAB.html`, `manifest_v95.44_LAB.webmanifest`, `fluxia-sw-v95.44.js`, `fluxia-canal-v95.44-LAB.json`, PROMPT MAESTRO, pruebas y auditoría. El ZIP LAB no incluye ni sustituye `index.html`, `manifest.webmanifest`, `fluxia-sw.js` ni el canal estable raíz.

LAB prevista: https://nacram1987-cmd.github.io/Fluxia-v20/index_fluxia_v95.44_LAB.html?v=v95.44-LAB

ESTABLE solicitada: https://nacram1987-cmd.github.io/Fluxia-v20/index.html?v=v95.39

Ninguna URL se ha publicado ni verificado por este trabajo.

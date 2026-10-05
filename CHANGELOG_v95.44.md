# v95.44-LAB · candidata no publicada
- Outbox durable por perfil y lectura cloud confirmada antes de declarar guardado.
- No reinyectar cachés antiguas sin mutación explícita.
- Claves cloud separadas para perfiles no legados; sin vínculo automático al cambiar usuario.
- Identidad por ID de aportaciones; se conserva la segunda aportación igual.
- Desactivados restauración por espejo, banner de copia interna y varios reparadores de arranque.
- Performance Marks de boot, auth, cloud-read, hydrate y first-stable-render.
- Corrección urgente: el onboarding de Metas y “Ahora no/Sin cuenta” usa helpers seguros de perfil activo y listas de perfiles; ya no queda bloqueado si `localStorage` está lleno o el perfil vive en sessionStorage/memoria.
- Pendiente: pruebas reales de navegador, Supabase y todas las rutas legacy.

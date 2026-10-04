# Fluxia v94.88-LAB

**Supabase = fuente de verdad principal**  
Local = caché + cola offline + recuperación temporal

Cuando hay conexión, un movimiento solo se considera guardado tras confirmación real de Supabase.  
Sin conexión se conserva en cola local con reintento automático e idempotente al recuperar la red.

# Fluxia v94.30-LAB
Base: v94.26 original. Cambios mínimos y verificados:

1. AUTOGUARDADO continuo: cada cambio en localStorage (de cualquier clave) se copia a IndexedDB
   a los 400 ms y al pasar a segundo plano. Si iOS borra el almacenamiento, se recupera solo.
   No borra ni sobrescribe datos. Copia diaria (7 días). Pide almacenamiento persistente.
2. BANCOS: "Sincronizar ahora" y el botón ↻ de saldos marcan "usuario presente" y el servidor
   envía Psu-Ip-Address/Psu-User-Agent a Enable Banking. Lo automático no cambia.
   REQUIERE redesplegar Fluxia-banco-index.ts (ver COPY_TO_SUPABASE.txt).

Hucha: sin cambios (función original). Para ver "Mantenimiento Césped" en octubre:
Septiembre → abrir la hucha → Mes de fin → «sigue activa» → guardar.

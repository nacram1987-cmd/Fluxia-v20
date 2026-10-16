# Checklist Fluxia Élite v2.0.27-LAB

- [x] Versión v2.0.27 consistente en el HTML de Élite y snapshot inmutable.
- [x] CLI bloquea si mes nube y periodo solicitado difieren.
- [x] CLI bloquea cortes de copias incompatibles (>1 h) o fechas sin zona horaria.
- [x] No crea archivos de informe al detectar corte/mes incompatible.
- [x] Pruebas de corte nuevas: 10/10.
- [x] Regresión v2.0.25: 99/99; integración v2.0.26: 11/11.
- [x] QA local del workflow ejecutado; verificación estable v97.66: 6/6 archivos.
- [!] `npm test` legacy no arrancó: falta `acorn` en el entorno local.
- [ ] Exportaciones actuales del mismo perfil/corte: no disponibles; Disponible sigue provisional.
- [ ] Supabase/RLS, sincronización bancaria real, Safari/iPhone y GitHub Actions remoto: no verificados.
- [ ] Push, despliegue y URL LAB pública: no realizados.

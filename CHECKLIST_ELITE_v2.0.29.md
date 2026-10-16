# Checklist Fluxia Élite v2.0.29-LAB

| Añadido / corregido | Dónde probarlo |
|---|---|
| Clasificación de grupos con el mismo `bancoRef` (reimportación / identidad insuficiente / legítimos) | Auditoría → Certificado → «Referencias bancarias repetidas» |
| Importe en juego por grupo y total (no se aplica) | Mismo panel |
| Sin botón «transacciones distintas» para un mismo identificador bancario | Mismo panel |
| Rescate de hucha: nombre exacto vs normalizado vs ambiguo | Huchas y compuerta [c] del certificado |
| `--history` en la herramienta local | `node lab/tools/elite-reconcile-cli.cjs --help` (cabecera del archivo) |

- [x] Pruebas: `node lab/qa/elite-bankref-hucha-v2029.cjs` (22) y suites previas (99 + 11 + resto de CI).
- [x] HTML estable intacto (blob `d68bd5b9…`).
- [ ] Conciliación real: necesita exportación de la nube y copias históricas del mismo perfil (la sesión de desarrollo no tiene acceso a Supabase).
- [ ] Prueba en Safari/iPhone y con las dos cuentas reales.

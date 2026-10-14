# Fluxia Élite — protocolo de captura de snapshots operativos (14/10/2026)

Estado: PENDIENTE DE CAPTURA. Esta rama NO extrae ni modifica datos reales.

## Origen autorizado
- HTML/PWA vigente y Élite, mismo usuario autenticado, perfil, mes y corte.
- La exportación CSV de octubre no es un snapshot: carece de canonical_id y de libro contable completo.
- No incluir tokens, credenciales, IBAN completos ni secretos en archivos de auditoría o commits.

## Esquema JSON para cada fuente
```json
{
  "user_id": "identificador-estable-privado",
  "profile_id": "identificador-estable-privado",
  "accounting_month": "2026-10",
  "cutoff": "2026-10-14T12:00:00+02:00",
  "movements": [
    {
      "canonical_id": "id-real",
      "bank_identity": null,
      "booking_date": "2026-10-14",
      "operation_date": "2026-10-14",
      "accounting_month": "2026-10",
      "amount_cents": 750,
      "concept": "concepto-real",
      "category": "Tabaco",
      "origin": "bank",
      "status": "active",
      "fixed_link": null,
      "excluded": false,
      "archived": false,
      "tombstone_version": null
    }
  ],
  "ledger": {
    "income_cents": 0,
    "variable_cents": 0,
    "fixed_paid_cents": 0,
    "provisions_cents": 0,
    "shared_cents": 0,
    "available_cents": 0
  }
}
```
Los importes son ejemplos de esquema, NO datos del usuario. Todos los importes en céntimos enteros. Cada snapshot debe provenir de una lectura autorizada y de un corte coherente; si una fuente no puede exportar todos los campos, la comparación queda BLOQUEADA.

## Ejecución
```bash
node --test AUDITORIA_ELITE/compare-snapshots.test.mjs
node AUDITORIA_ELITE/compare-cli.mjs /ruta/privada/html.json /ruta/privada/elite.json
```
Exit 0 = coincidencia del subconjunto comparado; 1 = diferencias; 2 = entrada inválida. No equivale a certificación funcional integral ni autoriza promoción automática.

## Bloqueos pendientes
1. Obtener snapshots operativos del HTML y Élite (no se dispone de ellos en este repositorio).
2. Reconciliar 51 registros HTML, 52 filas CSV (811,39 €) y el cargo 7,50 € del 14/10 sin generar ni deduplicar movimientos.
3. Extender el motor de comparación a huchas, efectivo, pagos, presupuestos y estados de notificaciones, además del ledger resumido.
4. Ejecutar QA de autenticación, RLS, bancos, PWA y rendimiento iPhone antes de promocionar.

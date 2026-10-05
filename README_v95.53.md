# Fluxia v95.53-LAB

Base: v95.52-LAB. ESTABLE protegida: v95.39.

## Checklist de esta versión

- [x] **Pago de Hucha atómico** — IMPLEMENTADO. Usar dinero de una Hucha solo puede modificar el histórico de Huchas; no puede hacer desaparecer Gastos Variables ni Compartidos.
- [x] **Protección frente a regresiones durante el pago** — IMPLEMENTADO. Se conserva una instantánea de Variables/Compartidos y se restauran únicamente registros que hayan desaparecido de forma colateral durante la transacción.
- [x] **Disponible cash-neutral al usar una Hucha** — PROBADO por diseño: si ninguna otra categoría cambia, registrar un pago de Hucha no altera `disponibleEfectivo`.
- [x] **Bancos + nube** — IMPLEMENTADO. Más bajos, alargados y separados del logo y del hero.
- [x] **Más aire visual** — IMPLEMENTADO entre cabecera, estados, Disponible, cuadrícula y tarjetas secundarias.
- [x] **Menos saturación numérica** — IMPLEMENTADO reduciendo peso/tamaño de cifras secundarias; Disponible mantiene jerarquía principal.
- [x] **Texto de pensión simplificado** — IMPLEMENTADO sin repetir el importe dentro del hero.
- [x] **Build coherente v95.53** — HTML, manifest, SW y canal LAB usan v95.53.
- [x] **ESTABLE v95.39 intacta** — NO se promueve ni modifica.

## Regla contable fijada
Un pago definitivo realizado desde una Hucha reduce el saldo reservado y la caja bancaria en la misma cuantía. Por ello **no crea ni libera Disponible** por sí mismo. Si al registrarlo cambia el Disponible, Fluxia debe atribuir el cambio a otra categoría concreta y nunca a la operación de Hucha.

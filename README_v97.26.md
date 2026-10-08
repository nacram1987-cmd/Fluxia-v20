# Fluxia v97.26-LAB · Fase 1 rendimiento

Base recuperada desde v97.23-LAB validada. Esta entrega NO modifica cálculos financieros.

## Cambios
- Menú fast-path: abre antes de recalcular cabecera o bloquear scroll.
- Gastos variables: lote inicial reducido para evitar congelación de primer render en iPhone.
- Scroll Variables/Bancos: contención CSS y sin animaciones costosas en móvil.
- Mantenimiento Césped: desactivada la reconciliación automática antigua al renderizar. La corrección válida vive en nube.
- Versión visible: v97.26-LAB.
- PWA: manifest con icono Fluxia azul verdoso.

## No tocado
- Disponible.
- Huchas salvo bloqueo de la mutación antigua.
- Dinero en mano.
- Supabase / persistencia.

## Prueba obligatoria
1. Abrir menú desde Inicio y desde Variables.
2. Entrar por primera vez a Gastos variables.
3. Scroll en Variables y Bancos.
4. Verificar Hucha Mantenimiento Césped: saldo 0 y aportación octubre al día.

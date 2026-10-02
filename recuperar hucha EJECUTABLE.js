/**
 * SCRIPT DE RECUPERACIÓN - Hucha "Mantenimiento e Césped"
 * Versión: v94.26-fix
 * 
 * INSTRUCCIONES:
 * 1. Abre Fluxia en tu navegador
 * 2. Pulsa F12 o Cmd+Opt+J (abre DevTools/Consola)
 * 3. Copia TODO este script
 * 4. Pégalo en la consola y pulsa Enter
 * 5. La página se recargará automáticamente
 * 
 * Si ves "✓ Hucha recuperada" → éxito
 * Si ves "✓ Hucha EXISTS" → ya estaba, no hay problema
 */

console.log('%c=== FLUXIA RECUPERADOR DE HUCHAS v94.26 ===', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
console.log('Iniciando diagnóstico...\n');

try {
    // 1. LEER DATOS ACTUALES
    const provisiones = JSON.parse(localStorage.getItem('planRescate_v2_provisiones') || '[]');
    const movimientos = JSON.parse(localStorage.getItem('planRescate_v2_movimientos') || '[]');
    
    console.log('📊 ESTADO ACTUAL:');
    console.log(`   Huchas en lista: ${provisiones.length}`);
    console.log(`   Movimientos totales: ${movimientos.length}`);
    
    // 2. BUSCAR LA HUCHA
    const huchaExistente = provisiones.find(p => 
        p && p.nombre && 
        (p.nombre.toLowerCase().includes('mantenimiento') || 
         p.nombre.toLowerCase().includes('césped') ||
         p.nombre.toLowerCase().includes('cesped'))
    );
    
    if (huchaExistente) {
        console.log('\n✓ La hucha YA EXISTE en tu lista:');
        console.log(`   Nombre: ${huchaExistente.nombre}`);
        console.log(`   ID: ${huchaExistente.id}`);
        console.log(`   Cuota mensual: €${huchaExistente.cuotaMensual}`);
        console.log(`   Estado: ${huchaExistente.estado}`);
        console.log('\n✓ No hay nada que recuperar. ¡Tu hucha está bien!');
        
    } else {
        // 3. BUSCAR EVIDENCIA EN MOVIMIENTOS
        console.log('\n🔍 Hucha NO encontrada en lista. Buscando en movimientos...');
        
        const movHucha = movimientos.filter(m =>
            (m.concepto && m.concepto.toLowerCase().includes('mantenimiento')) ||
            (m.nota && m.nota.toLowerCase().includes('cesped'))
        );
        
        if (movHucha.length === 0) {
            console.log('⚠️ No hay movimientos de Mantenimiento encontrados.');
            console.log('   Posibilidades:');
            console.log('   1. La hucha nunca existió');
            console.log('   2. El nombre es diferente (verifica en tu app)');
            console.log('   3. Se eliminó completamente del histórico');
        } else {
            console.log(`   ✓ ${movHucha.length} movimiento(s) encontrado(s):`);
            movHucha.slice(0, 3).forEach(m => {
                console.log(`     - ${m.fecha}: ${m.concepto} €${m.importe}`);
            });
            
            // 4. RECONSTRUIR LA HUCHA
            console.log('\n🛠️ Reconstruyendo hucha...');
            
            const huchaNueva = {
                id: 'mantenimiento_cesped_' + Date.now(),
                nombre: 'Mantenimiento e Césped',
                cuotaMensual: 35,  // ← CAMBIAR SI LA CUOTA ES DIFERENTE
                estado: 'activa',
                aportaciones: {},
                usos: {},
                created: new Date().toISOString(),
                nota: 'Recuperada automáticamente'
            };
            
            provisiones.push(huchaNueva);
            
            // 5. GUARDAR
            localStorage.setItem('planRescate_v2_provisiones', JSON.stringify(provisiones));
            
            console.log('\n✓ Hucha recuperada exitosamente:');
            console.log(`   Nombre: ${huchaNueva.nombre}`);
            console.log(`   Cuota: €${huchaNueva.cuotaMensual}`);
            console.log(`   ID asignado: ${huchaNueva.id}`);
            console.log(`   Creada: ${huchaNueva.created}`);
            
            console.log('\n⚠️ IMPORTANTE:');
            console.log('   La hucha se ha recreado CON SALDO 0€.');
            console.log('   Si necesitas ajustar la cuota mensual (no es 35€),');
            console.log('   notificame y ejecuto otro script.');
        }
    }
    
    // 6. MOSTRAR RESUMEN FINAL
    console.log('\n' + '='.repeat(50));
    console.log('📋 RESUMEN FINAL:');
    const provActuales = JSON.parse(localStorage.getItem('planRescate_v2_provisiones') || '[]');
    console.log(`   Huchas en lista: ${provActuales.length}`);
    provActuales.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.nombre}`);
    });
    
    // 7. RECARGAR
    console.log('\n' + '='.repeat(50));
    console.log('Recargando Fluxia en 2 segundos...');
    
    setTimeout(() => {
        location.reload();
    }, 2000);
    
} catch (err) {
    console.error('❌ ERROR:', err.message);
    console.log('\nDetalles:');
    console.log(err);
    console.log('\nSi esto no funciona, contacta support con esta captura.');
}

console.log('\n✅ Script completado. Página se recargará automáticamente.');

# Fluxia v96.56-LAB

Candidata de prueba derivada del ZIP v96.55 recibido el 7 de octubre de 2026. No promovida a ESTABLE.

La v96.55 original invadía el ámbito de service workers/cachés de ESTABLE. Por ello se corrige antes de publicación y se incrementa a v96.56. El index.html del ZIP original no se utiliza.

Cambios: un único registro LAB con ámbito exclusivo del HTML; retirada del limpiador global cleanAndOwn; retirada del worker v5 inactivo y del fallback blob no admitido; recuperación de push/notificationclick en archivo real; notificaciones LAB enfocan únicamente LAB. La promesa del registro espera su propia activación. Ningún cambio contable, de Supabase, bancos o diseño.

LAB: https://nacram1987-cmd.github.io/Fluxia-v20/index_fluxia_v96.56_LAB.html?v=v96.56-LAB
Entrada existente conservada: https://nacram1987-cmd.github.io/Fluxia-v20/index.html

No sobrescribir index.html, manifest general, fluxia-canal.json ni workers existentes. Todos los archivos de esta entrega tienen nombre v96.56. El ZIP es respaldo; la publicación la realiza Work.

Validación: ver CHECKLIST_v96.56.txt y QA_v96.56.json. Las pruebas financieras son sintéticas, aisladas y sin sesión. No equivalen a validar persistencia real autenticada, sincronización bancaria real, push de servidor o Safari/iPhone. Ninguna de esas pruebas pendientes se declara superada.

Comparación estática: v94.80 está disponible en el repositorio. 94 apariciones de apertura script frente a 132 en la v96.55; 415 frente a 443 apariciones textuales de addEventListener. Esos conteos incluyen código/string/comentarios y NO son número de listeners activos ni benchmark. Permanecen seis wrappers de navegación que requieren auditoría de sus efectos antes de consolidar.

Próximo paso: validar sesión real y perfilado en iPhone; consolidar callbacks de navegación con sus contratos preservados. Detector de traspasos, fecha/hora y ordenación quedan después.

QA reproducible: instalar playwright, chart.js@3.9.1 y @supabase/supabase-js; disponer de Chromium. Ejecutar qa_v96.56.cjs con FLUXIA_QA_CHROMIUM apuntando al binario y FLUXIA_QA_MODULES al node_modules de las dependencias. Las rutas externas de SDK/Chart se satisfacen desde esos paquetes y el resto de red se bloquea; no usar una sesión real en ese test.

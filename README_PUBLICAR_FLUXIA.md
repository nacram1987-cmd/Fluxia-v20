# Fluxia — publicación oficial desde ChatGPT

**Repositorio:** https://github.com/nacram1987-cmd/Fluxia-v20

## Rama única de publicación

La rama de Pages confirmada por la última ejecución exitosa (08/10/2026, run 966) es pages-v9731-real-final. Esa es la única rama oficial de publicación de GitHub Pages. main es la rama predeterminada del repositorio y no debe confundirse con Pages; las ramas lab/*, fix/* y las demás ramas LAB sirven para preparación y no publican por defecto.

Antes de cada entrega, volver a comprobar el run de Pages y que su rama sigue siendo pages-v9731-real-final. Si GitHub muestra otra rama, no publicar a ciegas: actualizar esta norma y el PROMPT MAESTRO en el mismo cambio.

## Flujo habitual

1. Desde ChatGPT, verificar que GitHub está conectado, el repositorio es accesible y la cuenta tiene permiso push.
2. Leer index.html, manifest.webmanifest, el worker registrado por el HTML (fluxia-sw.js en la build v97.31) y los recursos referenciados. Mantener una sola entrada canónica para Safari/PWA.
3. Preparar y comprobar el paquete completo. El HTML, el manifest, el service worker, iconos, recursos, PROMPT MAESTRO y README deben describir la misma versión. Preservar datos cloud sin cambios.
4. Crear un commit único sobre pages-v9731-real-final con el SHA padre esperado; actualizar la rama con protección contra carreras. No subir versiones parciales de HTML o manifiesto.
5. Comprobar en Actions que pages build and deployment corresponde al SHA publicado y termina en success.
6. Consultar la URL pública https://nacram1987-cmd.github.io/Fluxia-v20/ y comprobar que la versión en el título/meta del HTML es la esperada. Verificar también el manifiesto y el script del worker con consultas que eviten caché.
7. Entregar el ZIP completo y enlaces LAB/ESTABLE, con hashes, historial y PROMPT MAESTRO actualizado. No promover LAB a ESTABLE sin la indicación correspondiente.

## Actualización de PWA

- Mantener estable el id y scope del manifiesto para conservar la misma instalación.
- Mantener como worker activo el script realmente registrado por index.html; en v97.31 es ./fluxia-sw.js con updateViaCache: none.
- Cambiar el identificador de caché del worker en cada publicación; activar el worker nuevo, reclamar clientes, retirar cachés antiguas de Fluxia y revalidar la navegación contra red.
- No eliminar ni reinstalar la PWA para las actualizaciones habituales. No introducir una segunda instalación cambiando el id.
- Mantener workers heredados coherentes para que una instalación antigua no quede sirviendo una versión anterior si todavía solicita esa ruta.

## Evidencia de publicación revisada (08/10/2026)

- Repositorio comprobado con permisos de lectura y escritura.
- Último despliegue observado: Pages run 966, commit c6eb6d81c21efdef136313c95415ab6dd4202eb0, rama pages-v9731-real-final, resultado success.
- index.html tiene metadatos/título v97.31-LAB; manifest.webmanifest declara Fluxia BETA v97.31-LAB.
- El HTML registra ./fluxia-sw.js; ese worker está en v97.31 y realiza actualización de navegación desde red. La ruta sw.js conservaba la etiqueta v97.20 y debe sincronizarse con la misma generación para eliminar ambigüedad.
- URL pública de Pages: https://nacram1987-cmd.github.io/Fluxia-v20/

Una evidencia previa no sustituye la validación del commit nuevo: cada publicación debe comprobar su propio SHA, run y URL servida.
# Fluxia

Control financiero personal. App para iPhone (PWA) con servidor propio, privado y gratuito.

Tiempo total de la puesta en marcha: unos 30 minutos, una sola vez.

---

## Paso 0 · Antes de nada: guarda tus datos actuales

Tus datos de ahora viven en Safari, ligados a la dirección antigua (GitHub). La nueva app en Render es otra dirección y **no los verá**.

1. Abre Fluxia en la dirección antigua.
2. **Datos → 💾 Descargar copia**.
3. Guarda el archivo `FLUXIA-copia-FECHA.json` en *Archivos → iCloud Drive*.

No borres la app antigua hasta haber comprobado la nueva.

---

## Paso 1 · Repositorio privado en GitHub

1. En GitHub: **New repository** → nombre `fluxia` → marca **Private** → Create.
2. Sube todo el contenido de esta carpeta (incluida la carpeta `public/`).
3. Si usas el repo antiguo público `Tu-m-todo-definitivo-`: **Settings → General → Danger Zone → Change visibility → Make private**. Tu plan con importes reales estaba ahí a la vista.

---

## Paso 2 · Almacenamiento permanente (Upstash, gratis)

Sin esto, Render gratis **borra los datos del servidor** cada vez que se reinicia.

1. Entra en <https://console.upstash.com> (puedes registrarte con GitHub).
2. **Create Database** → tipo **Redis** → nombre `fluxia` → región **eu-west-1 (Irlanda)** o **eu-central-1 (Frankfurt)** → plan **Free**.
3. En la base de datos creada, baja a **REST API** y copia dos valores:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## Paso 3 · Envío del código por email (Brevo, gratis)

1. Regístrate en <https://www.brevo.com> (plan gratis: 300 emails/día).
2. **Remitentes** (Senders): añade tu email, por ejemplo tu Gmail. Te llega un correo de verificación: confírmalo.
3. **SMTP & API → API Keys → Generate a new API key**. Copia la clave (empieza por `xkeysib-`).

> Los primeros códigos pueden caer en **spam**. Márcalos como «No es spam» una vez y ya llegarán bien.

---

## Paso 4 · Publicar en Render (gratis)

1. <https://render.com> → entra con GitHub.
2. **New → Blueprint** → elige tu repo `fluxia`. Render lee `render.yaml`.
3. Te pedirá estas variables. Rellénalas:

| Variable | Valor |
|---|---|
| `ALLOWED_EMAILS` | Los emails que pueden tener cuenta, separados por comas: `tu@gmail.com,ana@gmail.com` |
| `UPSTASH_REDIS_REST_URL` | Del paso 2 |
| `UPSTASH_REDIS_REST_TOKEN` | Del paso 2 |
| `BREVO_API_KEY` | Del paso 3 |
| `MAIL_FROM` | El email que verificaste en Brevo |

4. **Apply**. Cuando ponga *Live*, copia la URL: `https://fluxia-xxxx.onrender.com`.

### Comprobar que todo está bien
Abre `https://fluxia-xxxx.onrender.com/health`. Debe decir:

```
"storage": "upstash (persistente)", "email": "brevo", "privado": true
```

Si alguno no coincide, revisa esa variable en **Render → tu servicio → Environment**.

---

## Paso 5 · En el iPhone

1. Safari → abre la URL de Render.
2. **Compartir → Añadir a pantalla de inicio**. Desde ahora, abre Fluxia desde ese icono.
3. Crea tu usuario y tu clave o Face ID.
4. **Ajustes → Cuenta Fluxia** → tu email → **Enviar código** → escribe el código del correo → **Verificar**.
5. **Datos → Cargar copia** → elige el `.json` del paso 0.

Listo. A partir de aquí **cada cambio se sube solo a tu cuenta** a los pocos segundos. Si no hay cobertura, se sube cuando vuelva.

---

## Cómo funciona la seguridad

- Solo los emails de `ALLOWED_EMAILS` pueden crear cuenta. A cualquier otro se le responde igual, sin revelar si existe.
- El código caduca a los 15 minutos y admite 5 intentos. Hay límite de peticiones por email y por conexión.
- La sesión dura 180 días. En el servidor solo se guarda una huella (hash) del token, nunca el token.
- El servidor guarda tu plan y **sus 5 versiones anteriores**.
- En el móvil, la app se protege con Face ID o una clave de 6 dígitos.
- Un móvil nuevo **nunca sobrescribe** tu plan del servidor: al entrar te pregunta si quieres cargarlo y no sube nada hasta entonces.

## Novedades de esta versión

- **🕘 Versiones anteriores**: *Datos → Ver versiones anteriores del plan*. Ves las 5 últimas con su contenido y restauras cualquiera con un toque. La actual no se pierde, pasa al historial.
- **📅 Cierre de mes**: el primer día que abras la app en un mes nuevo, te enseña cómo terminó el anterior y lo que quedó a medias (pagos sin marcar, aportaciones incompletas, rescates sin reponer). También en *Resumen → Ver cierre de…*.
- **Cambio de año**: corregidos los cálculos que comparaban meses sin año. Sin esto, el 1 de enero el saldo de provisiones habría caído a cero.

## Pruebas automáticas (antes de cada subida)

```bash
pip install playwright && playwright install chromium   # solo la primera vez
python tests/pruebas.py
```

Arrancan su propio servidor en una carpeta temporal y comprueban 30 cosas: importación, sincronización entre dos móviles, versiones, cambio de año y cierre de mes. Si alguna sale en ❌, **no subas esa versión**.

## Notas

- Render gratis se duerme tras 15 minutos sin uso: la primera apertura tarda unos segundos. La app funciona igual sin conexión.
- Borrar la cuenta del servidor: **Ajustes → Cuenta Fluxia → 🗑 Borrar mi cuenta**. Los datos del móvil no se tocan.
- Los meses del plan se amplían solos al cambiar de mes o de año.

## Desarrollo local

```bash
node server.js     # → http://127.0.0.1:8787  (sin npm install)
```

En local, sin Brevo configurado, el código aparece en pantalla para poder probar.
En producción nunca se muestra.

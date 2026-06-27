# ProKicks Play · Sprint 1.6.2

Corrección Registro a Torneos + correo real + favicon balón.

## Subir a GitHub
Subir únicamente:

- `app/`
- `public/`

## Incluye

- Quita WhatsApp duplicado en Registro a Torneos.
- Usa WhatsApp del Participante 1 como contacto principal.
- Mantiene validación de email, WhatsApp, campos obligatorios, reglamento e imagen.
- Agrega pantalla de confirmación después del registro.
- Evita que el mensaje verde anterior quede pegado en el formulario.
- Corrige espacio inferior para que el menú no tape campos.
- Envía correo al usuario y al admin usando Resend.
- Cambia favicon / iconos PWA a balón de fútbol de alto contraste.

## Variables necesarias en Vercel

- `RESEND_API_KEY`
- `PROKICKS_EMAIL_FROM`
- `PROKICKS_ADMIN_EMAIL`

## Nota Resend
Si se usa `onboarding@resend.dev`, Resend puede limitar destinatarios. Para uso real verificar dominio `prokicks.shop` y cambiar `PROKICKS_EMAIL_FROM` a `ProKicks <registro@prokicks.shop>`.

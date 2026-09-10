# Variables de entorno — Notificaciones WhatsApp (Meta Cloud API)

Usadas por `lib/notifications/whatsapp-adapter.ts` y expuestas solo
en el servidor (API routes), **nunca al navegador**.

## Requeridas

- `WHATSAPP_ACCESS_TOKEN` — token de acceso de la app de Meta for
  Developers (WhatsApp Business Platform). Agregar en Vercel como
  **Sensitive/Secret**, entorno Production (y Preview si aplica).
  Actualmente es el token temporal del sandbox de pruebas; antes de
  producción real hay que generar un token permanente de sistema
  (System User) en Meta Business Suite.
- `WHATSAPP_PHONE_NUMBER_ID` — ID del número de teléfono de prueba en
  WhatsApp Manager (Meta for Developers → WhatsApp → API Setup).
- `WHATSAPP_BUSINESS_ACCOUNT_ID` — ID de la cuenta de WhatsApp
  Business (WABA) asociada a la app.

## Opcionales (con default en código)

- `WHATSAPP_TEMPLATE_NAME` — nombre de la plantilla a usar al enviar.
  Default: `prokicks_registro_confirmado_v2` (plantilla de
  confirmación de registro con nombre del torneo y folio de
  check-in como variables {{1}} y {{2}}).
- `WHATSAPP_TEMPLATE_LANG` — código de idioma de la plantilla.
  Default: `es_MX`.

Ambas permiten cambiar de plantilla (por ejemplo, para probar una
nueva versión aprobada por Meta) sin tocar código ni redeploy manual
del adaptador — solo actualizar la env var en Vercel y redeploy.

## Notas

- El adaptador (`sendWhatsappTemplate`) nunca lanza (throw): si falta
  configuración o el número es inválido, regresa un resultado
  `{ ok: false, skippedReason: ... }` y el flujo de registro del
  usuario continúa normalmente.
- Cada intento de envío (exitoso o no) se audita en la tabla
  `prokicks_notifications` vía `lib/notifications/notify.ts`, con
  `channel = 'whatsapp'` y `provider = 'meta_cloud_api'`.
- En el sandbox de Meta, solo los números verificados como
  destinatarios de prueba reciben mensajes. Para producción real hay
  que verificar el negocio y solicitar el número de producción.

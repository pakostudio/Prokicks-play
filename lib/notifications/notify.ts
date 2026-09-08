// lib/notifications/notify.ts
//
// Capa best-effort que envuelve los adaptadores de canal (email, whatsapp)
// y siempre audita el resultado real en prokicks_notifications.
// El codigo de dominio llama a estas funciones y nunca debe dejar que una
// falla de notificacion tumbe la operacion real (nunca lanza).

import { createClient } from '@supabase/supabase-js';
import { sendWhatsappTemplate, type WhatsappSendResult } from './whatsapp-adapter';

export type NotificationEventType =
    | 'tournament_registration'
  | 'tournament_reminder'
  | 'match_result'
  | 'checkin_confirmation'
  | 'spot_activity';

export type NotificationChannel = 'whatsapp' | 'email' | 'push';

type LogParams = {
    channel: NotificationChannel;
    eventType: NotificationEventType;
    recipient: string;
    status: 'sent' | 'failed' | 'skipped_config' | 'skipped_invalid_recipient' | 'skipped_no_template';
    providerMessageId?: string | null;
    errorMessage?: string | null;
    payload?: Record<string, unknown>;
};

async function logNotification(params: LogParams) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return;

  try {
        const client = createClient(supabaseUrl, supabaseAnonKey);
        await client.from('prokicks_notifications').insert({
                channel: params.channel,
                event_type: params.eventType,
                recipient: params.recipient,
                status: params.status,
                provider: params.channel === 'whatsapp' ? 'meta_cloud_api' : params.channel === 'email' ? 'resend' : null,
                provider_message_id: params.providerMessageId || null,
                error_message: params.errorMessage || null,
                payload: params.payload || {},
        });
  } catch {
        // No debe tumbar la operacion real si ni siquiera el log funciona.
  }
}

export async function notifyWhatsapp(params: {
    to: string;
    eventType: NotificationEventType;
    templateName?: string;
    templateLang?: string;
    components?: Array<Record<string, unknown>>;
    payload?: Record<string, unknown>;
}): Promise<WhatsappSendResult> {
    let result: WhatsappSendResult;

  try {
        result = await sendWhatsappTemplate({
                to: params.to,
                templateName: params.templateName,
                templateLang: params.templateLang,
                components: params.components,
        });
  } catch (error) {
        result = {
                ok: false,
                status: null,
                error: error instanceof Error ? error.message : String(error),
        };
  }

  if (result.ok) {
        await logNotification({
                channel: 'whatsapp',
                eventType: params.eventType,
                recipient: params.to,
                status: 'sent',
                providerMessageId: result.messageId,
                payload: params.payload,
        });
  } else if (result.skippedReason === 'missing_config') {
        await logNotification({
                channel: 'whatsapp',
                eventType: params.eventType,
                recipient: params.to,
                status: 'skipped_config',
                errorMessage: result.error,
                payload: params.payload,
        });
  } else if (result.skippedReason === 'invalid_phone') {
        await logNotification({
                channel: 'whatsapp',
                eventType: params.eventType,
                recipient: params.to,
                status: 'skipped_invalid_recipient',
                errorMessage: result.error,
                payload: params.payload,
        });
  } else {
        await logNotification({
                channel: 'whatsapp',
                eventType: params.eventType,
                recipient: params.to,
                status: 'failed',
                errorMessage: result.error,
                payload: params.payload,
        });
  }

  return result;
}

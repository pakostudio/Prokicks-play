// lib/notifications/whatsapp-adapter.ts
//
// Adaptador aislado para WhatsApp via Meta Cloud API (graph.facebook.com).
// No conoce nada del dominio de ProKicks (torneos, registros, resultados).
// Mismo patron que un adaptador de Stripe: recibe datos ya formados, habla
// HTTP directo contra el proveedor, y regresa un resultado estructurado.
//
// Nunca lanza (throw) hacia el llamador por errores del proveedor.

const GRAPH_API_VERSION = 'v21.0';

type SendTemplateInput = {
    to: string;
    templateName?: string;
    templateLang?: string;
    components?: Array<Record<string, unknown>>;
};

export type WhatsappSendResult =
    | { ok: true; status: number; messageId: string | null; raw: unknown }
  | { ok: false; status: number | null; error: string; raw?: unknown; skippedReason?: string };

function normalizePhone(raw: string) {
    return String(raw || '').replace(/[^\d]/g, '');
}

export async function sendWhatsappTemplate(input: SendTemplateInput): Promise<WhatsappSendResult> {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
        return {
                ok: false,
                status: null,
                error: 'WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not configured',
                skippedReason: 'missing_config',
        };
  }

  const to = normalizePhone(input.to);
    if (!to) {
          return { ok: false, status: null, error: 'Invalid destination phone number', skippedReason: 'invalid_phone' };
    }

  const templateName =
        input.templateName || process.env.WHATSAPP_TEMPLATE_NAME || 'prokicks_registro_confirmado_v2';
    const templateLang = input.templateLang || process.env.WHATSAPP_TEMPLATE_LANG || 'es_MX';

  const body: Record<string, unknown> = {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
                name: templateName,
                language: { code: templateLang },
                ...(input.components && input.components.length > 0 ? { components: input.components } : {}),
        },
  };

  try {
        const response = await fetch(
                `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
          {
                    method: 'POST',
                    headers: {
                                Authorization: `Bearer ${accessToken}`,
                                'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
          }
              );

      const raw = await response.json().catch(() => ({}));

      if (!response.ok) {
              const errorMessage =
                        (raw as any)?.error?.message || `WhatsApp API error (status ${response.status})`;
              return { ok: false, status: response.status, error: errorMessage, raw };
      }

      const messageId = (raw as any)?.messages?.[0]?.id || null;
        return { ok: true, status: response.status, messageId, raw };
  } catch (error) {
        return {
                ok: false,
                status: null,
                error: error instanceof Error ? error.message : String(error),
        };
  }
}

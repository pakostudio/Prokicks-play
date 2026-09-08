// app/api/tournament-registration-whatsapp/route.ts
//
// Envía por WhatsApp el código de check-in de un registro a torneo.
// Best-effort: nunca bloquea ni rompe el flujo de registro del usuario si
// WhatsApp falla o no está configurado (ver lib/notifications/notify.ts).

import { NextResponse } from 'next/server';
import { notifyWhatsapp } from '@/lib/notifications/notify';

export async function POST(req: Request) {
    try {
          const body = await req.json().catch(() => ({}));

          const to = String(body.whatsapp || '').trim();
          const checkInCode = String(body.checkInCode || '').trim();
          const participantName = String(body.name || '').trim();
          const tournamentTitle = String(body.tournamentTitle || '').trim();

          if (!to || !checkInCode) {
                  return NextResponse.json(
                            { ok: false, error: 'whatsapp y checkInCode son requeridos' },
                            { status: 400 }
                          );
                }

          const result = await notifyWhatsapp({
                  to,
                  eventType: 'tournament_registration',
                  payload: { name: participantName, tournamentTitle, checkInCode },
                });

          return NextResponse.json({ ok: result.ok, status: result.status ?? null });
        } catch (error) {
          // Best-effort: nunca tronar la respuesta hacia el cliente por esto.
          return NextResponse.json(
                  { ok: false, error: error instanceof Error ? error.message : String(error) },
                  { status: 200 }
                );
        }
  }

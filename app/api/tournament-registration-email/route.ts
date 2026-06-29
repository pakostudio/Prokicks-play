import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { captureError } from '@/lib/monitoring';

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

async function sendResendEmail(apiKey: string, from: string, input: SendEmailInput) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
    }),
  });

  const result = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, result };
}

function safe(value: unknown) {
  return String(value || '').replace(/[<>]/g, '');
}

function money(value: number, currency = 'MXN') {
  if (!value) return 'Registro sin costo';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(value);
}

function yesNo(value: unknown) {
  return value ? 'Sí' : 'No';
}

function formatDate(value: unknown) {
  if (!value) return 'Por confirmar';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return 'Por confirmar';
  return date.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}

function uniqueEmails(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim().toLowerCase()).filter((value) => value.includes('@'))));
}

async function enqueueEmailAttempt(payload: Record<string, unknown>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return;

  try {
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await client.from('prokicks_email_queue').insert(payload);

    if (!error) return;

    const legacyPayload = {
      recipient_email: payload.recipient || payload.recipient_email || null,
      subject: payload.subject || 'ProKicks Play',
      template: 'tournament_registration',
      payload: payload.payload || payload,
      status: payload.status || 'pending',
      provider: payload.provider || 'resend',
      error_message: payload.error || null,
      recipient_type: 'user',
    };

    await client.from('prokicks_email_queue').insert(legacyPayload);
  } catch (error) {
    captureError(error, { area: 'email-queue' });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.PROKICKS_EMAIL_FROM || 'ProKicks Play <pako@sportcstudio.com>';
    const primaryAdminEmail = 'pako@sportcstudio.com';
    const adminRecipients = uniqueEmails([primaryAdminEmail, process.env.PROKICKS_ADMIN_EMAIL || '']);

    if (!apiKey) {
      await enqueueEmailAttempt({
        recipient: body.email || null,
        subject: 'Registro recibido — ProKicks Play',
        status: 'skipped',
        provider: 'resend',
        error: 'RESEND_API_KEY not configured',
        payload: body,
      });
      return NextResponse.json({ ok: false, skipped: true, reason: 'RESEND_API_KEY not configured' }, { status: 200 });
    }

    const email = String(body.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ ok: false, error: 'Invalid user email' }, { status: 400 });
    }

    const cost = Number(body.cost || 0);
    const currency = String(body.currency || 'MXN');
    const hasCost = body.paymentStatus === 'pago_pendiente' && cost > 0;
    const costText = money(cost, currency);
    const tournamentTitle = safe(body.tournamentTitle || 'Torneo ProKicks');
    const participantName = safe(body.name || 'jugador');
    const modality = safe(body.modality || 'individual');
    const branch = safe(body.branch || 'libre');
    const whatsapp = safe(body.whatsapp || '');
    const tournamentDate = formatDate(body.tournamentDate);
    const venue = safe(body.venue || 'Por confirmar');
    const paymentStatus = safe(body.paymentStatus || (hasCost ? 'pago_pendiente' : 'sin_costo'));
    const registrationStatus = safe(body.registrationStatus || (hasCost ? 'pendiente' : 'confirmado'));
    const participants = Array.isArray(body.participants) ? body.participants : [];
    const guardian = body.guardian && typeof body.guardian === 'object' ? body.guardian as Record<string, unknown> : null;
    const paymentText = hasCost ? 'Pago pendiente' : 'Registro sin costo';
    const prokicksContact = primaryAdminEmail;

    const userSubject = 'Registro recibido — ProKicks Play';

    const userHtml = `
      <div style="font-family:Arial,sans-serif;color:#1F2937;line-height:1.5;max-width:620px;margin:0 auto;padding:20px">
        <h1 style="color:#173B63;margin-bottom:8px">Registro recibido</h1>
        <p>Hola ${participantName}, recibimos tu registro para <strong>${tournamentTitle}</strong>.</p>
        <p><strong>Modalidad:</strong> ${modality}<br />
        <strong>Torneo:</strong> ${tournamentTitle}<br />
        <strong>Rama:</strong> ${branch}<br />
        <strong>Fecha:</strong> ${tournamentDate}<br />
        <strong>Sede:</strong> ${venue}<br />
        <strong>Estado del registro:</strong> ${registrationStatus}<br />
        <strong>Estado de pago:</strong> ${paymentStatus}<br />
        <strong>WhatsApp:</strong> ${whatsapp}</p>
        <p><strong>${paymentText}</strong>${hasCost ? ` · ${costText}` : ''}</p>
        <p>Te recomendamos revisar el reglamento antes del torneo.</p>
        <p><strong>Contacto ProKicks:</strong> ${safe(prokicksContact)}</p>
        <p style="margin-top:24px;color:#64748B">ProKicks Play</p>
      </div>
    `;

    const adminSubject = 'Nuevo registro a torneo — ProKicks Play';
    const adminHtml = `
      <div style="font-family:Arial,sans-serif;color:#1F2937;line-height:1.5;max-width:620px;margin:0 auto;padding:20px">
        <h1 style="color:#173B63;margin-bottom:8px">Nuevo Registro a Torneos</h1>
        <p><strong>Torneo:</strong> ${tournamentTitle}</p>
        <p><strong>Participante(s):</strong> ${participants.map((p: any) => safe(`${p.number}. ${p.name} · ${p.age} años · ${p.whatsapp}`)).join('<br />') || participantName}<br />
        <strong>Email:</strong> ${email}<br />
        <strong>WhatsApp:</strong> ${whatsapp}<br />
        <strong>Modalidad:</strong> ${modality}<br />
        <strong>Rama:</strong> ${branch}<br />
        <strong>Estado de registro:</strong> ${registrationStatus}<br />
        <strong>Estado de pago:</strong> ${paymentStatus}<br />
        <strong>Fecha de registro:</strong> ${formatDate(new Date().toISOString())}<br />
        <strong>Aceptó reglamento:</strong> ${yesNo(body.acceptedRules)}<br />
        <strong>Aceptó uso de imagen:</strong> ${yesNo(body.acceptedImageRelease)}</p>
        <p><strong>Pago:</strong> ${hasCost ? `Pendiente · ${costText}` : 'Sin costo'}</p>
        ${guardian ? `<p><strong>Tutor:</strong> ${safe(guardian.name)}<br /><strong>WhatsApp tutor:</strong> ${safe(guardian.whatsapp)}<br /><strong>Email tutor:</strong> ${safe(guardian.email)}<br /><strong>Aceptación tutor:</strong> ${yesNo(guardian.accepted)}</p>` : ''}
      </div>
    `;

    const sends = [
      sendResendEmail(apiKey, from, { to: email, subject: userSubject, html: userHtml }),
    ];

    adminRecipients.forEach((adminEmail) => {
      sends.push(sendResendEmail(apiKey, from, { to: adminEmail, subject: adminSubject, html: adminHtml }));
    });

    const results = await Promise.all(sends);
    const allOk = results.every((r) => r.ok);
    if (!allOk) {
      console.error('ProKicks email send partial failure', JSON.stringify({ adminRecipients, results }));
    }

    await enqueueEmailAttempt({
      recipient: email,
      subject: userSubject,
      status: allOk ? 'sent' : 'pending',
      provider: 'resend',
      error: allOk ? null : JSON.stringify(results.filter((r) => !r.ok)),
      payload: { body, results },
    });

    return NextResponse.json({ ok: allOk, results }, { status: allOk ? 200 : 207 });
  } catch (error) {
    captureError(error, { area: 'tournament-registration-email' });
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

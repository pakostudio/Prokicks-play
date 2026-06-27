import { NextResponse } from 'next/server';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.PROKICKS_EMAIL_FROM || 'ProKicks <onboarding@resend.dev>';
    const adminEmail = process.env.PROKICKS_ADMIN_EMAIL;

    if (!apiKey) {
      return NextResponse.json({ ok: false, skipped: true, reason: 'RESEND_API_KEY not configured' }, { status: 200 });
    }

    const email = String(body.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ ok: false, error: 'Invalid user email' }, { status: 400 });
    }

    const cost = Number(body.cost || 0);
    const currency = String(body.currency || 'MXN');
    const isPaid = body.paymentStatus === 'pago_pendiente' && cost > 0;
    const costText = new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(cost);
    const tournamentTitle = safe(body.tournamentTitle || 'Torneo ProKicks');
    const participantName = safe(body.name || 'jugador');
    const modality = safe(body.modality || 'individual');
    const branch = safe(body.branch || 'libre');
    const whatsapp = safe(body.whatsapp || '');

    const userSubject = isPaid
      ? 'Pre-registro recibido · ProKicks Play'
      : 'Registro confirmado · ProKicks Play';

    const userHtml = `
      <div style="font-family:Arial,sans-serif;color:#1F2937;line-height:1.5;max-width:620px;margin:0 auto;padding:20px">
        <h1 style="color:#173B63;margin-bottom:8px">${isPaid ? 'Pre-registro recibido' : 'Registro confirmado'}</h1>
        <p>Hola ${participantName}, recibimos tu registro para <strong>${tournamentTitle}</strong>.</p>
        <p><strong>Modalidad:</strong> ${modality}<br />
        <strong>Rama:</strong> ${branch}<br />
        <strong>WhatsApp:</strong> ${whatsapp}</p>
        ${isPaid ? `<p><strong>Costo:</strong> ${costText}. Tu lugar queda pendiente hasta confirmar pago.</p>` : '<p>Este registro es sin costo.</p>'}
        <p>Te recomendamos revisar el reglamento antes del torneo.</p>
        <p style="margin-top:24px;color:#64748B">ProKicks Play</p>
      </div>
    `;

    const adminSubject = `Nuevo registro · ${tournamentTitle}`;
    const adminHtml = `
      <div style="font-family:Arial,sans-serif;color:#1F2937;line-height:1.5;max-width:620px;margin:0 auto;padding:20px">
        <h1 style="color:#173B63;margin-bottom:8px">Nuevo Registro a Torneos</h1>
        <p><strong>Torneo:</strong> ${tournamentTitle}</p>
        <p><strong>Participante:</strong> ${participantName}<br />
        <strong>Email:</strong> ${email}<br />
        <strong>WhatsApp:</strong> ${whatsapp}<br />
        <strong>Modalidad:</strong> ${modality}<br />
        <strong>Rama:</strong> ${branch}</p>
        <p><strong>Pago:</strong> ${isPaid ? `Pendiente · ${costText}` : 'Sin costo'}</p>
      </div>
    `;

    const sends = [
      sendResendEmail(apiKey, from, { to: email, subject: userSubject, html: userHtml }),
    ];

    if (adminEmail && adminEmail.includes('@') && adminEmail.toLowerCase() !== email) {
      sends.push(sendResendEmail(apiKey, from, { to: adminEmail, subject: adminSubject, html: adminHtml }));
    }

    const results = await Promise.all(sends);
    const allOk = results.every((r) => r.ok);

    return NextResponse.json({ ok: allOk, results }, { status: allOk ? 200 : 207 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

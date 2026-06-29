import { NextResponse } from 'next/server';

type Payload = {
  name?: string;
  email?: string;
  whatsapp?: string;
  nickname?: string;
  avatarName?: string;
};

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PROKICKS_EMAIL_FROM || 'ProKicks Play <pako@sportcstudio.com>';

  if (!apiKey) return { ok: false, skipped: true, reason: 'RESEND_API_KEY not configured' };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  const result = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, result };
}

function uniqueEmails(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim().toLowerCase()).filter((value) => value.includes('@'))));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Payload;
  const adminRecipients = uniqueEmails(['pako@sportcstudio.com', process.env.PROKICKS_ADMIN_EMAIL || '']);

  if (!body.email || !body.name || !body.nickname) {
    return NextResponse.json({ ok: false, error: 'Missing profile fields' }, { status: 400 });
  }

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#151515">
      <h1>Perfil ProKicks creado</h1>
      <p>Tu perfil está listo para conectar spots, crear retas y registrarte a torneos.</p>
      <ul>
        <li><strong>Nombre:</strong> ${body.name}</li>
        <li><strong>Nickname:</strong> ${body.nickname}</li>
        <li><strong>Avatar:</strong> ${body.avatarName || 'ProKicks Crew'}</li>
        <li><strong>WhatsApp:</strong> ${body.whatsapp || '-'}</li>
      </ul>
    </div>
  `;

  const adminHtml = `${html}<p><strong>Nuevo perfil para admin:</strong> ${body.email}</p>`;
  const results = await Promise.all([
    sendEmail(body.email, 'Tu perfil ProKicks está listo', html),
    ...adminRecipients.map((adminEmail) => sendEmail(adminEmail, 'Nuevo perfil ProKicks', adminHtml)),
  ]);

  return NextResponse.json({ ok: results.every((result) => result.ok), results }, { status: results.every((result) => result.ok) ? 200 : 207 });
}

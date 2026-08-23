import { NextResponse } from 'next/server';
import { createAdminSession, getAdminPasscode } from '@/lib/adminAuth';
import { captureError } from '@/lib/monitoring';
import { supabase } from '@/lib/supabase';

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 10;

function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  try {
    if (!getAdminPasscode()) {
      return NextResponse.json({ ok: false, error: 'Admin passcode not configured' }, { status: 503 });
    }

    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('prokicks_admin_login_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('ip', ip)
      .eq('success', false)
      .gte('created_at', windowStart);

    if ((count || 0) >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { ok: false, error: `Demasiados intentos. Espera ${WINDOW_MINUTES} minutos e intenta de nuevo.` },
        { status: 429 }
      );
    }

    const { username, passcode } = await request.json();
    const session = await createAdminSession(String(username || ''), String(passcode || ''));

    await supabase.from('prokicks_admin_login_attempts').insert({ ip, success: Boolean(session) }).then(
      () => null,
      () => null
    );

    if (!session) {
      return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set('prokicks_admin_session', session, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 12 * 60 * 60,
    });
    return response;
  } catch (error) {
    captureError(error, { area: 'admin-login', ip });
    return NextResponse.json({ ok: false, error: 'Login failed' }, { status: 500 });
  }
}

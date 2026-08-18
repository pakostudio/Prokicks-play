import { NextResponse } from 'next/server';
import { createAdminSession, getAdminPasscode } from '@/lib/adminAuth';
import { captureError } from '@/lib/monitoring';

export async function POST(request: Request) {
  try {
    const { username, passcode } = await request.json();

    if (!getAdminPasscode()) {
      return NextResponse.json({ ok: false, error: 'Admin passcode not configured' }, { status: 503 });
    }

    const session = await createAdminSession(String(username || ''), String(passcode || ''));
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
    captureError(error, { area: 'admin-login' });
    return NextResponse.json({ ok: false, error: 'Login failed' }, { status: 500 });
  }
}

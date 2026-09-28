import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ success: false, error: 'missing-token' }, { status: 400 });
    }

    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ success: false, error: 'server-not-configured' }, { status: 500 });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

    const body = new URLSearchParams();
    body.set('secret', secret);
    body.set('response', token);
    if (ip) body.set('remoteip', ip);

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const verifyJson = await verifyRes.json();

    if (!verifyJson.success) {
      return NextResponse.json({ success: false, error: 'verification-failed' }, { status: 200 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'unexpected-error' }, { status: 500 });
  }
}

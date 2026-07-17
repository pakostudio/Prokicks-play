import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { CompleteVisionSessionPayload } from '@/lib/vision/types';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as CompleteVisionSessionPayload | null;

  if (!body?.session_id || !body.ended_at || typeof body.duration_seconds !== 'number') {
    return NextResponse.json(
      { error: 'session_id, ended_at y duration_seconds son requeridos' },
      { status: 400 }
    );
  }

  const client = getServiceClient();
  if (!client) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  const { error } = await client
    .from('vision_sessions')
    .update({
      status: 'completed',
      ended_at: body.ended_at,
      duration_seconds: body.duration_seconds
    })
    .eq('id', body.session_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ session_id: body.session_id, status: 'completed', reason: body.reason });
}

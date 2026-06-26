import { supabaseReady } from '@/lib/supabase';

export function SupabaseNotice() {
  if (supabaseReady) return null;
  return <div className="alert error">Faltan variables de Supabase en .env.local. Revisa README.md.</div>;
}

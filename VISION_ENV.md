# Variables de entorno — ProKicks Vision

Ya existen en Vercel (reutilizadas, no se duplican):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Nueva, requerida solo por las API routes en el servidor
(`app/api/vision/*`), **nunca expuesta al navegador**:

- `SUPABASE_SERVICE_ROLE_KEY` — Settings → API → `service_role` del
  proyecto Supabase real de ProKicks Play. Agregar en Vercel como
  Sensitive, entornos Production y Preview.

No se requieren variables adicionales para esta primera etapa (no hay
licencias de pago ni integración de sensores todavía).

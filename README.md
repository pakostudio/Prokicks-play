# ProKicks Play · Sprint 1.3

Incluye correcciones urgentes para revisión con cliente:

- Portada/access con hero compacto y foto del producto integrada.
- Login por correo electrónico.
- Recuperación de contraseña: `/recuperar` y `/reset-password`.
- Callback de auth: `/auth/callback`.
- Registro por pasos con fecha de nacimiento, menores, tutor, ubicación, nickname, avatar y consentimientos separados.
- Links legales provisionales: `/legal/terms`, `/legal/privacy`, `/legal/image-release`, `/legal/marketing`, `/legal/minor-consent`.
- 32 estados de México + alcaldías CDMX y municipios base por estado.
- Torneos demo sin costo: `/torneos`.
- Registro a torneos sin pago: `/torneos/[id]/registro`.
- Admin con exportación CSV / Excel / PDF: `/admin/export`.

## Supabase

Ejecutar en SQL Editor:

1. `supabase/registration_migration.sql` si no se ha corrido.
2. `supabase/tournaments_migration.sql` para torneos y registros.

## Variables Vercel

```env
NEXT_PUBLIC_SUPABASE_URL=https://bljqlibgwvpflrtwgsef.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_APP_URL=https://prokicks-play.vercel.app
```

## Nota legal

Los textos legales son placeholders operativos para demo. Antes del lanzamiento deben ser revisados por abogado mexicano especializado en privacidad digital, especialmente por cuentas de menores y consentimiento parental.

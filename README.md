# ProKicks Play · Sprint 1.1 Registro

Base para GitHub + Supabase + Vercel con:

- Portada de acceso como primera pantalla.
- Login con Supabase Auth.
- Registro por pasos.
- Fecha de nacimiento con cálculo de edad.
- Tratamiento especial para menores.
- Tutor para menores de 18.
- Nickname y avatar.
- Estado + municipio/alcaldía.
- Consentimientos separados.
- Modo invitado.
- Tablas aisladas con prefijo `prokicks_` para convivir dentro de `smsoluciones-os`.

## Supabase

Si ya tienes las tablas base, ejecuta solo:

```sql
supabase/registration_migration.sql
```

Si instalas desde cero, ejecuta:

```sql
supabase/schema.sql
supabase/seed.sql
```

## Variables Vercel

```bash
NEXT_PUBLIC_SUPABASE_URL=https://bljqlibgwvpflrtwgsef.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_PUBLISHABLE_KEY
NEXT_PUBLIC_APP_URL=https://prokicks-play.vercel.app
```

## Rutas principales

- `/` Portada / acceso.
- `/login` Portada / acceso.
- `/registro` Registro por pasos.
- `/registro/pendiente` Cuenta de menor pendiente de tutor.
- `/guest` Recorrido invitado.
- `/play` Home funcional.
- `/scan` QR manual.
- `/spots` Spots.
- `/retas` Retas.
- `/ranking` Ranking.
- `/perfil` Perfil.

## Nota legal

Los textos finales de Términos, Aviso de Privacidad, autorización de menores y uso de imagen deben revisarse con abogado mexicano especializado en privacidad digital antes de lanzamiento.

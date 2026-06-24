# ProKicks Play · Sprint 1 Core Play Loop

Base inicial para GitHub + Supabase + Vercel.

## 1. Instalar

```bash
npm install
cp .env.example .env.local
npm run dev
```

## 2. Supabase

En Supabase:

1. Crear proyecto.
2. Ir a **Project Settings > API**.
3. Copiar Project URL y anon public key.
4. Pegarlas en `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Ir a **SQL Editor**.
6. Ejecutar `supabase/schema.sql`.
7. Ejecutar `supabase/seed.sql`.
8. En **Authentication > Providers > Email**, activar Email.
9. Para pruebas rápidas, desactivar temporalmente Confirm email.

## 3. GitHub

```bash
git init
git add .
git commit -m "Sprint 1 Core Play Loop"
git branch -M main
git remote add origin URL_DE_TU_REPO
git push -u origin main
```

## 4. Vercel

1. Importar repo desde GitHub.
2. Agregar variables de entorno:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_APP_URL
3. Deploy.

## Rutas listas

- `/` Home
- `/login` Supabase Auth
- `/onboarding` Perfil
- `/spots` Mapa/lista spots
- `/spots/[id]` Detalle spot
- `/scan` QR manual
- `/retas` Retas
- `/retas/nueva` Crear reta
- `/retas/[id]` Detalle reta
- `/resultado` Registrar resultado
- `/ranking` Ranking demo
- `/perfil` Perfil
- `/admin` Admin básico
- `/admin/spots` Spots/QR admin
- `/admin/retas` Retas admin

## Regla visual

No fondos oscuros. Base blanca/gris claro, texto negro/gris carbón, acentos cyan/azul/morado/amarillo/naranja.

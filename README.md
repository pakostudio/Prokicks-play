# ProKicks Play

Plataforma digital para gestionar torneos deportivos recreativos de extremo a extremo: registro de jugadores, check-in en el spot, captura de resultados en vivo, panel administrativo centralizado y medición de desempeño físico con visión por computadora (módulo ProX, en etapa de validación).

## Stack tecnológico

- **Frontend:** Next.js + React (TypeScript)
- **Backend / Base de datos:** Supabase (Postgres, Auth, RLS)
- **Hosting / CI-CD:** Vercel (despliegue automático desde `main`)
- **Visión por computadora:** TensorFlow.js + pose-detection (módulo ProX)
- **Seguridad de acceso:** Cloudflare Turnstile

## Estructura de carpetas

- `app/` — rutas y pantallas (Next.js App Router), incluye el panel admin y el módulo `/vision`
- `components/` — componentes de interfaz reutilizables
- `lib/` — lógica compartida (certificados, adaptadores de WhatsApp, utilidades)
- `play/` — lógica específica del flujo de juego/torneos
- `public/` — assets estáticos (logo, imágenes, favicon)
- `supabase/` — migraciones y configuración de base de datos

## Cómo correrlo localmente

```bash
npm install
npm run dev
```

Se requiere un archivo `.env.local` con las variables de entorno de Supabase y WhatsApp — ver `VISION_ENV.md` y `WHATSAPP_ENV.md` para el detalle de cada una. Ninguna credencial vive en el repositorio.

## Documentación relacionada

- [`VISION_README.md`](./VISION_README.md) — alcance y rutas del módulo ProKicks Vision
- [`VISION_ENV.md`](./VISION_ENV.md) — variables de entorno del módulo Vision
- [`WHATSAPP_ENV.md`](./WHATSAPP_ENV.md) — variables de entorno para notificaciones por WhatsApp

## Flujo de despliegue

Todo cambio se sube a `main` en GitHub y Vercel lo despliega automáticamente. No hay archivos sueltos fuera del control de versiones.

---

Contacto: Pako — pako@sportcstudio.com

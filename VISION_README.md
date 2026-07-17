# ProKicks Vision

Módulo independiente dentro de ProKicks Play para registrar, calibrar, ejecutar
y consultar sesiones de entrenamiento con hasta 4 jugadores y 2 cámaras.

No modifica Inicio, Spots, QR, Torneos, Ranking, Perfil, Retas, Galería, Videos
ni Admin. No se agregó al menú inferior todavía — el acceso es desde una
tarjeta nueva en `/play`.

## Rutas

- `/vision` — pantalla de entrada del módulo.
- `/vision/nueva-sesion` — selección de 1 a 4 jugadores, crea la sesión en Supabase.
- `/vision/camaras` — detección y vista previa de cámaras (`navigator.mediaDevices`).
- `/vision/calibracion` — asignación visual jugador ↔ tracking_id.
- `/vision/sesion/[id]` — pantalla activa: temporizador de 20 min, pausa, métricas en vivo.
- `/vision/resultados/[id]` — resultados por jugador y evolución histórica.
- `/vision/historial` — todas las sesiones del coach.
- `/vision/jugador/[id]` — historial y métricas propias de un jugador.

## Arquitectura del motor

ProKicks Play (Next.js/Vercel) **no** ejecuta detección ni tracking pesado.
El pipeline real corre fuera de este repo:

```
Cámaras → detector de objetos → ByteTrack → Supervision/OpenCV
        → motor propio de eventos y métricas → API local
        → Supabase → ProKicks Play
```

El "API local" son los endpoints de este mismo proyecto Next.js:

- `POST /api/vision/sessions` — crea sesión + asigna jugadores.
- `POST /api/vision/events` — recibe eventos crudos (contacto, pase, etc.).
- `POST /api/vision/metrics` — recibe métricas calculadas por jugador.
- `POST /api/vision/complete` — cierra un bloque de 20 minutos.

Los contratos TypeScript de estos payloads están en `lib/vision/types.ts`.
El cliente de referencia para llamarlos está en `lib/vision/engineClient.ts`.

## Primera etapa de métricas

Claves fijas en `VISION_METRIC_KEYS` (`lib/vision/types.ts`):
`contactos_estimados`, `participacion`, `tiempo_entre_eventos`,
`tiempo_reaccion`, `posicion_x`, `posicion_y`, `trayectoria`,
`desplazamiento`, `distancia_recorrida`, `velocidad_aproximada`,
`tiempo_activo`, `consistencia`, `confianza_modelo`.

Si el motor todavía no genera una métrica, la UI muestra
**"Pendiente de validación"** en vez de inventar un valor.

## Fase futura — sensores (ESP32)

Tabla `sensor_events` ya creada en la migración, sin conectar a ningún
hardware. Cuando exista el sensor físico, solo debe insertar filas en esa
tabla (o llamar a un endpoint nuevo que la use) con `sensor_id`,
`timestamp_ms`, `impact_detected`, `relative_intensity`, `axis_x`, `axis_y`,
`axis_z`.

## Seguridad

RLS activo en las 6 tablas nuevas (`vision_sessions`,
`vision_session_players`, `vision_calibrations`, `vision_events`,
`vision_metrics`, `sensor_events`). Ningún usuario anónimo puede leer ni
escribir. `service_role` solo se usa dentro de las API routes
(`app/api/vision/*`), nunca en el navegador — el cliente usa siempre el
`anon key` vía `lib/supabase.ts`.

## Variables de entorno nuevas

Ver `VISION_ENV.md`.

## Flujo de prueba

1. Ejecuta la migración `supabase/migrations/2026_07_17_vision_module.sql`
   en el proyecto real de Supabase.
2. Agrega `SUPABASE_SERVICE_ROLE_KEY` en Vercel (Production + Preview,
   marcada como Sensitive). Las demás variables (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) ya existen.
3. Entra a `/play` con un usuario que tenga `role` distinto de `player` (o
   ajusta la policy si quieres permitir a cualquier usuario ser coach) y
   pulsa "ProKicks Vision" → "Iniciar sesión".
4. Selecciona 1 a 4 jugadores → Continuar.
5. En `/vision/camaras`, pulsa "Buscar cámaras", concede permisos del
   navegador y selecciona Cámara 1 / Cámara 2.
6. En `/vision/calibracion`, sin el motor externo conectado verás el mensaje
   "Esperando detección de personas del motor de visión" — es esperado: la
   pantalla queda lista para recibir `detectedPersons` desde el motor real.
7. Con el motor conectado (fuera de este repo) y jugadores calibrados,
   pulsa "Iniciar sesión (20 min)".
8. En `/vision/sesion/[id]` corre el temporizador, puedes pausar/reanudar,
   abrir "Ver métricas" (panel lateral) y "Finalizar sesión".
9. Al llegar a 20:00 se guarda el bloque automáticamente y aparece la
   opción de iniciar el bloque 2 conservando jugadores y calibración.
10. `/vision/resultados/[id]` muestra métricas por jugador (o "Pendiente de
    validación" si el motor no las ha enviado), evolución y récord personal.
11. `/vision/historial` y `/vision/jugador/[id]` muestran el histórico.

## Build

`npm run build` debe completar sin errores usando Next.js App Router,
TypeScript y los mismos imports (`@/lib`, `@/components`) que el resto del
proyecto. No se agregaron dependencias npm nuevas.

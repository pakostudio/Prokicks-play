const MESES_ABREV = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const TZ = 'America/Mexico_City';

function toDate(value: string | Date): Date {
  return typeof value === 'string' ? new Date(value) : value;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Extrae los componentes de fecha/hora en una zona horaria fija (America/Mexico_City)
 *  para que el render en servidor (Vercel, UTC) y en el navegador del usuario
 *  produzcan siempre el mismo texto y no truene la hidratación de React (#418). */
function partsInTZ(d: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).formatToParts(d);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  return {
    day: Number(map.day),
    month: Number(map.month),
    year: Number(map.year),
    hour: Number(map.hour),
    minute: Number(map.minute),
    dayPeriod: map.dayPeriod || '',
  };
}

export function formatDateEs(value: string | Date): string {
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return '';
  const { day, month, year } = partsInTZ(d);
  return `${day}/${month}/${year}`;
}

/** Formato "22 ago" para tarjetas pequeñas. */
export function formatDateShortEs(value: string | Date): string {
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return '';
  const { day, month } = partsInTZ(d);
  return `${day} ${MESES_ABREV[month - 1]}`;
}

/** Fecha + hora determinista: "22/8/2026, 10:30 a. m.". */
export function formatDateTimeEs(value: string | Date): string {
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return '';
  const { day, month, year, hour, minute, dayPeriod } = partsInTZ(d);
  const ampm = /pm/i.test(dayPeriod) ? 'p. m.' : 'a. m.';
  return `${day}/${month}/${year}, ${hour}:${pad2(minute)} ${ampm}`;
}

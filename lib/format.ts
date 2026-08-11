const MESES_ABREV = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function toDate(value: string | Date): Date {
  return typeof value === 'string' ? new Date(value) : value;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Formato corto determinista: "22/8/2026". No depende de Intl, así que el servidor y el navegador siempre coinciden (evita errores de hidratación). */
export function formatDateEs(value: string | Date): string {
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

/** Formato "22 ago" para tarjetas pequeñas. */
export function formatDateShortEs(value: string | Date): string {
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MESES_ABREV[d.getMonth()]}`;
}

/** Fecha + hora deterministas: "22/8/2026, 10:30 a. m.". */
export function formatDateTimeEs(value: string | Date): string {
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return '';
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}, ${hours}:${pad2(minutes)} ${ampm}`;
}

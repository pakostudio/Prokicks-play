'use client';

// Gráfico de evolución simple en SVG puro, sin dependencias nuevas.
type Props = {
  values: number[];
  unit?: string;
};

export function EvolutionChart({ values, unit }: Props) {
  if (!values.length) {
    return <p className="p muted">Pendiente de validación — aún no hay histórico suficiente.</p>;
  }

  const width = 280;
  const height = 90;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = values.length > 1 ? width / (values.length - 1) : 0;

  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="vision-evolution-chart" role="img">
      <polyline fill="none" stroke="#2563EB" strokeWidth="2" points={points} />
      {values.map((v, i) => {
        const x = i * step;
        const y = height - ((v - min) / range) * height;
        return <circle key={i} cx={x} cy={y} r={3} fill="#173B63" />;
      })}
      {unit && (
        <text x={4} y={12} fontSize={10} fill="#1F2937">
          {unit}
        </text>
      )}
    </svg>
  );
}

'use client';

import { X } from 'lucide-react';
import type { VisionMetric } from '@/lib/vision/types';
import { VISION_METRIC_KEYS, VISION_METRIC_LABELS } from '@/lib/vision/types';
import { pendingIfMissing } from '@/lib/vision/supabaseVision';

type Props = {
  open: boolean;
  onClose: () => void;
  metricsByPlayer: Record<string, VisionMetric[]>;
  playerNames: Record<string, string>;
};

// Panel lateral "Ver métricas". No detiene la sesión: se muestra sobre la
// pantalla de sesión activa como un overlay.
export function MetricsPanel({ open, onClose, metricsByPlayer, playerNames }: Props) {
  if (!open) return null;

  return (
    <aside className="vision-metrics-panel">
      <div className="row">
        <h3 className="card-title">Métricas en vivo</h3>
        <button type="button" className="btn btn-soft vision-panel-close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      {Object.keys(metricsByPlayer).length === 0 && (
        <p className="p muted">Pendiente de validación — el motor aún no ha enviado métricas.</p>
      )}

      {Object.entries(metricsByPlayer).map(([playerId, metrics]) => (
        <div className="card vision-metrics-player" key={playerId}>
          <h4 className="card-title">{playerNames[playerId] || 'Jugador'}</h4>
          <table className="vision-metrics-table">
            <tbody>
              {VISION_METRIC_KEYS.map((key) => {
                const metric = metrics.find((m) => m.metric_key === key);
                return (
                  <tr key={key}>
                    <td>{VISION_METRIC_LABELS[key]}</td>
                    <td>
                      {pendingIfMissing(metric?.metric_value ?? null)}
                      {metric?.metric_unit ? ` ${metric.metric_unit}` : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </aside>
  );
}

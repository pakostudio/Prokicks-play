'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Square } from 'lucide-react';

const BLOCK_SECONDS = 20 * 60;

type Props = {
  running: boolean;
  paused: boolean;
  onTick?: (secondsElapsed: number) => void;
  onAutoComplete: () => void;
  onPauseToggle: () => void;
  onFinish: () => void;
};

export function SessionTimer({ running, paused, onTick, onAutoComplete, onPauseToggle, onFinish }: Props) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoCompleteFiredRef = useRef(false);

  useEffect(() => {
    if (running && !paused) {
      intervalRef.current = setInterval(() => {
        setSecondsElapsed((s) => {
          const next = s + 1;
          onTick?.(next);
          if (next >= BLOCK_SECONDS && !autoCompleteFiredRef.current) {
            autoCompleteFiredRef.current = true;
            onAutoComplete();
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, paused, onTick, onAutoComplete]);

  const remaining = Math.max(BLOCK_SECONDS - secondsElapsed, 0);
  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  return (
    <section className="card vision-session-timer">
      <div className="vision-timer-display">
        {minutes}:{seconds}
      </div>
      <div className="grid-2">
        <button type="button" className="btn btn-soft" onClick={onPauseToggle}>
          {paused ? <Play size={18} /> : <Pause size={18} />} {paused ? 'Reanudar' : 'Pausar'}
        </button>
        <button type="button" className="btn btn-warm" onClick={onFinish}>
          <Square size={18} /> Finalizar sesión
        </button>
      </div>
    </section>
  );
}

export { BLOCK_SECONDS };

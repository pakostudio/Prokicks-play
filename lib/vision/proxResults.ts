export type ProxResult = {
    salto_altura: number;
    desplazamiento_lateral: number;
    habilidad_tecnica: number;
    velocidad_aproximada: number;
    tiempo_reaccion: number;
    consistencia: number;
    measured_at: string;
};

export const PROX_RESULTS_KEY = 'prokicks_prox_results';

type ProxMetricKey = keyof Omit<ProxResult, 'measured_at'>;

export const PROX_METRIC_META: Record<ProxMetricKey, { unit: string; decimals: number; higherIsBetter: boolean; communityAvg: number }> = {
    salto_altura: { unit: 'cm', decimals: 0, higherIsBetter: true, communityAvg: 38 },
    desplazamiento_lateral: { unit: 'm/s', decimals: 1, higherIsBetter: true, communityAvg: 2.6 },
    habilidad_tecnica: { unit: '/100', decimals: 0, higherIsBetter: true, communityAvg: 72 },
    velocidad_aproximada: { unit: 'km/h', decimals: 0, higherIsBetter: true, communityAvg: 19 },
    tiempo_reaccion: { unit: 's', decimals: 2, higherIsBetter: false, communityAvg: 0.27 },
    consistencia: { unit: '/100', decimals: 0, higherIsBetter: true, communityAvg: 78 },
};

function randomInRange(min: number, max: number) {
    return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

export function generateDemoProxResult(): ProxResult {
    return {
          salto_altura: randomInRange(28, 52),
          desplazamiento_lateral: randomInRange(1.8, 3.4),
          habilidad_tecnica: randomInRange(55, 94),
          velocidad_aproximada: randomInRange(14, 26),
          tiempo_reaccion: randomInRange(0.18, 0.38),
          consistencia: randomInRange(60, 96),
          measured_at: new Date().toISOString(),
    };
}

export function readProxResult(): ProxResult | null {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(PROX_RESULTS_KEY);
    if (!raw) return null;
    try {
          return JSON.parse(raw) as ProxResult;
    } catch {
          return null;
    }
}

export function saveProxResult(result: ProxResult) {
    window.localStorage.setItem(PROX_RESULTS_KEY, JSON.stringify(result));
}

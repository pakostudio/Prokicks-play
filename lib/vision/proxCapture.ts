import { Keypoint, kp, midpoint } from './poseEngine';

export type Sample = { t: number; keypoints: Keypoint[] };

function hipCenter(k: Keypoint[]) {
  const lh = kp(k, 'left_hip');
  const rh = kp(k, 'right_hip');
  if (lh && rh) return midpoint(lh, rh);
  return lh || rh || null;
}

function bodyPixelHeight(k: Keypoint[]) {
  const nose = kp(k, 'nose');
  const la = kp(k, 'left_ankle');
  const ra = kp(k, 'right_ankle');
  const ankle = la && ra ? midpoint(la, ra) : la || ra;
  if (!nose || !ankle) return null;
  return Math.abs(ankle.y - nose.y);
}

// Convierte pixeles a centimetros usando la estatura del jugador como referencia.
export function calibrateScale(samples: Sample[], userHeightCm: number) {
  const heights = samples
    .map((s) => bodyPixelHeight(s.keypoints))
    .filter((h): h is number => h !== null && h > 0);
  if (!heights.length) return null;
  heights.sort((a, b) => a - b);
  const median = heights[Math.floor(heights.length / 2)];
  return median / userHeightCm; // pixeles por cm
}

export function computeJumpHeightCm(samples: Sample[], pxPerCm: number) {
  const ys = samples
    .map((s) => hipCenter(s.keypoints)?.y)
    .filter((y): y is number => y !== undefined && y !== null);
  if (ys.length < 4 || !pxPerCm) return 0;
  const baseWindow = Math.max(3, Math.floor(ys.length * 0.2));
  const baseline = ys.slice(0, baseWindow).reduce((a, b) => a + b, 0) / baseWindow;
  const minY = Math.min(...ys);
  const risePx = Math.max(0, baseline - minY);
  return Math.round((risePx / pxPerCm) * 10) / 10;
}

export function computeLateralMetrics(samples: Sample[], pxPerCm: number) {
  const pts = samples
    .map((s) => ({ t: s.t, p: hipCenter(s.keypoints) }))
    .filter((s): s is { t: number; p: { x: number; y: number } } => !!s.p);

  if (pts.length < 4 || !pxPerCm) {
    return { maxSpeedMs: 0, avgSpeedKmh: 0, consistency: 0 };
  }

  let totalDistCm = 0;
  let maxSpeed = 0;
  const speeds: number[] = [];

  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].p.x - pts[i - 1].p.x;
    const dt = (pts[i].t - pts[i - 1].t) / 1000;
    if (dt <= 0) continue;
    const distCm = Math.abs(dx) / pxPerCm;
    const speedMs = distCm / 100 / dt;
    totalDistCm += distCm;
    if (speedMs > maxSpeed) maxSpeed = speedMs;
    speeds.push(speedMs);
  }

  const durationS = (pts[pts.length - 1].t - pts[0].t) / 1000;
  const avgSpeedMs = durationS > 0 ? totalDistCm / 100 / durationS : 0;

  const mean = speeds.reduce((a, b) => a + b, 0) / (speeds.length || 1);
  const variance = speeds.reduce((a, b) => a + (b - mean) ** 2, 0) / (speeds.length || 1);
  const stdev = Math.sqrt(variance);
  const cv = mean > 0 ? stdev / mean : 1;
  const consistency = Math.max(0, Math.min(100, Math.round(100 - cv * 60)));

  return {
    maxSpeedMs: Math.round(maxSpeed * 10) / 10,
    avgSpeedKmh: Math.round(avgSpeedMs * 3.6 * 10) / 10,
    consistency,
  };
}

export function computeReactionSeconds(cueTimeMs: number, samples: Sample[]) {
  const after = samples.filter((s) => s.t >= cueTimeMs);
  if (after.length < 3) return 0.3;
  let baseline: { x: number; y: number } | null = null;
  for (let i = 0; i < after.length - 1; i++) {
    const p1 = hipCenter(after[i].keypoints);
    const p2 = hipCenter(after[i + 1].keypoints);
    if (!p1 || !p2) continue;
    if (!baseline) baseline = p1;
    const dist = Math.hypot(p2.x - baseline.x, p2.y - baseline.y);
    if (dist > 14) {
      return Math.max(0.08, Math.round(((after[i + 1].t - cueTimeMs) / 1000) * 100) / 100);
    }
  }
  return 0.6;
}

// Estimacion de fluidez/control corporal a partir del "jerk" (variacion de aceleracion)
// del centro de cadera. No mide contacto real con balon: es una aproximacion honesta
// de coordinacion y control mientras no haya seguimiento de objeto.
export function computeSmoothnessScore(samples: Sample[]) {
  const pts = samples.map((s) => hipCenter(s.keypoints)).filter((p): p is { x: number; y: number } => !!p);
  if (pts.length < 6) return 50;
  const jerks: number[] = [];
  for (let i = 2; i < pts.length; i++) {
    const a1 = { x: pts[i - 1].x - pts[i - 2].x, y: pts[i - 1].y - pts[i - 2].y };
    const a2 = { x: pts[i].x - pts[i - 1].x, y: pts[i].y - pts[i - 1].y };
    jerks.push(Math.hypot(a2.x - a1.x, a2.y - a1.y));
  }
  const meanJerk = jerks.reduce((a, b) => a + b, 0) / jerks.length;
  return Math.max(30, Math.min(98, Math.round(100 - meanJerk * 2)));
}

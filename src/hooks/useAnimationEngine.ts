import { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────
//  useAnimationEngine — ZERO React re-renders
//
//  Writes directly to CSS custom properties on :root each rAF tick.
//  Panel components read these vars via CSS — no state, no re-renders.
//
//  CSS vars written:
//    --anim-translate-x  (0–1)
//    --anim-scale        (0.2–1)
//    --anim-opacity      (0–1)
//
//  Cycle: forward → 0.5s pause → backward → 0.5s pause → repeat
// ─────────────────────────────────────────────

const DELAY = 0.5; // seconds between passes

// ── Newton-Raphson cubic bezier evaluator ─────────────────────────
function makeBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX  = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY  = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const getTforX = (x: number): number => {
    // Phase 1: Newton-Raphson — fast convergence when derivative is healthy
    let t = x;
    for (let i = 0; i < 4; i++) {
      const dx = sampleDX(t);
      if (Math.abs(dx) < 1e-6) break; // derivative too small — bail to bisection
      const xErr = sampleX(t) - x;
      if (Math.abs(xErr) < 1e-7) return t;
      const next = t - xErr / dx;
      // If NR step went out of [0,1], bail and bisect
      if (next < 0 || next > 1) break;
      t = next;
    }

    // Phase 2: Binary search — always converges, O(log n) precision
    let lo = 0, hi = 1;
    t = x; // reset
    while (hi - lo > 1e-7) {
      const mid = (lo + hi) / 2;
      if (sampleX(mid) < x) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  };

  return (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return sampleY(getTforX(x));
  };
}

// ── Write animT-derived values to CSS vars ─────────────────────────
const root = document.documentElement;

function applyAnimT(animT: number) {
  root.style.setProperty('--anim-translate-x', String(animT));
  root.style.setProperty('--anim-scale',        String(1 - animT * 0.8));
  root.style.setProperty('--anim-opacity',       String(1 - animT));
}

// ── Hook ──────────────────────────────────────────────────────────
export function useAnimationEngine(
  curveValues: [number, number, number, number],
  duration: number,
): void {
  const rafRef      = useRef<number | null>(null);
  const startRef    = useRef<number | null>(null);
  const phaseRef    = useRef<0 | 1 | 2 | 3>(0); // 0=fwd, 1=pause-end, 2=bwd, 3=pause-start
  const curveRef    = useRef(curveValues);
  const durationRef = useRef(duration);
  curveRef.current    = curveValues;
  durationRef.current = duration;

  useEffect(() => {
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = (now - startRef.current) / 1000;

      const [x1, y1, x2, y2] = curveRef.current;
      const bezier = makeBezier(
        Math.max(0, Math.min(1, x1)), y1,
        Math.max(0, Math.min(1, x2)), y2,
      );
      const dur = durationRef.current;

      switch (phaseRef.current) {
        case 0: { // forward
          const p = Math.min(elapsed / dur, 1);
          applyAnimT(bezier(p));
          if (p >= 1) { phaseRef.current = 1; startRef.current = now; }
          break;
        }
        case 1: { // pause at end
          applyAnimT(bezier(1));
          if (elapsed >= DELAY) { phaseRef.current = 2; startRef.current = now; }
          break;
        }
        case 2: { // backward
          const p = Math.min(elapsed / dur, 1);
          applyAnimT(1 - bezier(p));
          if (p >= 1) { phaseRef.current = 3; startRef.current = now; }
          break;
        }
        case 3: { // pause at start
          applyAnimT(0);
          if (elapsed >= DELAY) { phaseRef.current = 0; startRef.current = now; }
          break;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
      phaseRef.current = 0;
    };
  }, [duration]); // curve changes are read via ref — no restart needed
}

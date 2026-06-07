import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, animate } from 'framer-motion';
import { usePlayground } from '../../context/PlaygroundContext';
import { DOT_SPACING, BEZIER_UNIT_PX } from '../../constants';
import { useMorphHover } from '../../hooks/useMorphHover';

// ─────────────────────────────────────────────
//  BezierCurve – interactive SVG overlay with Y-axis panning
//
//  Pan limits (in bezier units from origin 0):
//    Max up  : bezier Y=3 at screen centre → panOffset = -2.5 × BEZIER_UNIT_PX
//    Max down: bezier Y=-3 at screen centre → panOffset = +3.5 × BEZIER_UNIT_PX
// ─────────────────────────────────────────────

const PAN_MIN = -2.5 * BEZIER_UNIT_PX; // px – max pan up
const PAN_MAX =  3.5 * BEZIER_UNIT_PX; // px – max pan down

const snapToDot = (v: number): number => {
  const phase = DOT_SPACING / 2;
  return phase + DOT_SPACING * Math.round((v - phase) / DOT_SPACING);
};

// ── Reset-pan icon (concentric-ring crosshair) ────────────────────
const CenterIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="3" />
    <line x1="12" y1="2" x2="12" y2="7" />
    <line x1="12" y1="17" x2="12" y2="22" />
    <line x1="2" y1="12" x2="7" y2="12" />
    <line x1="17" y1="12" x2="22" y2="12" />
  </svg>
);

// Style tokens
const CLR_CURVE       = 'var(--color-brand-base)';
const CLR_ENDPOINT    = '#ffffff';
const CLR_HANDLE      = 'var(--color-brand-base)';
const CLR_HANDLE_LINE = 'var(--color-border-dark)';
const CLR_LABEL       = 'var(--color-text-muted)';

const BezierCurve: React.FC = () => {
  const { curveValues, setCurveValues, panOffsetPx, setPanOffsetPx, snapToGrid, activeHandle, setActiveHandle, setHoveredHandle } = usePlayground();
  const resetMorph = useMorphHover();
  const snapToGridRef = useRef(snapToGrid);
  snapToGridRef.current = snapToGrid;

  // Viewport size
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  const resizing = useRef(false);
  const resizeTimer = useRef<number | null>(null);

  useEffect(() => {
    const onResize = () => {
      resizing.current = true;
      if (resizeTimer.current) window.clearTimeout(resizeTimer.current);
      resizeTimer.current = window.setTimeout(() => { resizing.current = false; }, 200);
      setVp({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (resizeTimer.current) window.clearTimeout(resizeTimer.current);
    };
  }, []);

  // Origin: snapped base position + continuous pan offset
  const baseOriginX = snapToDot(vp.w / 2 - BEZIER_UNIT_PX / 2);
  const baseOriginY = snapToDot(vp.h / 2 + BEZIER_UNIT_PX / 2);
  const originX = baseOriginX;
  const originY = baseOriginY + panOffsetPx;

  const toSx = (bx: number) => originX + bx * BEZIER_UNIT_PX;
  const toSy = (by: number) => originY - by * BEZIER_UNIT_PX;

  // ── Refs for stable event-handler closures ──────────────────────
  const curveRef        = useRef(curveValues);
  const originXRef      = useRef(originX);
  const originYRef      = useRef(originY);
  const panOffsetPxRef  = useRef(panOffsetPx);
  curveRef.current       = curveValues;
  originXRef.current     = originX;
  originYRef.current     = originY;
  panOffsetPxRef.current = panOffsetPx;

  const dragging = useRef<'p1' | 'p2' | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 }); // cursor-to-handle-center offset at mousedown
  const [topHandle, setTopHandle] = useState<'p1' | 'p2'>('p2'); // last-dragged handle renders on top
  const panning  = useRef(false);
  const lastPanY = useRef(0);
  const resettingPan = useRef(false);
  const resetAnim = useRef<any>(null);
  const dragCooldown = useRef(false);
  const cooldownTimer = useRef<number | null>(null);

  // ── Screen positions of all four bezier points ──────────────────
  const [x1, y1, x2, y2] = curveValues;
  const p0 = { x: toSx(0),  y: toSy(0)  };
  const p1 = { x: toSx(x1), y: toSy(y1) };
  const p2 = { x: toSx(x2), y: toSy(y2) };
  const p3 = { x: toSx(1),  y: toSy(1)  };

  // ── Handle drag start (stops propagation so SVG pan doesn't fire) ──
  const onHandleDown = useCallback((handle: 'p1' | 'p2') =>
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (resetAnim.current) {
        resetAnim.current.stop();
        resettingPan.current = false;
      }
      // Capture where inside the handle the user clicked so the handle
      // doesn't jump its center to the cursor on the first move.
      const [cx1, cy1, cx2, cy2] = curveRef.current;
      const ox = originXRef.current;
      const oy = originYRef.current;
      const hx = handle === 'p1' ? ox + cx1 * BEZIER_UNIT_PX : ox + cx2 * BEZIER_UNIT_PX;
      const hy = handle === 'p1' ? oy - cy1 * BEZIER_UNIT_PX : oy - cy2 * BEZIER_UNIT_PX;
      dragOffset.current = { x: e.clientX - hx, y: e.clientY - hy };

      dragging.current = handle;
      setTopHandle(handle);
      setActiveHandle(handle);
      document.body.classList.add('is-dragging-handle');
      document.body.style.userSelect = 'none';
    }, []);

  // ── SVG background down → start panning ────────────────────────
  const onSvgDown = useCallback((e: React.MouseEvent) => {
    if (dragging.current) return;       // handle drag has priority
    if (e.button !== 0 && e.button !== 2) return;
    e.preventDefault();
    if (resetAnim.current) {
      resetAnim.current.stop();
      resettingPan.current = false;
    }
    panning.current = true;
    lastPanY.current = e.clientY;
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, []);

  // ── Global mouse move / up ──────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragging.current) {
        // ── Handle drag ──
        const [cx1, cy1, cx2, cy2] = curveRef.current;
        const ox  = originXRef.current;
        const oy  = originYRef.current;
        const bx  = (e.clientX - dragOffset.current.x - ox) / BEZIER_UNIT_PX;
        const by  = (oy - (e.clientY - dragOffset.current.y)) / BEZIER_UNIT_PX;
        const snap = (v: number) => snapToGridRef.current ? Math.round(v / 0.1) * 0.1 : v;
        const clampedX = Math.max(0, Math.min(1, snap(bx)));
        const snappedY = snap(by);
        if (dragging.current === 'p1') setCurveValues([clampedX, snappedY, cx2, cy2]);
        else                           setCurveValues([cx1, cy1, clampedX, snappedY]);

      } else if (panning.current) {
        // ── Y-axis pan ──
        const delta  = (e.clientY - lastPanY.current) * 2; // pan twice as fast
        lastPanY.current = e.clientY;
        const next   = Math.min(PAN_MAX, Math.max(PAN_MIN, panOffsetPxRef.current + delta));
        panOffsetPxRef.current = next;
        setPanOffsetPx(next);
      }
    };

    const onUp = () => {
      if (dragging.current !== null || panning.current) {
        dragCooldown.current = true;
        if (cooldownTimer.current) window.clearTimeout(cooldownTimer.current);
        cooldownTimer.current = window.setTimeout(() => {
          dragCooldown.current = false;
        }, 500);
      }
      dragging.current = null;
      setActiveHandle(null);
      panning.current  = false;
      document.body.classList.remove('is-dragging-handle');
      document.body.style.cursor     = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
      if (cooldownTimer.current) window.clearTimeout(cooldownTimer.current);
    };
  }, [setCurveValues, setPanOffsetPx]);

  const isInteractiveMove = dragging.current !== null || panning.current || dragCooldown.current || resettingPan.current || resizing.current;
  const isSnapDragging = snapToGrid && activeHandle !== null;
  const animTransition = isSnapDragging
    ? { type: 'spring' as const, stiffness: 1200, damping: 40, mass: 0.3 }  // satisfying snap "click"
    : isInteractiveMove
    ? { duration: 0 }
    : { type: 'spring' as const, bounce: 0, duration: 0.6 };

  // ── Track last active handle for smooth fade-out ─────────────────
  const lastActiveHandle = useRef<'p1' | 'p2'>('p1');
  if (activeHandle) lastActiveHandle.current = activeHandle;
  const renderHandle = activeHandle || lastActiveHandle.current;

  // ── SVG paths ───────────────────────────────────────────────────
  const curvePath   = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;
  const handleLine1 = `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y}`;
  const handleLine2 = `M ${p3.x} ${p3.y} L ${p2.x} ${p2.y}`;

  const labelProgressX = (p0.x + p3.x) / 2;
  const labelProgressY = p0.y + 48;
  const labelTimeX     = p0.x - 52;
  const labelTimeY     = (p0.y + p3.y) / 2;

  // ── Viewport visibility ────────────────────────────────────────
  const isOffScreen = (sy: number) => sy < -20 || sy > vp.h + 20;
  const showReset   = isOffScreen(p0.y) && isOffScreen(p3.y);

  const resetPan = () => {
    resettingPan.current = true;
    if (resetAnim.current) resetAnim.current.stop();
    resetAnim.current = animate(panOffsetPxRef.current, 0, {
      type: 'spring',
      bounce: 0,
      duration: 0.6,
      onUpdate: (latest) => {
        panOffsetPxRef.current = latest;
        setPanOffsetPx(latest); // Updates coordinate state for path/circle/labels/canvas all at once
      },
      onComplete: () => {
        resettingPan.current = false;
      }
    });
  };

  return (
    <>
      <svg
        className="bezier-curve-overlay bezier-curve-overlay--pannable"
        aria-label="Bezier curve editor – drag to pan, drag handles to adjust curve"
        onMouseDown={onSvgDown}
        onContextMenu={e => e.preventDefault()}
      >
        {/* ── Handle guide lines (dashed) ── */}
        <motion.path d={handleLine1} stroke={CLR_HANDLE_LINE} strokeWidth={1.5} strokeDasharray="5 4" fill="none" animate={{ d: handleLine1 }} transition={animTransition} />
        <motion.path d={handleLine2} stroke={CLR_HANDLE_LINE} strokeWidth={1.5} strokeDasharray="5 4" fill="none" animate={{ d: handleLine2 }} transition={animTransition} />

        {/* ── Cubic bezier curve ── */}
        <motion.path d={curvePath} stroke={CLR_CURVE} strokeWidth={3.5} fill="none" strokeLinecap="round" animate={{ d: curvePath }} transition={animTransition} />

        {/* ── Fixed endpoint P0 (0,0) ── */}
        <motion.circle cx={p0.x} cy={p0.y} r={8} fill={CLR_ENDPOINT} style={{ filter: 'drop-shadow(0px 3px 8px rgba(0, 0, 0, 0.2))' }} animate={{ cx: p0.x, cy: p0.y }} transition={animTransition} />

        {/* ── Fixed endpoint P3 (1,1) ── */}
        <motion.circle cx={p3.x} cy={p3.y} r={8} fill={CLR_ENDPOINT} style={{ filter: 'drop-shadow(0px 3px 8px rgba(0, 0, 0, 0.2))' }} animate={{ cx: p3.x, cy: p3.y }} transition={animTransition} />

        {/* ── Draggable control handles — topHandle renders last (on top in SVG) ── */}
        {([topHandle === 'p2' ? 'p1' : 'p2', topHandle] as const).map(h => {
          const p  = h === 'p1' ? p1 : p2;
          return (
            <React.Fragment key={h}>
              <motion.circle
                cx={p.x} cy={p.y} r={12}
                fill="transparent" stroke={CLR_HANDLE} strokeWidth={2.5}
                className="bezier-handle"
                onMouseDown={onHandleDown(h)}
                onMouseEnter={() => setHoveredHandle(h)}
                onMouseLeave={() => setHoveredHandle(null)}
                aria-label={`Control point ${h === 'p1' ? 1 : 2} (drag to adjust)`}
                animate={{ cx: p.x, cy: p.y }}
                transition={animTransition}
              />
              <motion.circle
                cx={p.x} cy={p.y} r={3.5}
                fill={CLR_HANDLE}
                style={{ pointerEvents: 'none' }}
                animate={{ cx: p.x, cy: p.y }}
                transition={animTransition}
              />
            </React.Fragment>
          );
        })}

        {/* ── Drag value pill popup ── */}
        <motion.g
          className="bezier-value-pill"
          initial={{ opacity: 0 }}
          animate={{
            opacity: activeHandle ? 1 : 0,
            x: renderHandle === 'p1' ? p1.x : p2.x,
            y: renderHandle === 'p1' ? p1.y - 44 : p2.y - 44
          }}
          transition={{
            ...animTransition,
            opacity: { duration: 0.2 } // Keep opacity fade smooth
          }}
        >
          <rect
            className="bezier-value-pill__bg"
            x="-44" y="-13" width="88" height="26"
          />
          <text
            className="bezier-value-pill__text"
            x="-21" y="0"
          >
            {renderHandle === 'p1' ? x1.toFixed(2) : x2.toFixed(2)}
          </text>
          <line
            className="bezier-value-pill__separator"
            x1="0" y1="-5" x2="0" y2="5"
          />
          <text
            className="bezier-value-pill__text"
            x="21" y="0"
          >
            {renderHandle === 'p1' ? y1.toFixed(2) : y2.toFixed(2)}
          </text>
        </motion.g>

        {/* ── PROGRESS (X) axis label ── */}
        <text
          x={labelProgressX} y={labelProgressY}
          textAnchor="middle"
          fill={CLR_LABEL}
          fontSize="10" fontFamily="Inter, system-ui" fontWeight="700"
          letterSpacing="0.14em"
          style={{ pointerEvents: 'none' }}
        >
          PROGRESS (X)
        </text>

        {/* ── TIME (T) axis label – rotated 90° CCW ── */}
        <text
          x={labelTimeX} y={labelTimeY}
          textAnchor="middle"
          fill={CLR_LABEL}
          fontSize="10" fontFamily="Inter, system-ui" fontWeight="700"
          letterSpacing="0.14em"
          transform={`rotate(-90 ${labelTimeX} ${labelTimeY})`}
          style={{ pointerEvents: 'none' }}
        >
          TIME (T)
        </text>
      </svg>

      {/* ── Pan reset button – visible only when both endpoints are off-screen ── */}
      <button
        className={`pan-reset-btn ${showReset ? ' pan-reset-btn--visible' : ''} ${resetMorph.className}`}
        onClick={resetPan}
        title="Reset view to center"
        aria-label="Reset pan – bring curve back to center"
        {...resetMorph.handlers}
      >
        <CenterIcon />
        <span>Reset View</span>
      </button>
    </>
  );
};

export default BezierCurve;

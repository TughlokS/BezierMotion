import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { usePlayground } from '../../context/PlaygroundContext';
import { BEZIER_UNIT_PX, ZOOM_MIN, ZOOM_MAX, ZOOM_SENSITIVITY } from '../../constants';
import { computeView } from '../../utils/viewTransform';

// ─────────────────────────────────────────────
//  BezierCurve – interactive SVG overlay with pan + scroll-wheel zoom
//
//  Pan limits are expressed in bezier units and scale with zoom, so the
//  reachable travel stays constant regardless of zoom level:
//    Max up  : bezier Y=3 at screen centre → -2.5 units
//    Max down: bezier Y=-3 at screen centre → +3.5 units
// ─────────────────────────────────────────────

const PAN_UNITS_MIN = -2.5; // units – max pan up   (× unitPx at current zoom)
const PAN_UNITS_MAX =  3.5; // units – max pan down (× unitPx at current zoom)

// Universal horizontal pan (works at any zoom): allowed until the canvas is
// fully off-screen, detected by the opposite anchor reaching the far edge —
// pan right stops when P0 (0,0) hits the right edge (originX = w); pan left
// stops when P3 (1,1) hits the left edge (originX = -unitPx). Since
// originX = (w - unitPx)/2 + panX, that limit is ±(w + unitPx)/2.
const xPanLimit = (unitPx: number, w: number) => (unitPx + w) / 2;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Style tokens
const CLR_CURVE       = 'var(--color-brand-base)';
const CLR_ENDPOINT    = '#ffffff';
const CLR_HANDLE      = 'var(--color-brand-base)';
const CLR_HANDLE_LINE = 'var(--color-border-dark)';
const CLR_LABEL       = 'var(--color-text-muted)';

const BezierCurve: React.FC = () => {
  const {
    curveValues, setCurveValues,
    panOffsetPx, setPanOffsetPx,
    panOffsetXPx, setPanOffsetXPx,
    zoom, setZoom,
    isResettingView, cancelViewReset,
    snapToGrid, activeHandle, setActiveHandle, setHoveredHandle,
  } = usePlayground();
  const snapToGridRef = useRef(snapToGrid);
  snapToGridRef.current = snapToGrid;
  const svgRef = useRef<SVGSVGElement>(null);

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

  // Origin + scale: shared transform (pan on both axes, zoom scales unitPx)
  const { originX, originY, unitPx, toSx, toSy } = computeView({
    w: vp.w, h: vp.h, panX: panOffsetXPx, panY: panOffsetPx, zoom,
  });

  // ── Refs for stable event-handler closures ──────────────────────
  const curveRef        = useRef(curveValues);
  const originXRef      = useRef(originX);
  const originYRef      = useRef(originY);
  const unitPxRef       = useRef(unitPx);
  const panOffsetPxRef  = useRef(panOffsetPx);
  const panXRef         = useRef(panOffsetXPx);
  const zoomRef         = useRef(zoom);
  const vpRef           = useRef(vp);
  vpRef.current          = vp;
  curveRef.current       = curveValues;
  originXRef.current     = originX;
  originYRef.current     = originY;
  unitPxRef.current      = unitPx;
  panOffsetPxRef.current = panOffsetPx;
  panXRef.current        = panOffsetXPx;
  zoomRef.current        = zoom;

  const dragging = useRef<'p1' | 'p2' | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 }); // cursor-to-handle-center offset at mousedown
  const [topHandle, setTopHandle] = useState<'p1' | 'p2'>('p2'); // last-dragged handle renders on top
  const panning  = useRef(false);
  const lastPanY = useRef(0);
  const lastPanX = useRef(0);
  const dragCooldown = useRef(false);
  const cooldownTimer = useRef<number | null>(null);
  const zooming = useRef(false); // true briefly after a wheel tick → disables spring so zoom tracks instantly
  const zoomTimer = useRef<number | null>(null);

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
      cancelViewReset();
      // Capture where inside the handle the user clicked so the handle
      // doesn't jump its center to the cursor on the first move.
      const [cx1, cy1, cx2, cy2] = curveRef.current;
      const ox = originXRef.current;
      const oy = originYRef.current;
      const u  = unitPxRef.current;
      const hx = handle === 'p1' ? ox + cx1 * u : ox + cx2 * u;
      const hy = handle === 'p1' ? oy - cy1 * u : oy - cy2 * u;
      dragOffset.current = { x: e.clientX - hx, y: e.clientY - hy };

      dragging.current = handle;
      setTopHandle(handle);
      setActiveHandle(handle);
      document.body.classList.add('is-dragging-handle');
      document.body.style.userSelect = 'none';
    }, [cancelViewReset, setActiveHandle]);

  // ── SVG background down → start panning ────────────────────────
  const onSvgDown = useCallback((e: React.MouseEvent) => {
    if (dragging.current) return;       // handle drag has priority
    if (e.button !== 0 && e.button !== 2) return;
    e.preventDefault();
    cancelViewReset();
    panning.current = true;
    lastPanY.current = e.clientY;
    lastPanX.current = e.clientX;
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, [cancelViewReset]);

  // ── Global mouse move / up ──────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragging.current) {
        // ── Handle drag ──
        const [cx1, cy1, cx2, cy2] = curveRef.current;
        const ox  = originXRef.current;
        const oy  = originYRef.current;
        const u   = unitPxRef.current;
        const bx  = (e.clientX - dragOffset.current.x - ox) / u;
        const by  = (oy - (e.clientY - dragOffset.current.y)) / u;
        const snap = (v: number) => snapToGridRef.current ? Math.round(v / 0.1) * 0.1 : v;
        const clampedX = Math.max(0, Math.min(1, snap(bx)));
        const snappedY = snap(by);
        if (dragging.current === 'p1') setCurveValues([clampedX, snappedY, cx2, cy2]);
        else                           setCurveValues([cx1, cy1, clampedX, snappedY]);

      } else if (panning.current) {
        const u = unitPxRef.current;
        const w = vpRef.current.w;

        // ── X-axis pan (universal; stops when the canvas is fully off-screen) ──
        const dx = e.clientX - lastPanX.current;
        lastPanX.current = e.clientX;
        const xLim = xPanLimit(u, w);
        const nextX = clamp(panXRef.current + dx, -xLim, xLim);
        panXRef.current = nextX;
        setPanOffsetXPx(nextX);

        // ── Y-axis pan (2× speed; limits scale with zoom so travel stays constant) ──
        const dy = (e.clientY - lastPanY.current) * 2;
        lastPanY.current = e.clientY;
        const nextY = clamp(panOffsetPxRef.current + dy, PAN_UNITS_MIN * u, PAN_UNITS_MAX * u);
        panOffsetPxRef.current = nextY;
        setPanOffsetPx(nextY);
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

  // ── Scroll-wheel zoom (Y anchored at cursor, X stays centred) ───
  // Native non-passive listener so preventDefault() actually stops page zoom.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cancelViewReset();

      const s0 = zoomRef.current;
      const factor = Math.exp(-e.deltaY * ZOOM_SENSITIVITY); // multiplicative → perceptually linear
      const s1 = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, s0 * factor));
      if (s1 === s0) return; // already clamped at a limit

      const k = s1 / s0;
      const newUnitPx = BEZIER_UNIT_PX * s1;
      const w = vpRef.current.w;

      // Y: keep the world point under the cursor fixed (vertical focal zoom).
      const sy = e.clientY;
      const oy0 = originYRef.current;
      const baseY = oy0 - panOffsetPxRef.current; // = baseOriginY (Y is base + pan)
      const oy1 = sy - (sy - oy0) * k;
      const panY1 = clamp(oy1 - baseY, PAN_UNITS_MIN * newUnitPx, PAN_UNITS_MAX * newUnitPx);

      // X: no cursor drift — the box is centred by construction (panX = 0 stays
      // centred through zoom). Preserve any manual pan, re-clamped to the new
      // zoom's allowed range.
      const panX1 = clamp(panXRef.current, -xPanLimit(newUnitPx, w), xPanLimit(newUnitPx, w));

      setZoom(s1);
      setPanOffsetXPx(panX1);
      setPanOffsetPx(panY1);

      // Disable the spring while actively zooming so the curve tracks instantly.
      zooming.current = true;
      if (zoomTimer.current) window.clearTimeout(zoomTimer.current);
      zoomTimer.current = window.setTimeout(() => { zooming.current = false; }, 150);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (zoomTimer.current) window.clearTimeout(zoomTimer.current);
    };
  }, [setZoom, setPanOffsetXPx, setPanOffsetPx, cancelViewReset]);

  const isInteractiveMove = dragging.current !== null || panning.current || dragCooldown.current || isResettingView || resizing.current || zooming.current;
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

  return (
    <>
      <svg
        ref={svgRef}
        className="bezier-curve-overlay bezier-curve-overlay--pannable"
        aria-label="Bezier curve editor – drag to pan, scroll to zoom, drag handles to adjust curve"
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
    </>
  );
};

export default BezierCurve;

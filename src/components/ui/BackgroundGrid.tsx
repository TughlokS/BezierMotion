import React, { useEffect, useRef } from 'react';
import { usePlayground } from '../../context/PlaygroundContext';
import { computeView } from '../../utils/viewTransform';

// ─────────────────────────────────────────────
//  BackgroundGrid – canvas dot grid with cursor proximity effect
//
//  Dot spacing scales with zoom (dotPx) so the grid expands/contracts
//  with the coordinate space, but each dot's rendered radius stays a
//  constant DOT_BASE_R (scale-invariant). Dots grow up to
//  MAX_MULTIPLIER × near the cursor (cosine falloff over EFFECT_RADIUS).
// ─────────────────────────────────────────────

const DOT_BASE_R     = 1.5;
const EFFECT_RADIUS  = 140; // px – how far the ripple reaches (screen-space, zoom-independent)
const MAX_MULTIPLIER = 2;   // centre dot grows to 2× base size

const BackgroundGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse     = useRef({ x: -9999, y: -9999 });
  const raf       = useRef<number>(0);
  // Receive transform state without re-mounting the draw loop.
  const panRef    = useRef(0);
  const panXRef   = useRef(0);
  const zoomRef   = useRef(1);

  const { panOffsetPx, panOffsetXPx, zoom } = usePlayground();
  panRef.current  = panOffsetPx;
  panXRef.current = panOffsetXPx;
  zoomRef.current = zoom;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;

    /* Match canvas resolution to viewport */
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    /* Track cursor; hide effect when cursor leaves window */
    const onMove  = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = ()               => { mouse.current = { x: -9999,    y: -9999    }; };
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);

    /* Draw loop */
    const draw = () => {
      const { width: w, height: h } = canvas;
      const { x: mx, y: my }        = mouse.current;

      // Extract current theme colors from standard CSS variables
      const rootStyles = getComputedStyle(document.documentElement);
      const bgColor = rootStyles.getPropertyValue('--color-bg-subtle').trim() || '#f5f5fb';
      const dotColor = rootStyles.getPropertyValue('--color-border-dark').trim() || '#ddceddff';

      /* Background fill */
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);

      /* Shared world→screen transform (pan on both axes + zoom scale) */
      const { originX, originY, unitPx, dotPx } = computeView({
        w, h, panX: panXRef.current, panY: panRef.current, zoom: zoomRef.current,
      });

      /* Axes lines from anchored control points (P0 and P3) */
      const p0x = originX;
      const p0y = originY;
      const p3x = originX + unitPx;
      const p3y = originY - unitPx;

      ctx.beginPath();
      // P0 Horizontal and Vertical
      ctx.moveTo(0, p0y);
      ctx.lineTo(w, p0y);
      ctx.moveTo(p0x, 0);
      ctx.lineTo(p0x, h);
      
      // P3 Horizontal and Vertical
      ctx.moveTo(0, p3y);
      ctx.lineTo(w, p3y);
      ctx.moveTo(p3x, 0);
      ctx.lineTo(p3x, h);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      // Slightly lighter than background, but not fully white
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'; 
      ctx.lineWidth = 4;
      ctx.stroke();

      /* Dots – spacing = dotPx (zoom-scaled); phase aligns a dot to the
         origin on both axes so the grid tracks the bezier graph. Radius
         stays constant (scale-invariant). */
      ctx.fillStyle = dotColor;
      const xPhase = ((originX % dotPx) + dotPx) % dotPx;
      const yPhase = ((originY % dotPx) + dotPx) % dotPx;
      for (let cx = xPhase; cx < w + dotPx; cx += dotPx) {
        for (let cy = yPhase; cy < h + dotPx; cy += dotPx) {
          const dist = Math.hypot(cx - mx, cy - my);

          let r = DOT_BASE_R;
          if (dist < EFFECT_RADIUS) {
            /* Cosine falloff: 1 at centre → 0 at edge */
            const t     = dist / EFFECT_RADIUS;
            const wave  = (Math.cos(t * Math.PI) + 1) / 2;
            r = DOT_BASE_R * (1 + wave * (MAX_MULTIPLIER - 1));
          }

          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="background-grid"
      aria-hidden="true"
    />
  );
};

export default BackgroundGrid;


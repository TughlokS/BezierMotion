import React, { useEffect, useRef } from 'react';
import { DOT_SPACING, BEZIER_UNIT_PX } from '../../constants';
import { usePlayground } from '../../context/PlaygroundContext';

// ─────────────────────────────────────────────
//  BackgroundGrid – canvas dot grid with cursor proximity effect
//
//  Each dot spacing = 0.1 bezier units (DOT_SPACING = 40 px).
//  Each dot scales up to MAX_MULTIPLIER × its base radius when the
//  cursor is directly over it, falling back to normal size at
//  EFFECT_RADIUS px away (cosine easing for a smooth wave).
// ─────────────────────────────────────────────

const DOT_BASE_R     = 1.5;
const EFFECT_RADIUS  = 140; // px – how far the ripple reaches
const MAX_MULTIPLIER = 2;   // centre dot grows to 2× base size

const snapToDot = (v: number): number => {
  const phase = DOT_SPACING / 2;
  return phase + DOT_SPACING * Math.round((v - phase) / DOT_SPACING);
};

const BackgroundGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse     = useRef({ x: -9999, y: -9999 });
  const raf       = useRef<number>(0);
  const panRef    = useRef(0); // receives panOffsetPx without re-mounting effect

  const { panOffsetPx } = usePlayground();
  panRef.current = panOffsetPx;

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

      /* Axes lines from anchored control points (P0 and P3) */
      const baseOriginX = snapToDot(w / 2 - BEZIER_UNIT_PX / 2);
      const baseOriginY = snapToDot(h / 2 + BEZIER_UNIT_PX / 2);
      const originX = baseOriginX;
      const originY = baseOriginY + panRef.current;

      const p0x = originX;
      const p0y = originY;
      const p3x = originX + BEZIER_UNIT_PX;
      const p3y = originY - BEZIER_UNIT_PX;

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

      /* Dots – y phase shifts with pan so grid tracks the bezier graph */
      ctx.fillStyle = dotColor;
      const yPhase = ((DOT_SPACING / 2 + panRef.current) % DOT_SPACING + DOT_SPACING) % DOT_SPACING;
      for (let cx = DOT_SPACING / 2; cx < w + DOT_SPACING; cx += DOT_SPACING) {
        for (let cy = yPhase; cy < h + DOT_SPACING; cy += DOT_SPACING) {
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


import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import './DraggablePanel.css';

// ─────────────────────────────────────────────────────────
//  DraggablePanel – wraps any panel with a drag-handle line
//  at the top-center. Users drag from that area to reposition
//  the panel. If dropped within SNAP_RADIUS of origin it
//  springs back. Position resets on resize / reload.
// ─────────────────────────────────────────────────────────

const SNAP_RADIUS = 60; // px – distance from (0,0) that triggers snap-back

interface Props {
  /** Stable id used for the wrapper element */
  id: string;
  children: React.ReactNode;
  /** Extra class name(s) forwarded to the wrapper div */
  className?: string;
  /** When true, adds translateY(-50%) so the panel is vertically centered
   *  at its CSS top value (used for the presets panel). */
  centerY?: boolean;
}

const DraggablePanel: React.FC<Props> = ({ id, children, className = '', centerY = false }) => {
  // Current translate offset from the panel's natural CSS position
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [isNearSnap, setIsNearSnap] = useState(false);

  // ghost rect – HOME position in viewport (computed by subtracting current offset)
  const [ghostRect, setGhostRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // Refs used inside event-handler closures
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragStartMouseRef = useRef({ x: 0, y: 0 });
  const dragStartOffsetRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  // Home rect (viewport position at offset 0,0), captured once at mousedown.
  // Used for boundary clamping so the math never reads the live, already-
  // offset rect each frame (which would create a feedback loop / jitter).
  const homeRectRef = useRef({ top: 0, left: 0, width: 0, height: 0 });
  // Tracks whether the panel has ever left the snap zone during this drag;
  // prevents the ghost glow from firing the instant the user picks up the panel.
  const hasLeftSnapZoneRef = useRef(false);

  // ── Reset offset on window resize ───────────────────────
  useEffect(() => {
    const handleResize = () => {
      setOffset({ x: 0, y: 0 });
      setGhostRect(null);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Mousedown on the drag handle ────────────────────────
  const handleHandleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (!wrapperRef.current) return;

      // Compute the HOME position (where the panel sits at offset 0,0)
      // by subtracting the current offset from the measured rect.
      const rect = wrapperRef.current.getBoundingClientRect();
      const home = {
        top: rect.top - offset.y,
        left: rect.left - offset.x,
        width: rect.width,
        height: rect.height,
      };
      setGhostRect(home);
      homeRectRef.current = home;

      dragStartMouseRef.current = { x: e.clientX, y: e.clientY };
      dragStartOffsetRef.current = { ...offset };
      isDraggingRef.current = true;
      hasLeftSnapZoneRef.current = false;

      setIsDragging(true);
      setIsSettling(false);
      setIsNearSnap(false);
    },
    [offset],
  );

  // ── Global mousemove / mouseup during drag ───────────────
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const dx = e.clientX - dragStartMouseRef.current.x;
      const dy = e.clientY - dragStartMouseRef.current.y;

      const rawX = dragStartOffsetRef.current.x + dx;
      const rawY = dragStartOffsetRef.current.y + dy;

      // Predict the panel's edges from the STABLE home rect (captured at
      // mousedown) plus the proposed offset — never from the live rect,
      // which already includes the previous frame's offset.
      const home = homeRectRef.current;
      const predLeft   = home.left + rawX;
      const predRight  = home.left + home.width + rawX;
      const predTop    = home.top + rawY;
      const predBottom = home.top + home.height + rawY;

      // Clamp so at least 60px of the panel stays on-screen
      const VW = window.innerWidth;
      const VH = window.innerHeight;
      let clampedX = rawX;
      let clampedY = rawY;

      if (predLeft < -home.width + 60)
        clampedX = rawX - (predLeft - (-home.width + 60));
      else if (predRight > VW + home.width - 60)
        clampedX = rawX - (predRight - (VW + home.width - 60));
      if (predTop < -home.height + 60)
        clampedY = rawY - (predTop - (-home.height + 60));
      else if (predBottom > VH + home.height - 60)
        clampedY = rawY - (predBottom - (VH + home.height - 60));

      setOffset({ x: clampedX, y: clampedY });

      const dist = Math.sqrt(clampedX * clampedX + clampedY * clampedY);
      if (dist >= SNAP_RADIUS) hasLeftSnapZoneRef.current = true;
      setIsNearSnap(hasLeftSnapZoneRef.current && dist < SNAP_RADIUS);
    };

    const handleMouseUp = (e: MouseEvent) => {
      isDraggingRef.current = false;
      setIsDragging(false);
      setGhostRect(null);
      setIsNearSnap(false);

      const dx = e.clientX - dragStartMouseRef.current.x;
      const dy = e.clientY - dragStartMouseRef.current.y;
      const finalX = dragStartOffsetRef.current.x + dx;
      const finalY = dragStartOffsetRef.current.y + dy;

      const dist = Math.sqrt(finalX * finalX + finalY * finalY);

      if (dist > 0 && dist < SNAP_RADIUS) {
        // Snap back to origin with spring animation
        setIsSettling(true);
        setOffset({ x: 0, y: 0 });
        setTimeout(() => setIsSettling(false), 400);
      }
      // else: keep wherever it was dropped
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // ── Class list ──────────────────────────────────────────
  const classList = [
    'draggable-panel',
    className,
    isDragging ? 'draggable-panel--dragging' : '',
    isSettling ? 'draggable-panel--settling' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {/* Ghost outline rendered at original position while dragging */}
      {isDragging && ghostRect && (
        <div
          className={`drag-ghost${isNearSnap ? ' drag-ghost--near-snap' : ''}`}
          style={{
            top: ghostRect.top,
            left: ghostRect.left,
            width: ghostRect.width,
            height: ghostRect.height,
          }}
          aria-hidden="true"
        />
      )}

      <div
        ref={wrapperRef}
        id={`draggable-${id}`}
        className={classList}
        style={{
          transform: centerY
            ? `translateY(-50%) translate(${offset.x}px, ${offset.y}px)`
            : `translate(${offset.x}px, ${offset.y}px)`,
        }}
      >
        {/* Drag handle – only this area initiates dragging */}
        <div
          className="drag-handle"
          onMouseDown={handleHandleMouseDown}
          role="presentation"
          aria-hidden="true"
        >
          <div className="drag-handle__line" />
        </div>

        {/* Panel content – pointer-events disabled during drag to prevent
            accidental clicks on inputs / buttons */}
        <div
          className="draggable-panel__content"
          style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
        >
          {children}
        </div>
      </div>
    </>
  );
};

export default DraggablePanel;

import React from 'react';

// ─────────────────────────────────────────────
//  ScalePanel – circle that grows/shrinks based on scale value
// ─────────────────────────────────────────────

const ScaleIcon: React.FC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

// No max cap – overshoot curves let the circle grow beyond the box (clipped by overflow:hidden)
const BASE_SIZE = 140;

const ScalePanel: React.FC = () => {
  // --anim-scale is written to :root by useAnimationEngine (range 0.2–1.0)
  return (
    <div className="anim-panel" id="scale-panel">
      <div className="anim-panel__header">
        <span className="anim-panel__label">SCALE</span>
        <span className="anim-panel__icon"><ScaleIcon /></span>
      </div>
      <div className="anim-panel__body">
        <div className="scale-box">
          <div
            className="scale-box__circle"
            style={{
              width:  `calc(var(--anim-scale, 1) * ${BASE_SIZE}px)`,
              height: `calc(var(--anim-scale, 1) * ${BASE_SIZE}px)`,
            }}
            aria-label="Scale animation preview"
          />
        </div>
      </div>
    </div>
  );
};

export default ScalePanel;

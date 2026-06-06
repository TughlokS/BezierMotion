import React from 'react';

// ─────────────────────────────────────────────
//  OpacityPanel – pill whose opacity mirrors context value
// ─────────────────────────────────────────────

const DropletIcon: React.FC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

const OpacityPanel: React.FC = () => {
  // --anim-opacity is written to :root by useAnimationEngine (range 0–1)
  return (
    <div className="anim-panel" id="opacity-panel">
      <div className="anim-panel__header">
        <span className="anim-panel__label">OPACITY</span>
        <span className="anim-panel__icon"><DropletIcon /></span>
      </div>
      <div className="anim-panel__body">
        <div className="opacity-track">
          <div
            className="opacity-track__pill"
            style={{ opacity: 'var(--anim-opacity, 1)' as unknown as number }}
            aria-label="Opacity animation preview"
          />
        </div>
      </div>
    </div>
  );
};

export default OpacityPanel;

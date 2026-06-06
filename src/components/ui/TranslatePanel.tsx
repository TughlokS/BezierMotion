import React from 'react';

// ─────────────────────────────────────────────
//  TranslatePanel – shows pill indicator sliding in a track
// ─────────────────────────────────────────────

const TrendIcon: React.FC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const TranslatePanel: React.FC = () => {
  // --anim-translate-x is written directly to :root by useAnimationEngine
  return (
    <div className="anim-panel" id="translate-panel">
      <div className="anim-panel__header">
        <span className="anim-panel__label">TRANSLATE X</span>
        <span className="anim-panel__icon"><TrendIcon /></span>
      </div>
      <div className="anim-panel__body">
        <div className="translate-track">
          <div className="translate-track__indicator" />
        </div>
      </div>
    </div>
  );
};

export default TranslatePanel;

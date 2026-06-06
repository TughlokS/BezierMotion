import React from 'react';
import { usePlayground } from '../../context/PlaygroundContext';

// ─────────────────────────────────────────────
//  TopControls – bottom bar 3-icon button panel
// ─────────────────────────────────────────────

const GridLockIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="3" y="3" width="8" height="8" rx="2" />
    <rect x="13" y="3" width="8" height="8" rx="2" />
    <rect x="3" y="13" width="8" height="8" rx="2" />
    {/* Solid lock icon in the bottom right cell */}
    <path d="M17 12c-1.1 0-2 .9-2 2v2h-1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1h-1v-2c0-1.1-.9-2-2-2zm0 2c.55 0 1 .45 1 1v1h-2v-1c0-.55.45-1 1-1z" />
  </svg>
);

const InfoIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </svg>
);

const SettingsIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
  </svg>
);

const TopControls: React.FC = () => {
  const { snapToGrid, setSnapToGrid } = usePlayground();

  return (
    <div className="top-controls" role="toolbar" aria-label="View controls">
      {/* Snap to grid — toggleable */}
      <button
        className={`top-controls__btn ${snapToGrid ? 'top-controls__btn--active' : ''}`}
        aria-label="Snap to grid"
        aria-pressed={snapToGrid}
        title="Snap to grid (0.1 units)"
        onClick={() => setSnapToGrid(!snapToGrid)}
      >
        <GridLockIcon />
      </button>

      <div className="top-controls__divider" aria-hidden="true" />

      <button
        className="top-controls__btn"
        aria-label="Info"
        title="Info"
        onClick={() => { /* TODO */ }}
      >
        <InfoIcon />
      </button>

      <div className="top-controls__divider" aria-hidden="true" />

      <button
        className="top-controls__btn"
        aria-label="Settings"
        title="Settings"
        onClick={() => { /* TODO */ }}
      >
        <SettingsIcon />
      </button>
    </div>
  );
};

export default TopControls;

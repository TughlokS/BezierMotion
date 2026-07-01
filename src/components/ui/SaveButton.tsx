import React from 'react';
import { usePlayground } from '../../context/PlaygroundContext';
import { useMorphHover } from '../../hooks/useMorphHover';

// ─────────────────────────────────────────────
//  SaveButton – standalone bottom-bar action that
//  saves the current curve as a new preset. Icon-only,
//  brand-filled, with the shared morph-hover effect.
// ─────────────────────────────────────────────

const SaveIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const SaveButton: React.FC = () => {
  const { saveCustomPreset } = usePlayground();
  const saveMorph = useMorphHover();

  return (
    <button
      className={`save-preset-btn ${saveMorph.className}`}
      onClick={saveCustomPreset}
      id="save-custom-preset"
      aria-label="Save current curve as a preset"
      title="Save as preset"
      {...saveMorph.handlers}
    >
      <SaveIcon />
    </button>
  );
};

export default SaveButton;

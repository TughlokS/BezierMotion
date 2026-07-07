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
  const { presets, curveValues, saveCustomPreset } = usePlayground();
  const saveMorph = useMorphHover();

  const isDuplicate = presets.some(p => 
    Math.abs(p.bezierValue.cp1.X - curveValues[0]) < 1e-4 &&
    Math.abs(p.bezierValue.cp1.Y - curveValues[1]) < 1e-4 &&
    Math.abs(p.bezierValue.cp2.X - curveValues[2]) < 1e-4 &&
    Math.abs(p.bezierValue.cp2.Y - curveValues[3]) < 1e-4
  );

  return (
    <button
      className={`save-preset-btn ${isDuplicate ? 'save-preset-btn--disabled' : saveMorph.className}`}
      onClick={isDuplicate ? undefined : saveCustomPreset}
      disabled={isDuplicate}
      id="save-custom-preset"
      aria-label={isDuplicate ? "Preset with these values already exists" : "Save current curve as a preset"}
      title={isDuplicate ? "Preset with these values already exists" : "Save as preset"}
      {...(isDuplicate ? {} : saveMorph.handlers)}
    >
      <SaveIcon />
    </button>
  );
};

export default SaveButton;

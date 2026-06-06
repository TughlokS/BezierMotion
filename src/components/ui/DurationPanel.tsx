import React, { useRef, useState } from 'react';
import { usePlayground } from '../../context/PlaygroundContext';

// ─────────────────────────────────────────────
//  DurationPanel – range slider 0.1 → 10 s, with editable pill value
// ─────────────────────────────────────────────

const MIN = 0.1;
const MAX = 10;

const DurationPanel: React.FC = () => {
  const { duration, setDuration } = usePlayground();
  const [editing, setEditing] = useState(false);
  const [rawInput, setRawInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // % fill for the slider track
  const fillPct = ((duration - MIN) / (MAX - MIN)) * 100;

  /* ── Slider ── */
  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(parseFloat(e.target.value));
  };

  /* ── Editable pill ── */
  const startEdit = () => {
    setRawInput(duration.toFixed(1));
    setEditing(true);
    // focus after render
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    const parsed = parseFloat(rawInput);
    if (!isNaN(parsed)) {
      setDuration(Math.min(MAX, Math.max(MIN, parsed)));
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') setEditing(false);
  };

  return (
    <div className="anim-panel" id="duration-panel">
      <div className="anim-panel__header">
        <span className="anim-panel__label">DURATION</span>

        {/* Editable seconds pill */}
        {editing ? (
          <input
            ref={inputRef}
            className="duration-pill duration-pill--editing"
            type="number"
            min={MIN}
            max={MAX}
            step={0.1}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <button
            className="duration-pill"
            onClick={startEdit}
            title="Click to edit duration"
          >
            {duration.toFixed(1)}s
          </button>
        )}
      </div>

      {/* Slider */}
      <div className="duration-slider-wrap">
        <input
          className="duration-slider"
          type="range"
          min={MIN}
          max={MAX}
          step={0.1}
          value={duration}
          onChange={handleSlider}
          style={{ '--fill-pct': `${fillPct}%` } as React.CSSProperties}
          aria-label="Animation duration"
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={duration}
        />
      </div>
    </div>
  );
};

export default DurationPanel;

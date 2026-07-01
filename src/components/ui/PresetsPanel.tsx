import React, { useRef, useEffect, useState } from 'react';
import { usePlayground } from '../../context/PlaygroundContext';
import type { BezierCP, Preset } from '../../context/PlaygroundContext';

// ─────────────────────────────────────────────
//  PresetsPanel – left floating panel
// ─────────────────────────────────────────────

// ── Mini curve icon ────────────────────────────
const PAD = 0.1;
const BASE_STROKE = 0.13;

const getCurveYBounds = (cp1: BezierCP, cp2: BezierCP): { minY: number; maxY: number } => {
  let minY = 0, maxY = 1;
  const N = 80;
  for (let i = 0; i <= N; i++) {
    const t  = i / N;
    const mt = 1 - t;
    const y = 3 * mt * mt * t * cp1.Y + 3 * mt * t * t * cp2.Y + t * t * t;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minY, maxY };
};

export const MiniCurveIcon: React.FC<{ cp1: BezierCP; cp2: BezierCP; className?: string }> = ({
  cp1, cp2, className = ''
}) => {
  const { minY: minBY, maxY: maxBY } = getCurveYBounds(cp1, cp2);
  const rangeY = maxBY - minBY;

  const vbLeft   = -PAD;
  const vbTop    = (1 - maxBY) - PAD;
  const vbWidth  = 1 + 2 * PAD;
  const vbHeight = rangeY + 2 * PAD;

  const baseHeight = 1 + 2 * PAD;
  const strokeWidth = BASE_STROKE * (vbHeight / baseHeight);

  const path = [
    `M 0 1`,
    `C ${cp1.X} ${1 - cp1.Y}`,
    `  ${cp2.X} ${1 - cp2.Y}`,
    `  1 0`,
  ].join(' ');

  const viewBox = `${vbLeft} ${vbTop} ${vbWidth} ${vbHeight}`;

  return (
    <svg
      className={`preset-icon ${className}`}
      viewBox={viewBox}
      overflow="visible"
      aria-hidden="true"
    >
      <path
        d={path}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Hollow anchor points */}
      <circle cx="0" cy="1" r={strokeWidth * 1.0} fill="var(--color-bg-base)" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="1" cy="0" r={strokeWidth * 1.0} fill="var(--color-bg-base)" stroke="currentColor" strokeWidth={strokeWidth} />
    </svg>
  );
};

// ── Format helper ──────────────────────────────
const fmt = (n: number) => parseFloat(n.toFixed(2)).toString();

// ── Preset Item ────────────────────────────────
const PresetItemRow: React.FC<{
  preset: Preset;
  active: boolean;
  onSelect: () => void;
  itemRef: React.RefCallback<HTMLButtonElement>;
}> = ({ preset, active, onSelect, itemRef }) => {
  const { cp1, cp2 } = preset.bezierValue;
  const valStr = `${fmt(cp1.X)}, ${fmt(cp1.Y)}, ${fmt(cp2.X)}, ${fmt(cp2.Y)}`;

  return (
    <button
      ref={itemRef}
      className={`preset-item ${active ? 'preset-item--active' : ''}`}
      onClick={onSelect}
    >
      <MiniCurveIcon cp1={cp1} cp2={cp2} />
      <span className="preset-item__text">
        <span className="preset-item__name">{preset.title}</span>
        <span className="preset-item__values">{valStr}</span>
      </span>
    </button>
  );
};

// ── Panel ──────────────────────────────────────
const PresetsPanel: React.FC = () => {
  const { presets, selectedPresetId, selectPreset } = usePlayground();

  // Refs for the list container and each item button
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Sliding pill state: top offset + height (relative to list container)
  const [pill, setPill] = useState<{ top: number; height: number } | null>(null);
  const [pillReady, setPillReady] = useState(false);

  useEffect(() => {
    if (!selectedPresetId) return;
    const listEl = listRef.current;
    const itemEl = itemRefs.current.get(selectedPresetId);
    if (!listEl || !itemEl) return;

    const listRect = listEl.getBoundingClientRect();
    const itemRect = itemEl.getBoundingClientRect();

    // Position relative to the list container (accounting for scroll)
    const top = itemRect.top - listRect.top + listEl.scrollTop;
    const height = itemRect.height;

    setPill({ top, height });
    // On first mount show it instantly (no transition), then enable sliding
    requestAnimationFrame(() => setPillReady(true));
  }, [selectedPresetId]);

  return (
    <div className="presets-panel" onContextMenu={(e) => e.preventDefault()}>
      <div className="presets-panel__header">
        <span className="presets-panel__title">PRESETS</span>
      </div>

      <div className="presets-panel__list" ref={listRef}>
        {/* Sliding pill indicator */}
        {pill && (
          <div
            className="presets-panel__pill"
            style={{
              top: pill.top,
              height: pill.height,
              transition: pillReady ? 'top 0.35s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            }}
          />
        )}

        {presets.map((preset) => (
          <PresetItemRow
            key={preset.id}
            preset={preset}
            active={selectedPresetId === preset.id}
            onSelect={() => selectPreset(preset.id)}
            itemRef={(el) => {
              if (el) itemRefs.current.set(preset.id, el);
              else itemRefs.current.delete(preset.id);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PresetsPanel;

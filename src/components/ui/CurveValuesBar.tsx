import React, { useState, useEffect, useCallback } from 'react';
import { usePlayground } from '../../context/PlaygroundContext';

// ─────────────────────────────────────────────
//  EditableCurveValue – local state handler for inputs
// ─────────────────────────────────────────────

interface EditableCurveValueProps {
  val: number;
  index: number;
  isActive: boolean;
  onCommit: (index: number, newVal: number) => void;
}

const EditableCurveValue: React.FC<EditableCurveValueProps> = ({ val, index, isActive, onCommit }) => {
  const [localStr, setLocalStr] = useState(val.toFixed(2));

  // Sync down if external value changes (like when handles are dragged)
  useEffect(() => {
    setLocalStr(val.toFixed(2));
  }, [val]);

  const handleCommit = () => {
    const parsed = parseFloat(localStr);
    if (!isNaN(parsed)) {
      onCommit(index, parsed);
    } else {
      setLocalStr(val.toFixed(2)); // Revert if invalid
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="curve-value-box">
      <input
        className={`curve-value-box__input ${isActive ? 'curve-value-box__input--is-dragged' : ''}`}
        type="text"
        value={localStr}
        onChange={(e) => setLocalStr(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={onKeyDown}
        placeholder="0.00"
        aria-label={`Bezier curve value ${index + 1}`}
      />
    </div>
  );
};

// ─────────────────────────────────────────────
//  CurveValuesBar – editable display of the 4 bezier values + copy button
// ─────────────────────────────────────────────

const CurveValuesBar: React.FC = () => {
  const { curveValues, setCurveValues, activeHandle, hoveredHandle } = usePlayground();
  const [copied, setCopied] = useState(false);

  const handleValueCommit = (index: number, rawVal: number) => {
    const isX = index === 0 || index === 2;
    // Clamp constraints: X must be [0, 1], Y must be [-10, 10]
    let clamped = rawVal;
    if (isX) {
      clamped = Math.max(0, Math.min(1, rawVal));
    } else {
      clamped = Math.max(-10, Math.min(10, rawVal));
    }

    // Only update context if array actually changes to prevent needless re-renders
    if (curveValues[index] !== clamped) {
      const newValues = [...curveValues] as [number, number, number, number];
      newValues[index] = clamped;
      setCurveValues(newValues);
    }
  };

  const handleCopy = useCallback(async () => {
    const [x1, y1, x2, y2] = curveValues.map(v => parseFloat(v.toFixed(2)));
    const text = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for browsers that block clipboard API
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [curveValues]);

  return (
    <div className="curve-values-bar" aria-label="Bezier curve values editor">
      {curveValues.map((val, i) => {
        const isActiveContext =
          ((activeHandle === 'p1' || hoveredHandle === 'p1') && (i === 0 || i === 1)) ||
          ((activeHandle === 'p2' || hoveredHandle === 'p2') && (i === 2 || i === 3));

        return (
          <EditableCurveValue
            key={i}
            index={i}
            val={val}
            isActive={isActiveContext}
            onCommit={handleValueCommit}
          />
        );
      })}

      {/* Divider between values and copy button */}
      <div className="curve-values-bar__divider" aria-hidden="true" />

      {/* Copy cubic-bezier() to clipboard */}
      <button
        className={`curve-values-bar__copy-btn ${copied ? 'curve-values-bar__copy-btn--copied' : ''}`}
        onClick={handleCopy}
        title={copied ? 'Copied!' : 'Copy cubic-bezier() value'}
        aria-label="Copy cubic-bezier value to clipboard"
      >
        {copied ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default CurveValuesBar;

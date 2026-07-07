import React, { useState, useRef, useEffect } from 'react';
import { usePlayground } from '../../context/PlaygroundContext';
import { SettingsRow } from './SettingsRow';
import { formatBezier } from '../../utils/formatBezier';
import type { CopyFormat } from '../../types/settings';

const FORMAT_LABELS: Record<CopyFormat, string> = {
  css: 'CSS',
  plaintext: 'Plaintext',
  float: 'Float',
  space: 'Space-separated',
  array: 'Array'
};

export const ExportSettingsPanel: React.FC = () => {
  const { copyFormat, setCopyFormat, noSpaces, setNoSpaces, curveValues } = usePlayground();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handleListboxKeyDown = (e: React.KeyboardEvent, format: CopyFormat) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setCopyFormat(format);
      setIsOpen(false);
    }
  };

  const isSpaceFormat = copyFormat === 'space';
  const previewText = formatBezier(curveValues, copyFormat, noSpaces);

  return (
    <div className="theme-settings-panel">
      <h1 className="theme-settings-panel__title">Export</h1>
      
      <div className="theme-settings-panel__body">
        <div className="theme-settings-panel__section">
          <h2 className="theme-settings-panel__section-header">Copy Format</h2>

          <SettingsRow title="Copy Format" description="Select the preferred layout schema of copied vectors.">
            <div className="copy-format-dropdown" ref={dropdownRef}>
              <button
                type="button"
                className="copy-format-dropdown__btn"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
              >
                {FORMAT_LABELS[copyFormat]}
                <span className={`chevron-icon ${isOpen ? 'is-open' : ''}`}>▾</span>
              </button>

              {isOpen && (
                <div className="copy-format-dropdown__popover" role="listbox">
                  {(Object.keys(FORMAT_LABELS) as CopyFormat[]).map((format) => (
                    <div
                      key={format}
                      role="option"
                      tabIndex={0}
                      aria-selected={copyFormat === format}
                      className={`copy-format-dropdown__option ${copyFormat === format ? 'is-selected' : ''}`}
                      onClick={() => { setCopyFormat(format); setIsOpen(false); }}
                      onKeyDown={(e) => handleListboxKeyDown(e, format)}
                    >
                      {FORMAT_LABELS[format]}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SettingsRow>

          <SettingsRow title="No spaces between values" description="Remove padding trailing commas. Automatically locked when utilizing space parameters.">
            <label className={`theme-checkbox-container ${isSpaceFormat ? 'is-disabled' : ''}`}>
              <input
                type="checkbox"
                className="theme-checkbox-input"
                checked={isSpaceFormat ? false : noSpaces}
                disabled={isSpaceFormat}
                onChange={(e) => setNoSpaces(e.target.checked)}
              />
              <div className="theme-checkbox-box">
                <svg className="theme-checkbox-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </label>
          </SettingsRow>

          <div className="export-preview-box">
            <span className="export-preview-box__title">Preview</span>
            <div className="export-preview-box__code">
              {previewText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

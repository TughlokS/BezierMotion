import React, { useState, useRef, useEffect } from 'react';
import { usePlayground } from '../../context/PlaygroundContext';
import { SettingsRow } from './SettingsRow';
import { formatBezier } from '../../utils/formatBezier';
import type { CopyFormat } from '../../types/settings';

const SNAP_STEPS = [0.5, 0.25, 0.1, 0.05, 0.025];

const FORMAT_LABELS: Record<CopyFormat, string> = {
  css: 'CSS',
  plaintext: 'Plaintext',
  float: 'Float',
  space: 'Space-separated',
  array: 'Array',
  custom: 'Custom Format...'
};

export const GeneralSettingsPanel: React.FC = () => {
  const {
    snapStep,
    setSnapStep,
    copyFormat,
    setCopyFormat,
    noSpaces,
    setNoSpaces,
    curveValues,
    customFields,
    setCustomFields
  } = usePlayground();

  const activeIndex = SNAP_STEPS.indexOf(snapStep) !== -1 ? SNAP_STEPS.indexOf(snapStep) : 2;
  const [inputValue, setInputValue] = useState<number>(activeIndex * 25);
  const [isDragging, setIsDragging] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditingCustom, setIsEditingCustom] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startValRef = useRef<number>(0);

  const [x1, y1, x2, y2] = curveValues.map(v => (+v.toFixed(2)).toString());

  useEffect(() => {
    if (!isDragging) {
      setInputValue(activeIndex * 25);
    }
  }, [activeIndex, isDragging]);



  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  // Auto-scroll scrollable body to fully reveal the dropdown when it opens
  useEffect(() => {
    if (isDropdownOpen && dropdownRef.current) {
      const scrollable = dropdownRef.current.closest('.theme-settings-panel__body');
      if (scrollable) {
        const timer = setTimeout(() => {
          const popover = dropdownRef.current?.querySelector('.copy-format-dropdown__popover');
          if (popover) {
            const popoverRect = popover.getBoundingClientRect();
            const scrollableRect = scrollable.getBoundingClientRect();
            
            if (popoverRect.bottom > scrollableRect.bottom) {
              const overflow = popoverRect.bottom - scrollableRect.bottom;
              scrollable.scrollBy({
                top: overflow + 16,
                behavior: 'smooth'
              });
            }
          }
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [isDropdownOpen]);

  // Auto-scroll scrollable body to fully reveal the custom editor wrapper when active
  useEffect(() => {
    if (isEditingCustom && dropdownRef.current) {
      const scrollable = dropdownRef.current.closest('.theme-settings-panel__body');
      if (scrollable) {
        const timer = setTimeout(() => {
          const wrapper = scrollable.querySelector('.preview-container-wrapper');
          if (wrapper) {
            const wrapperRect = wrapper.getBoundingClientRect();
            const scrollableRect = scrollable.getBoundingClientRect();
            
            if (wrapperRect.bottom > scrollableRect.bottom) {
              const overflow = wrapperRect.bottom - scrollableRect.bottom;
              scrollable.scrollBy({
                top: overflow + 16,
                behavior: 'smooth'
              });
            }
          }
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [isEditingCustom]);

  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startValRef.current = inputValue;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!trackRef.current) return;
      const trackRect = trackRef.current.getBoundingClientRect();
      const trackWidth = trackRect.width - 68; // travel bounds (width - 2 * padding)
      if (trackWidth <= 0) return;

      const deltaX = moveEvent.clientX - startXRef.current;
      const deltaPct = (deltaX / trackWidth) * 100;
      const newVal = Math.max(0, Math.min(100, startValRef.current + deltaPct));
      setInputValue(newVal);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      setInputValue((prev) => {
        const targetIndex = Math.round(prev / 25);
        const snappedValue = targetIndex * 25;
        setSnapStep(SNAP_STEPS[targetIndex]);
        return snappedValue;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleThumbTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    startValRef.current = inputValue;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!trackRef.current) return;
      const trackRect = trackRef.current.getBoundingClientRect();
      const trackWidth = trackRect.width - 68;
      if (trackWidth <= 0) return;

      const deltaX = moveEvent.touches[0].clientX - startXRef.current;
      const deltaPct = (deltaX / trackWidth) * 100;
      const newVal = Math.max(0, Math.min(100, startValRef.current + deltaPct));
      setInputValue(newVal);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      
      setInputValue((prev) => {
        const targetIndex = Math.round(prev / 25);
        const snappedValue = targetIndex * 25;
        setSnapStep(SNAP_STEPS[targetIndex]);
        return snappedValue;
      });
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  const handleTrackMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left - 34; // offset relative to padding
    const trackWidth = rect.width - 68;
    if (trackWidth <= 0) return;
    const pct = Math.max(0, Math.min(100, (clickX / trackWidth) * 100));
    
    const targetIndex = Math.round(pct / 25);
    const snappedValue = targetIndex * 25;
    setInputValue(snappedValue);
    setSnapStep(SNAP_STEPS[targetIndex]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let nextIndex = activeIndex;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      nextIndex = Math.min(SNAP_STEPS.length - 1, activeIndex + 1);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      nextIndex = Math.max(0, activeIndex - 1);
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = SNAP_STEPS.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    setSnapStep(SNAP_STEPS[nextIndex]);
    setInputValue(nextIndex * 25);
  };

  const handleSelectFormat = (format: CopyFormat) => {
    setCopyFormat(format);
    setIsDropdownOpen(false);
    if (format === 'custom') {
      setIsEditingCustom(true);
    } else {
      setIsEditingCustom(false);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    const updated = { ...customFields, [key]: value };
    setCustomFields(updated);
  };

  const handleSaveCustom = () => {
    setIsEditingCustom(false);
  };

  const handleListboxKeyDown = (e: React.KeyboardEvent, format: CopyFormat) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectFormat(format);
    }
  };

  const isSpaceFormat = copyFormat === 'space';
  const isCustomFormat = copyFormat === 'custom';

  const previewText = isCustomFormat
    ? `${customFields.prefix}${x1}${customFields.d1}${y1}${customFields.d2}${x2}${customFields.d3}${y2}${customFields.suffix}`
    : formatBezier(curveValues, copyFormat, noSpaces);

  return (
    <div className="theme-settings-panel">
      <h1 className="theme-settings-panel__title">General Settings</h1>

      <div className="theme-settings-panel__body">
        <div className="theme-settings-panel__section">
          <h2 className="theme-settings-panel__section-header">Grid</h2>

          <SettingsRow 
            title="Grid Snapping Steps" 
            description="Choose grid snapping intervals"
          >
            <div className={`slider-wrapper ${isDragging ? 'is-dragging' : ''}`}>
              <div 
                ref={trackRef}
                className="slider-track-container"
                onMouseDown={handleTrackMouseDown}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="slider"
                aria-label="Grid Snapping Steps"
                aria-valuemin={0.025}
                aria-valuemax={0.5}
                aria-valuenow={snapStep}
              >
                <div className="slider-track" />

                <div 
                  className="slider-custom-thumb" 
                  style={{ left: `calc(34px + (${inputValue} / 100) * (100% - 68px))` }}
                  onMouseDown={handleThumbMouseDown}
                  onTouchStart={handleThumbTouchStart}
                />
              </div>

              <div className="slider-labels">
                {SNAP_STEPS.map((step, i) => {
                  const labelPct = (i / (SNAP_STEPS.length - 1)) * 100;
                  const closestIndex = Math.round(inputValue / 25);
                  return (
                    <span 
                      key={i} 
                      className={`slider-label ${i === closestIndex ? 'is-active' : ''}`}
                      style={{ left: `calc(34px + (${labelPct} / 100) * (100% - 68px))` }}
                      onClick={() => {
                        setSnapStep(step);
                        setInputValue(i * 25);
                      }}
                    >
                      {step}
                    </span>
                  );
                })}
              </div>
            </div>
          </SettingsRow>
        </div>

        <div className="theme-settings-panel__section">
          <h2 className="theme-settings-panel__section-header">Export</h2>

          <SettingsRow title="Copy Format" description="Select the structural schema for copied vectors.">
            <div className="copy-format-dropdown" ref={dropdownRef}>
              <button
                type="button"
                className="copy-format-dropdown__btn"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {FORMAT_LABELS[copyFormat]}
                <span className={`chevron-icon ${isDropdownOpen ? 'is-open' : ''}`}>▾</span>
              </button>

              {isDropdownOpen && (
                <div className="copy-format-dropdown__popover" role="listbox">
                  {(Object.keys(FORMAT_LABELS) as CopyFormat[])
                    .filter((f) => f !== 'custom')
                    .map((format) => (
                      <div
                        key={format}
                        role="option"
                        tabIndex={0}
                        aria-selected={copyFormat === format}
                        className={`copy-format-dropdown__option ${copyFormat === format ? 'is-selected' : ''}`}
                        onClick={() => handleSelectFormat(format)}
                        onKeyDown={(e) => handleListboxKeyDown(e, format)}
                      >
                        {FORMAT_LABELS[format]}
                      </div>
                    ))}
                  <div className="copy-format-dropdown__separator" />
                  <div
                    role="option"
                    tabIndex={0}
                    aria-selected={copyFormat === 'custom'}
                    className="copy-format-dropdown__option copy-format-dropdown__option--custom"
                    onClick={() => handleSelectFormat('custom')}
                    onKeyDown={(e) => handleListboxKeyDown(e, 'custom')}
                  >
                    <svg className="pencil-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    Custom Template
                  </div>
                </div>
              )}
            </div>
          </SettingsRow>

          <SettingsRow title="No spaces between values" description="Remove spaces between values">
            <label className={`theme-checkbox-container ${(isSpaceFormat || isCustomFormat) ? 'is-disabled' : ''}`}>
              <input
                type="checkbox"
                className="theme-checkbox-input"
                checked={(isSpaceFormat || isCustomFormat) ? false : noSpaces}
                disabled={isSpaceFormat || isCustomFormat}
                onChange={(e) => setNoSpaces(e.target.checked)}
              />
              <div className="theme-checkbox-box">
                <svg className="theme-checkbox-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </label>
          </SettingsRow>

          {/* Dynamic Preview and Segmented Editing Box */}
          <div className={`preview-container-wrapper ${isEditingCustom ? 'is-editing' : ''}`}>
            <div className="preview-label">Format Preview</div>
            <div className="custom-preview-box">
              {isEditingCustom ? (
                <div className="segmented-input-strip">
                  <input 
                    type="text" 
                    className="strip-input prefix" 
                    value={customFields.prefix} 
                    onChange={e => handleFieldChange('prefix', e.target.value)} 
                    placeholder="prefix"
                  />
                  <span className="coord-token">{x1}</span>
                  <input 
                    type="text" 
                    className="strip-input delimiter" 
                    value={customFields.d1} 
                    onChange={e => handleFieldChange('d1', e.target.value)} 
                    placeholder=","
                  />
                  <span className="coord-token">{y1}</span>
                  <input 
                    type="text" 
                    className="strip-input delimiter" 
                    value={customFields.d2} 
                    onChange={e => handleFieldChange('d2', e.target.value)} 
                    placeholder=","
                  />
                  <span className="coord-token">{x2}</span>
                  <input 
                    type="text" 
                    className="strip-input delimiter" 
                    value={customFields.d3} 
                    onChange={e => handleFieldChange('d3', e.target.value)} 
                    placeholder=","
                  />
                  <span className="coord-token">{y2}</span>
                  <input 
                    type="text" 
                    className="strip-input suffix" 
                    value={customFields.suffix} 
                    onChange={e => handleFieldChange('suffix', e.target.value)} 
                    placeholder="suffix"
                  />
                  <button type="button" className="custom-done-btn" onClick={handleSaveCustom}>
                    Done
                  </button>
                </div>
              ) : (
                <div className="static-preview-text">
                  <span className="export-preview-box__code">{previewText}</span>
                  {isCustomFormat && (
                    <button type="button" className="inline-edit-trigger" onClick={() => setIsEditingCustom(true)}>
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettingsPanel;

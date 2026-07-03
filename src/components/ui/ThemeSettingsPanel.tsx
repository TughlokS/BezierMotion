import React, { useState, useRef, useEffect } from 'react';
import { usePlayground } from '../../context/PlaygroundContext';
import { THEME_PALETTES } from '../../hooks/useThemeColor';
import { SettingsRow } from './SettingsRow';

export const ThemeSettingsPanel: React.FC = () => {
  const { activeColor, setActiveColor, themeMode, setThemeMode } = usePlayground();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    if (!isPickerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPickerOpen]);

  const activePalette = THEME_PALETTES[activeColor] || THEME_PALETTES.coral;

  return (
    <div className="theme-settings-panel">
      <h1 className="theme-settings-panel__title">Themes Settings</h1>

      <div className="theme-settings-panel__section">
        <h2 className="theme-settings-panel__section-header">Appearance</h2>

        <SettingsRow 
          title="Accent Color" 
          description="Choose the primary color for your application interface components."
        >
          <div className="accent-color-container" ref={pickerRef}>
            <div className="accent-color-preview-wrap">
              <button
                type="button"
                className="accent-color-preview-btn"
                style={{ backgroundColor: activePalette.base }}
                onClick={() => setIsPickerOpen(!isPickerOpen)}
                aria-label={`Accent color picker, current color is ${activeColor}`}
                aria-haspopup="true"
                aria-expanded={isPickerOpen}
              />
            </div>
            
            {isPickerOpen && (
              <div className="accent-color-popover" role="radiogroup" aria-label="Accent Color Options">
                {Object.keys(THEME_PALETTES).map((colorKey) => {
                  const isSelected = activeColor === colorKey;
                  const palette = THEME_PALETTES[colorKey];
                  
                  return (
                    <button
                      key={colorKey}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={colorKey}
                      className={`color-swatch color-swatch--${colorKey} ${isSelected ? 'is-selected' : ''}`}
                      style={{ '--swatch-color': palette.base } as React.CSSProperties}
                      onClick={() => {
                        setActiveColor(colorKey);
                        setIsPickerOpen(false);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </SettingsRow>

        <SettingsRow 
          title="Interface Style" 
          description="Set the system-wide visual darkness."
        >
          <div className="segmented-control" role="group" aria-label="Interface Style">
            <button
              type="button"
              className={`segmented-control__btn ${themeMode === 'light' ? 'is-active' : ''}`}
              onClick={(e) => setThemeMode('light', e.currentTarget)}
            >
              Light
            </button>
            <button
              type="button"
              className={`segmented-control__btn ${themeMode === 'dark' ? 'is-active' : ''}`}
              onClick={(e) => setThemeMode('dark', e.currentTarget)}
            >
              Dark
            </button>
          </div>
        </SettingsRow>
      </div>
    </div>
  );
};

export default ThemeSettingsPanel;

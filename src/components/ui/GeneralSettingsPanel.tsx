import React from 'react';
import { usePlayground } from '../../context/PlaygroundContext';
import { SettingsRow } from './SettingsRow';

const SNAP_STEPS = [0.5, 0.25, 0.1, 0.05, 0.025];

export const GeneralSettingsPanel: React.FC = () => {
  const { snapStep, setSnapStep } = usePlayground();

  const activeIndex = SNAP_STEPS.indexOf(snapStep) !== -1 ? SNAP_STEPS.indexOf(snapStep) : 2;
  const [inputValue, setInputValue] = React.useState<number>(activeIndex * 25);
  const [isDragging, setIsDragging] = React.useState(false);

  const trackRef = React.useRef<HTMLDivElement>(null);
  const startXRef = React.useRef<number>(0);
  const startValRef = React.useRef<number>(0);

  React.useEffect(() => {
    if (!isDragging) {
      setInputValue(activeIndex * 25);
    }
  }, [activeIndex, isDragging]);

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

  return (
    <div className="general-settings-panel">
      <h1 className="theme-settings-panel__title">General Settings</h1>

      <div className="theme-settings-panel__body">
        <div className="theme-settings-panel__section">
          <h2 className="theme-settings-panel__section-header">Grid</h2>

          <SettingsRow 
            title="Grid Snapping Steps" 
            description="Choose at what intervals the control points snaps to grid"
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
      </div>
    </div>
  );
};

export default GeneralSettingsPanel;

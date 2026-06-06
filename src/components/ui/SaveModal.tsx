import React, { useState, useEffect, useRef } from 'react';
import { usePlayground } from '../../context/PlaygroundContext';
import { MiniCurveIcon } from './PresetsPanel';
import './SaveModal.css';

const SaveModal: React.FC = () => {
  const { isSaveModalOpen, setSaveModalOpen, commitSavePreset, curveValues } = usePlayground();
  const [title, setTitle] = useState('New Preset');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSaveModalOpen) {
      setTitle('New Preset');
      // Auto-focus and select all text when modal opens
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [isSaveModalOpen]);

  if (!isSaveModalOpen) return null;

  const handleSave = () => {
    commitSavePreset(title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setSaveModalOpen(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSaveModalOpen(false);
    }
  };

  // Prepare curve data for MiniCurveIcon
  const cp1 = { X: curveValues[0], Y: curveValues[1] };
  const cp2 = { X: curveValues[2], Y: curveValues[3] };
  
  const fmt = (n: number) => parseFloat(n.toFixed(2)).toString();
  const valStr = `${fmt(cp1.X)}, ${fmt(cp1.Y)}, ${fmt(cp2.X)}, ${fmt(cp2.Y)}`;

  return (
    <div className="save-modal-backdrop" onClick={handleBackdropClick}>
      <div className="save-modal">
        
        <h2 className="save-modal__heading">Save Custom Preset</h2>
        
        {/* Large Preset Preview */}
        <div className="save-modal__preview">
          <div className="save-modal__icon-wrap">
             <MiniCurveIcon cp1={cp1} cp2={cp2} className="save-modal__icon" />
          </div>
          <div className="save-modal__details">
            <input
              ref={inputRef}
              className="save-modal__input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Preset Name"
              spellCheck={false}
              autoComplete="off"
            />
            <span className="save-modal__values">{valStr}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="save-modal__actions">
          <button className="save-modal__btn save-modal__btn--cancel" onClick={() => setSaveModalOpen(false)}>
            Cancel
          </button>
          <button className="save-modal__btn save-modal__btn--save" onClick={handleSave}>
            Save Preset
          </button>
        </div>

      </div>
    </div>
  );
};

export default SaveModal;

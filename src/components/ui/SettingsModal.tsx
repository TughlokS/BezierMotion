import React, { useEffect, useState, useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { SETTINGS_CATEGORIES } from '../../types/settings';
import type { SettingsCategoryId } from '../../types/settings';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: SettingsCategoryId;
  onTabChange: (id: SettingsCategoryId) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
}) => {
  const modalRef = useFocusTrap(isOpen);
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [pill, setPill] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [pillReady, setPillReady] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !activeTab) return;

    const updatePill = () => {
      const navEl = navRef.current;
      const itemEl = itemRefs.current.get(activeTab);
      if (!navEl || !itemEl) return;

      const navRect = navEl.getBoundingClientRect();
      const itemRect = itemEl.getBoundingClientRect();

      const top = itemRect.top - navRect.top;
      const left = itemRect.left - navRect.left;
      const width = itemRect.width;
      const height = itemRect.height;

      setPill({ top, left, width, height });
    };

    // Calculate dimensions immediately
    updatePill();

    // Enable transitions after initial placement to avoid flash on mount
    const animId = requestAnimationFrame(() => setPillReady(true));

    window.addEventListener('resize', updatePill);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updatePill);
    };
  }, [activeTab, isOpen]);

  // Reset indicator when settings closes
  useEffect(() => {
    if (!isOpen) {
      setPillReady(false);
      setPill(null);
    }
  }, [isOpen]);

  const clickStartedOnBackdropRef = useRef(false);

  const handleBackdropMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clickStartedOnBackdropRef.current = true;
    } else {
      clickStartedOnBackdropRef.current = false;
    }
  };

  const handleBackdropMouseUp = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && clickStartedOnBackdropRef.current) {
      onClose();
    }
    clickStartedOnBackdropRef.current = false;
  };

  if (!isOpen) return null;

  const ActiveComponent = SETTINGS_CATEGORIES.find((c) => c.id === activeTab)?.component || (() => null);

  return (
    <div 
      className="settings-backdrop" 
      onMouseDown={handleBackdropMouseDown} 
      onMouseUp={handleBackdropMouseUp}
    >
      <div
        className="settings-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-heading"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()} // Stop modal closure when clicking inner container
      >
        <aside className="settings-sidebar">
          <h2 id="settings-heading" className="settings-sidebar__title">Settings</h2>
          <nav className="settings-nav" ref={navRef} aria-label="Settings Categories">
            {pill && (
              <div
                className="settings-nav__pill"
                style={{
                  top: pill.top,
                  left: pill.left,
                  width: pill.width,
                  height: pill.height,
                  transition: pillReady ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                }}
              />
            )}
            {SETTINGS_CATEGORIES.map((category) => {
              const isActive = category.id === activeTab;
              return (
                <button
                  key={category.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(category.id, el);
                    else itemRefs.current.delete(category.id);
                  }}
                  className={`settings-nav-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => onTabChange(category.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {category.icon && <span className="settings-nav-icon">{category.icon}</span>}
                  <span className="settings-nav-label">{category.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="settings-content">
          <ActiveComponent />
          <button className="settings-close-btn" onClick={onClose} aria-label="Close Settings">
            Done
          </button>
        </main>
      </div>
    </div>
  );
};

export default SettingsModal;

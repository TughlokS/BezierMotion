import React, { useEffect } from 'react';
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

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const ActiveComponent = SETTINGS_CATEGORIES.find((c) => c.id === activeTab)?.component || (() => null);

  return (
    <div className="settings-backdrop" onClick={onClose}>
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
          <nav className="settings-nav" aria-label="Settings Categories">
            {SETTINGS_CATEGORIES.map((category) => {
              const isActive = category.id === activeTab;
              return (
                <button
                  key={category.id}
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

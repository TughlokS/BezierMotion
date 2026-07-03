import React, { useEffect, useState, useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import './SettingsModal.css'; // Re-use settings modal styling for 100% design consistency

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type InfoCategoryId = 'welcome' | 'canvas' | 'presets';

const WelcomeIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CanvasIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <circle cx="15" cy="15" r="2" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const PresetsIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const MouseBadge: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => (
  <span 
    title={title}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-brand-wash)',
      border: '1px solid rgba(var(--color-brand-base-rgb), 0.15)',
      borderRadius: '100px',
      padding: '0 8px',
      margin: '0 4px',
      height: '24px',
      boxSizing: 'border-box',
      verticalAlign: 'middle',
      cursor: title ? 'help' : 'default',
    }}
  >
    {children}
  </span>
);

const LeftMouseIcon: React.FC = () => (
  <MouseBadge title="Left Mouse Button">
    <svg width="11" height="14" viewBox="0 0 24 32" style={{ display: 'block', color: 'var(--color-brand-base)' }} aria-hidden="true">
      <rect x="2" y="2" width="20" height="28" rx="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 2 A 10 10 0 0 0 2 12 L 12 12 Z" fill="currentColor" />
      <line x1="12" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
    </svg>
  </MouseBadge>
);

const RightMouseIcon: React.FC = () => (
  <MouseBadge title="Right Mouse Button">
    <svg width="11" height="14" viewBox="0 0 24 32" style={{ display: 'block', color: 'var(--color-brand-base)' }} aria-hidden="true">
      <rect x="2" y="2" width="20" height="28" rx="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 2 A 10 10 0 0 1 22 12 L 12 12 Z" fill="currentColor" />
      <line x1="12" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
    </svg>
  </MouseBadge>
);

const ScrollMouseIcon: React.FC = () => (
  <MouseBadge title="Mouse Scroll Wheel">
    <svg width="11" height="14" viewBox="0 0 24 32" style={{ display: 'block', color: 'var(--color-brand-base)' }} aria-hidden="true">
      <rect x="2" y="2" width="20" height="28" rx="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="12" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
      <rect x="10" y="4" width="4" height="6" rx="1" fill="currentColor" />
    </svg>
  </MouseBadge>
);

const PinchGestureIcon: React.FC = () => (
  <MouseBadge title="Trackpad Pinch Gesture">
    <svg width="11" height="14" viewBox="0 0 24 32" style={{ display: 'block', color: 'var(--color-brand-base)' }} aria-hidden="true">
      <rect x="2" y="5" width="20" height="22" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="2" y1="21" x2="22" y2="21" stroke="currentColor" strokeWidth="1" />
      <circle cx="7" cy="11" r="2" fill="currentColor" />
      <circle cx="17" cy="15" r="2" fill="currentColor" />
      <path d="M 9 12 L 11 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 15 14 L 13 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  </MouseBadge>
);

const ResetBadgeIcon: React.FC = () => (
  <MouseBadge title="Reset View Button">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-base)" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ display: 'block' }}>
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="7" />
      <line x1="12" y1="17" x2="12" y2="22" />
      <line x1="2" y1="12" x2="7" y2="12" />
      <line x1="17" y1="12" x2="22" y2="12" />
    </svg>
  </MouseBadge>
);

const BezierHandleIcon: React.FC = () => (
  <MouseBadge title="Bezier Control Handle">
    <svg width="15" height="11" viewBox="0 0 24 24" style={{ display: 'block' }} aria-hidden="true">
      <line x1="3" y1="12" x2="21" y2="12" stroke="var(--color-border-dark)" strokeWidth="2.0" strokeDasharray="3,2" />
      <circle cx="3" cy="12" r="3.0" fill="var(--color-text-main)" />
      <circle cx="21" cy="12" r="5.5" stroke="var(--color-brand-base)" strokeWidth="2.5" fill="transparent" />
      <circle cx="21" cy="12" r="2.5" fill="var(--color-brand-base)" />
    </svg>
  </MouseBadge>
);

const SnapBadgeIcon: React.FC = () => (
  <MouseBadge title="Snap to Grid Button">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--color-brand-base)" aria-hidden="true" style={{ display: 'block' }}>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <path d="M17 12c-1.1 0-2 .9-2 2v2h-1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1h-1v-2c0-1.1-.9-2-2-2zm0 2c.55 0 1 .45 1 1v1h-2v-1c0-.55.45-1 1-1z" />
    </svg>
  </MouseBadge>
);

const WelcomeView: React.FC = () => (
  <div className="theme-settings-panel">
    <h1 className="theme-settings-panel__title">Welcome</h1>
    <div className="theme-settings-panel__body">
      <div style={{
        boxSizing: 'border-box',
        width: '100%',
        backgroundColor: 'var(--color-bg-card-subtle)',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '16px'
      }}>
        <p style={{
          margin: 0,
          fontSize: '13px',
          lineHeight: '1.6',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-body)'
        }}>
          Hey there! Welcome to Curved Motion, your interactive playground for designing smooth Bezier curves. Drag the handles, adjust the duration, and watch your animations come to life in real-time. Save your favorites as presets to reuse them anytime. Have fun playing with motion!
        </p>
      </div>
    </div>
  </div>
);

const CanvasView: React.FC = () => (
  <div className="theme-settings-panel">
    <h1 className="theme-settings-panel__title">Canvas Information</h1>
    <div className="theme-settings-panel__body">
      <div className="theme-settings-panel__section">
        <h2 className="theme-settings-panel__section-header">Navigation</h2>
        <div style={{
          boxSizing: 'border-box',
          width: '100%',
          backgroundColor: 'var(--color-bg-card-subtle)',
          borderRadius: '12px',
          padding: '24px',
          marginTop: '16px'
        }}>
          <ul style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            fontSize: '13px',
            lineHeight: '1.8',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-body)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: 'var(--color-brand-base)', userSelect: 'none' }}>•</span>
              <div>
                <strong>Panning</strong>: You can pan around the canvas using <LeftMouseIcon /> or <RightMouseIcon />. Just hold and drag.
              </div>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: 'var(--color-brand-base)', userSelect: 'none' }}>•</span>
              <div>
                <strong>Zooming</strong>: Use your mouse scroll wheel <ScrollMouseIcon /> or <PinchGestureIcon /> to zoom in and out of the grid.
              </div>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: 'var(--color-brand-base)', userSelect: 'none' }}>•</span>
              <div>
                <strong>Reset View</strong>: Click the <ResetBadgeIcon /> to instantly reset the pan offset and zoom level.
              </div>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="theme-settings-panel__section" style={{ marginTop: '24px' }}>
        <h2 className="theme-settings-panel__section-header">Curve</h2>
        <div style={{
          boxSizing: 'border-box',
          width: '100%',
          backgroundColor: 'var(--color-bg-card-subtle)',
          borderRadius: '12px',
          padding: '24px',
          marginTop: '16px'
        }}>
          <ul style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            fontSize: '13px',
            lineHeight: '1.8',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-body)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: 'var(--color-brand-base)', userSelect: 'none' }}>•</span>
              <div>
                <strong>Control Handles</strong>: Drag the handle endpoints <BezierHandleIcon /> to shape the velocity curve.
              </div>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: 'var(--color-brand-base)', userSelect: 'none' }}>•</span>
              <div>
                <strong>Grid Snapping</strong>: Align handles cleanly to standard intervals by toggling <SnapBadgeIcon />.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const PresetsView: React.FC = () => (
  <div className="theme-settings-panel">
    <h1 className="theme-settings-panel__title">Presets Information</h1>
    <div className="theme-settings-panel__body">
    </div>
  </div>
);

const INFO_CATEGORIES: { id: InfoCategoryId; label: string; icon: React.ReactNode; component: React.FC }[] = [
  { id: 'welcome', label: 'Welcome', icon: <WelcomeIcon />, component: WelcomeView },
  { id: 'canvas', label: 'Canvas', icon: <CanvasIcon />, component: CanvasView },
  { id: 'presets', label: 'Presets', icon: <PresetsIcon />, component: PresetsView },
];

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useFocusTrap(isOpen);
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [activeTab, setActiveTab] = useState<InfoCategoryId>('welcome');
  const [pill, setPill] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [pillReady, setPillReady] = useState(false);
  const clickStartedOnBackdropRef = useRef(false);

  // Escape key handler to close the modal
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle sliding tab indicator pill positioning
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

    updatePill();

    const animId = requestAnimationFrame(() => setPillReady(true));
    window.addEventListener('resize', updatePill);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updatePill);
    };
  }, [activeTab, isOpen]);

  // Reset tab indicator animation state on modal close
  useEffect(() => {
    if (!isOpen) {
      setPillReady(false);
      setPill(null);
      setActiveTab('welcome');
    }
  }, [isOpen]);

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

  const ActiveComponent = INFO_CATEGORIES.find((c) => c.id === activeTab)?.component || (() => null);

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
        aria-labelledby="info-heading"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <aside className="settings-sidebar">
          <h2 id="info-heading" className="settings-sidebar__title">Information</h2>
          <nav className="settings-nav" ref={navRef} aria-label="Information Categories">
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
            {INFO_CATEGORIES.map((category) => {
              const isActive = category.id === activeTab;
              return (
                <button
                  key={category.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(category.id, el);
                    else itemRefs.current.delete(category.id);
                  }}
                  className={`settings-nav-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(category.id)}
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
          <button className="settings-close-btn" onClick={onClose} aria-label="Close Information">
            Done
          </button>
        </main>
      </div>
    </div>
  );
};

export default InfoModal;

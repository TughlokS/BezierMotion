import React from 'react';

// ─────────────────────────────────────────────
//  Navbar – top-left floating navigation
// ─────────────────────────────────────────────

const CurveLogoIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ overflow: 'visible' }}>
    {/* The main Bezier curve */}
    <path d="M4 20 C 8 8, 16 16, 20 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Hollow anchor nodes */}
    <circle cx="4" cy="20" r="3" fill="var(--color-bg-base)" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="20" cy="4" r="3" fill="var(--color-bg-base)" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const NAV_ITEMS = [
  { label: 'Dashboard', active: false },
  { label: 'Playground', active: true },
];

const Navbar: React.FC = () => (
  <nav className="navbar" aria-label="Main navigation">
    <div className="navbar__logo" aria-label="CurvedMotion">
      <CurveLogoIcon />
    </div>
    {NAV_ITEMS.map(({ label, active }) => (
      <a
        key={label}
        href="#"
        className={`navbar__link${active ? ' navbar__link--active' : ''}`}
        onClick={(e) => e.preventDefault()}
        aria-current={active ? 'page' : undefined}
      >
        {label}
      </a>
    ))}
  </nav>
);

export default Navbar;

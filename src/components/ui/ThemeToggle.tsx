import React, { useRef } from 'react';
import { usePlayground } from '../../context/PlaygroundContext';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const { isDarkResolved, setThemeMode } = usePlayground();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleTheme = () => {
    const nextMode = isDarkResolved ? 'light' : 'dark';
    setThemeMode(nextMode, buttonRef.current);
  };

  return (
    <button
      ref={buttonRef}
      className={`theme-toggle ${isDarkResolved ? 'theme-toggle--dark' : ''}`}
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      <svg
        className="theme-toggle__svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <mask id="moon-mask">
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <circle cx="12" cy="12" r="5" fill="black" className="theme-toggle__mask-circle" />
        </mask>

        <circle
          cx="12"
          cy="12"
          r="5"
          fill="currentColor"
          mask="url(#moon-mask)"
          className="theme-toggle__sun-moon"
        />

        <g className="theme-toggle__sun-rays">
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </g>
      </svg>
    </button>
  );
};

export default ThemeToggle;

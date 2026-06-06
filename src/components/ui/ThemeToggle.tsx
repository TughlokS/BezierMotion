import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme === 'dark' || (!savedTheme && prefersDark);
  });

  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDark]);

  const toggleTheme = async () => {
    const newIsDark = !isDark;

    // ── Fallback: no View Transitions API or user prefers reduced motion ──
    if (
      !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsDark(newIsDark);
      const theme = newIsDark ? 'dark' : 'light';
      if (newIsDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      localStorage.setItem('theme', theme);
      return;
    }

    // ── Get button centre coordinates before the transition begins ──
    const btn = buttonRef.current;
    const { top, left, width, height } = btn
      ? btn.getBoundingClientRect()
      : { top: 0, left: 0, width: 0, height: 0 };

    const x = left + width / 2;
    const y = top + height / 2;

    // Distance from the click origin to the farthest corner of the screen
    const right  = window.innerWidth  - left;
    const bottom = window.innerHeight - top;
    const maxRadius = Math.hypot(
      Math.max(left, right),
      Math.max(top, bottom),
    );

    // ── Start View Transition ──
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setIsDark(newIsDark);
      });
      // Keep localStorage in sync (must happen synchronously inside the callback)
      localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
      if (newIsDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    });

    // ── Wait until both screenshots are ready, then animate the clip-path ──
    await transition.ready;

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 600,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)', // ease-out expo
        pseudoElement: '::view-transition-new(root)',
      },
    );
  };

  return (
    <button
      ref={buttonRef}
      className={`theme-toggle ${isDark ? 'theme-toggle--dark' : ''}`}
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

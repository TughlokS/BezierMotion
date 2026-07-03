import { useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'app-brand-color';

export interface ThemeTokens {
  base: string;
  hover: string;
  active: string;
  light: string;
  rgb: string;
}

export const THEME_PALETTES: Record<string, ThemeTokens> = {
  coral: { base: '#f5715f', hover: '#e05a48', active: '#cc4b3a', light: '#fef0ee', rgb: '245, 113, 95' },
  violet: { base: '#8b5cf6', hover: '#7c3aed', active: '#6d28d9', light: '#f5f3ff', rgb: '139, 92, 246' },
  blue: { base: '#1f8ad1', hover: '#1974b0', active: '#145f90', light: '#f0f8fd', rgb: '31, 138, 209' },
  emerald: { base: '#10b981', hover: '#059669', active: '#047857', light: '#ecfdf5', rgb: '16, 185, 129' },
  crimson: { base: '#cc233f', hover: '#b01c34', active: '#941529', light: '#fdf0f2', rgb: '204, 35, 63' },
  sage: { base: '#416165', hover: '#3a575b', active: '#344e51', light: '#f6f7f7', rgb: '65, 97, 101' }
};

export function useThemeColor(initialColorKey = 'coral') {
  const [activeColor, setActiveColor] = useState(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored && THEME_PALETTES[stored]) ? stored : initialColorKey;
  });

  useEffect(() => {
    const tokens = THEME_PALETTES[activeColor];
    if (!tokens) return;

    const root = document.documentElement;
    root.style.setProperty('--color-brand-base', tokens.base);
    root.style.setProperty('--color-brand-hover', tokens.hover);
    root.style.setProperty('--color-brand-active', tokens.active);
    root.style.setProperty('--color-brand-light', tokens.light);
    root.style.setProperty('--color-brand-base-rgb', tokens.rgb);

    localStorage.setItem(THEME_STORAGE_KEY, activeColor);
  }, [activeColor]);

  return { activeColor, setActiveColor };
}

import React from 'react';
import { ThemeSettingsPanel } from '../components/ui/ThemeSettingsPanel';
import { GeneralSettingsPanel } from '../components/ui/GeneralSettingsPanel';

export type SettingsCategoryId = 'general' | 'theme' | 'shortcuts';

export interface SettingsCategory {
  id: SettingsCategoryId;
  label: string;
  icon?: React.ReactNode;
  component: React.ComponentType;
}

const GearIcon: React.FC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const PaletteIcon: React.FC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ overflow: 'visible' }}>
    <defs>
      <mask id="palette-mask">
        <rect x="0" y="0" width="24" height="24" fill="white" />
        <circle cx="8" cy="8" r="1.5" fill="black" />
        <circle cx="12" cy="6" r="1.5" fill="black" />
        <circle cx="16" cy="8" r="1.5" fill="black" />
        <circle cx="7" cy="13" r="1.5" fill="black" />
      </mask>
    </defs>
    <path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C13.1 22 14 21.1 14 20V14H20C21.1 14 22 13.1 22 12C22 6.48 17.52 2 12 2Z"
      mask="url(#palette-mask)"
    />
  </svg>
);

export const SETTINGS_CATEGORIES: SettingsCategory[] = [
  {
    id: 'general',
    label: 'General',
    icon: <GearIcon />,
    component: GeneralSettingsPanel,
  },
  {
    id: 'theme',
    label: 'Themes',
    icon: <PaletteIcon />,
    component: ThemeSettingsPanel,
  },
];

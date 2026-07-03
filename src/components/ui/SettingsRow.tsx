import React from 'react';

interface SettingsRowProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({ title, description, children }) => {
  return (
    <div className="settings-row">
      <div className="settings-row__info">
        <div className="settings-row__title">{title}</div>
        {description && <div className="settings-row__description">{description}</div>}
      </div>
      <div className="settings-row__control">
        {children}
      </div>
    </div>
  );
};

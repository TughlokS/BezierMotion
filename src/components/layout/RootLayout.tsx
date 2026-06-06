import React from 'react';

// ─────────────────────────────────────────────
//  RootLayout – wraps every page
//  Add Header, Footer, Sidebar here.
// ─────────────────────────────────────────────

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <div className="root-layout">
      <main className="root-layout__main">{children}</main>
    </div>
  );
};

export default RootLayout;

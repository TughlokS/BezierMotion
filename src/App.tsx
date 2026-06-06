import React from 'react';
import PlaygroundPage from './pages/PlaygroundPage';
import ClickRayEffect from './components/ClickRayEffect/ClickRayEffect';

// ─────────────────────────────────────────────
//  App – renders the Playground (routing added later)
// ─────────────────────────────────────────────

const App: React.FC = () => (
  <>
    <ClickRayEffect />
    <PlaygroundPage />
  </>
);

export default App;

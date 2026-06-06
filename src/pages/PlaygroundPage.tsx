import React from 'react';
import { PlaygroundProvider } from '../context/PlaygroundContext';
import BackgroundGrid from '../components/ui/BackgroundGrid';
import BezierCurve from '../components/ui/BezierCurve';
import Navbar from '../components/ui/Navbar';
import TopControls from '../components/ui/TopControls';
import PresetsPanel from '../components/ui/PresetsPanel';
import DurationPanel from '../components/ui/DurationPanel';
import TranslatePanel from '../components/ui/TranslatePanel';
import ScalePanel from '../components/ui/ScalePanel';
import OpacityPanel from '../components/ui/OpacityPanel';
import CurveValuesBar from '../components/ui/CurveValuesBar';
import ThemeToggle from '../components/ui/ThemeToggle';
import SaveModal from '../components/ui/SaveModal';

// ─────────────────────────────────────────────
//  PlaygroundPage – assembles the full editor UI
// ─────────────────────────────────────────────

const PlaygroundPage: React.FC = () => (
  <PlaygroundProvider>
    <div className="playground">
      {/* Full-page SVG dot-grid background */}
      <BackgroundGrid />

      {/* Interactive bezier curve (above background, below panels) */}
      <BezierCurve />

      {/* Top-left: navigation */}
      <Navbar />

      {/* Top-right: Theme toggle */}
      <ThemeToggle />

      {/* Left: preset list */}
      <PresetsPanel />

      {/* Right: animation preview panels (grouped so position is easy to adjust) */}
      <div className="right-panels" id="right-panels">
        <DurationPanel />
        <TranslatePanel />
        <ScalePanel />
        <OpacityPanel />
      </div>

      {/* Bottom-center: tools + bezier values */}
      <div className="bottom-bar">
        <CurveValuesBar />
        <TopControls />
      </div>

      <SaveModal />
    </div>
  </PlaygroundProvider>
);

export default PlaygroundPage;

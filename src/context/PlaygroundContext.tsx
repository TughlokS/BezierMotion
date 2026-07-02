import React, { createContext, useContext, useState, useRef, useCallback, useMemo } from 'react';
import { animate } from 'framer-motion';
import { useAnimationEngine } from '../hooks/useAnimationEngine';
import { useLocalStorage } from '../hooks';

// localStorage key for user-saved (custom) presets — defaults stay in code
const CUSTOM_PRESETS_KEY = 'bezierMotion.customPresets';

// ─────────────────────────────────────────────
//  Playground Context – all animation/curve state
// ─────────────────────────────────────────────

export interface BezierCP { X: number; Y: number; }

export interface Preset {
  id: string;
  title: string;
  bezierValue: { cp1: BezierCP; cp2: BezierCP };
  isFavorite: boolean;
  isLocked: boolean;
}

// ── Default locked presets ───────────────────
const DEFAULT_PRESETS: Preset[] = [
  { id: 'linear',          title: 'Linear',         bezierValue: { cp1: { X: 0,   Y: 0    }, cp2: { X: 1,   Y: 1   } }, isFavorite: false, isLocked: true },
  { id: 'ease',            title: 'Ease',            bezierValue: { cp1: { X: 0.25,Y: 0.1  }, cp2: { X: 0.25,Y: 1   } }, isFavorite: false, isLocked: true },
  { id: 'ease-in',         title: 'Ease-In',         bezierValue: { cp1: { X: 0.42,Y: 0    }, cp2: { X: 1,   Y: 1   } }, isFavorite: false, isLocked: true },
  { id: 'ease-out',        title: 'Ease-Out',        bezierValue: { cp1: { X: 0,   Y: 0    }, cp2: { X: 0.58,Y: 1   } }, isFavorite: false, isLocked: true },
  { id: 'ease-in-out',     title: 'Ease-In-Out',     bezierValue: { cp1: { X: 0.42,Y: 0    }, cp2: { X: 0.58,Y: 1   } }, isFavorite: false, isLocked: true },
  { id: 'elastic-in',      title: 'Elastic-In',      bezierValue: { cp1: { X: 0.5, Y: -0.5 }, cp2: { X: 1,   Y: 1   } }, isFavorite: false, isLocked: true },
  { id: 'elastic-out',     title: 'Elastic-Out',     bezierValue: { cp1: { X: 0,   Y: 0    }, cp2: { X: 0.5, Y: 1.5 } }, isFavorite: false, isLocked: true },
  { id: 'elastic-in-out',  title: 'Elastic-In-Out',  bezierValue: { cp1: { X: 0.5, Y: -0.5 }, cp2: { X: 0.5, Y: 1.5 } }, isFavorite: false, isLocked: true },
  { id: 'anticipate',      title: 'Anticipate',      bezierValue: { cp1: { X: 1,   Y: 0    }, cp2: { X: 0,   Y: 1   } }, isFavorite: false, isLocked: true },
  { id: 'overshoot',       title: 'Overshoot',       bezierValue: { cp1: { X: 0,   Y: 1    }, cp2: { X: 0,   Y: 1   } }, isFavorite: false, isLocked: true },
  { id: 'glitch',          title: 'Glitch',          bezierValue: { cp1: { X: 1,   Y: 2    }, cp2: { X: 0,   Y: -1  } }, isFavorite: false, isLocked: true },
  { id: 'bounce',          title: 'Bounce',          bezierValue: { cp1: { X: 0.5, Y: 2.2  }, cp2: { X: 0,   Y: 0   } }, isFavorite: false, isLocked: true },
];

interface PlaygroundState {
  curveValues: [number, number, number, number];
  setCurveValues: (v: [number, number, number, number]) => void;
  duration: number;
  setDuration: (s: number) => void;
  presets: Preset[];
  selectedPresetId: string | null;
  selectPreset: (id: string) => void;
  saveCustomPreset: () => void;
  commitSavePreset: (name: string) => void;
  panOffsetPx: number;
  setPanOffsetPx: (v: number) => void;
  panOffsetXPx: number;
  setPanOffsetXPx: (v: number) => void;
  zoom: number;
  setZoom: (v: number) => void;
  /** true when the view (pan or zoom) is not at its default — drives the Reset button glow */
  canResetView: boolean;
  /** true while the reset animation is playing (lets the curve track it without spring lag) */
  isResettingView: boolean;
  /** animate pan + zoom back to defaults (no-op if already at default) */
  resetView: () => void;
  /** stop an in-progress reset animation (called when the user interacts) */
  cancelViewReset: () => void;
  snapToGrid: boolean;
  setSnapToGrid: (v: boolean) => void;
  activeHandle: 'p1' | 'p2' | null;
  setActiveHandle: (h: 'p1' | 'p2' | null) => void;
  hoveredHandle: 'p1' | 'p2' | null;
  setHoveredHandle: (h: 'p1' | 'p2' | null) => void;
  isSaveModalOpen: boolean;
  setSaveModalOpen: (v: boolean) => void;
}

const PlaygroundContext = createContext<PlaygroundState | undefined>(undefined);

export const PlaygroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [curveValues, setCurveValues] = useState<[number, number, number, number]>([0.42, 0, 0.58, 1]);
  const [duration, setDuration] = useState(0.5);
  // Defaults live in code; user-saved presets persist in localStorage.
  const [customPresets, setCustomPresets] = useLocalStorage<Preset[]>(CUSTOM_PRESETS_KEY, []);
  const presets = useMemo(() => [...DEFAULT_PRESETS, ...customPresets], [customPresets]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('ease-in-out');

  // Animation engine — writes CSS vars directly, no React state updates per frame
  useAnimationEngine(curveValues, duration);

  const [panOffsetPx, setPanOffsetPx] = useState(0);
  const [panOffsetXPx, setPanOffsetXPx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isResettingView, setIsResettingView] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);

  // Refs mirror current view state so resetView() can stay a stable callback.
  const zoomRef = useRef(zoom);   zoomRef.current = zoom;
  const panXRef = useRef(panOffsetXPx); panXRef.current = panOffsetXPx;
  const panYRef = useRef(panOffsetPx);  panYRef.current = panOffsetPx;
  const resetAnimRef = useRef<{ stop: () => void } | null>(null);

  // View differs from default (1× zoom, no pan) → Reset button becomes active/glows.
  const canResetView = Math.abs(zoom - 1) > 0.005 || panOffsetXPx !== 0 || panOffsetPx !== 0;

  const cancelViewReset = useCallback(() => {
    if (resetAnimRef.current) { resetAnimRef.current.stop(); resetAnimRef.current = null; }
    setIsResettingView(false);
  }, []);

  const resetView = useCallback(() => {
    const startX = panXRef.current;
    const startY = panYRef.current;
    const startZoom = zoomRef.current;
    if (Math.abs(startZoom - 1) <= 0.005 && startX === 0 && startY === 0) return; // already default
    if (resetAnimRef.current) resetAnimRef.current.stop();
    setIsResettingView(true);
    // Animate a progress value 1 → 0 and interpolate pan/zoom toward defaults.
    resetAnimRef.current = animate(1, 0, {
      type: 'spring', bounce: 0, duration: 0.6,
      onUpdate: (p) => {
        setPanOffsetXPx(startX * p);
        setPanOffsetPx(startY * p);
        setZoom(1 + (startZoom - 1) * p);
      },
      onComplete: () => { setIsResettingView(false); resetAnimRef.current = null; },
    });
  }, []);
  const [activeHandle, setActiveHandle] = useState<'p1' | 'p2' | null>(null);
  const [hoveredHandle, setHoveredHandle] = useState<'p1' | 'p2' | null>(null);
  const [isSaveModalOpen, setSaveModalOpen] = useState(false);

  const selectPreset = (id: string) => {
    setSelectedPresetId(id);
    const preset = presets.find(p => p.id === id);
    if (preset) {
      setCurveValues([
        preset.bezierValue.cp1.X, preset.bezierValue.cp1.Y,
        preset.bezierValue.cp2.X, preset.bezierValue.cp2.Y,
      ]);
    }
  };

  const saveCustomPreset = () => {
    setSaveModalOpen(true);
  };

  const commitSavePreset = (name: string) => {
    if (!name || name.trim() === '') return;

    const newId = `custom-${Date.now()}`;
    const newPreset: Preset = {
      id: newId,
      title: name.trim(),
      bezierValue: {
        cp1: { X: curveValues[0], Y: curveValues[1] },
        cp2: { X: curveValues[2], Y: curveValues[3] }
      },
      isFavorite: false,
      isLocked: false
    };

    setCustomPresets([...customPresets, newPreset]);
    setSelectedPresetId(newId);
    setSaveModalOpen(false);
  };

  return (
    <PlaygroundContext.Provider value={{
      curveValues, setCurveValues,
      duration, setDuration,
      presets, selectedPresetId, selectPreset, saveCustomPreset, commitSavePreset,
      panOffsetPx, setPanOffsetPx,
      panOffsetXPx, setPanOffsetXPx,
      zoom, setZoom,
      canResetView, isResettingView, resetView, cancelViewReset,
      snapToGrid, setSnapToGrid,
      activeHandle, setActiveHandle,
      hoveredHandle, setHoveredHandle,
      isSaveModalOpen, setSaveModalOpen,
    }}>
      {children}
    </PlaygroundContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePlayground = (): PlaygroundState => {
  const ctx = useContext(PlaygroundContext);
  if (!ctx) throw new Error('usePlayground must be used inside <PlaygroundProvider>');
  return ctx;
};


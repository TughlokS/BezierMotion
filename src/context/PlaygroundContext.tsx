import React, { createContext, useContext, useState } from 'react';
import { useAnimationEngine } from '../hooks/useAnimationEngine';

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
  const [presets, setPresets] = useState<Preset[]>(DEFAULT_PRESETS);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('ease-in-out');

  // Animation engine — writes CSS vars directly, no React state updates per frame
  useAnimationEngine(curveValues, duration);

  const [panOffsetPx, setPanOffsetPx] = useState(0);
  const [snapToGrid, setSnapToGrid] = useState(false);
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

    setPresets(prev => [...prev, newPreset]);
    setSelectedPresetId(newId);
    setSaveModalOpen(false);
  };

  return (
    <PlaygroundContext.Provider value={{
      curveValues, setCurveValues,
      duration, setDuration,
      presets, selectedPresetId, selectPreset, saveCustomPreset, commitSavePreset,
      panOffsetPx, setPanOffsetPx,
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


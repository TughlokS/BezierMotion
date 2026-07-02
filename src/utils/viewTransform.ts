import { DOT_SPACING, BEZIER_UNIT_PX } from '../constants';

// ─────────────────────────────────────────────
//  viewTransform – single source of truth for the
//  world (bezier) → screen (px) mapping shared by the
//  SVG curve overlay and the canvas dot grid.
//
//  X is centred by construction: the curve box is always
//  horizontally centred, so zooming never drifts it left/
//  right by cursor. panX is a manual offset from centre
//  (0 = centred), used only once the curve is wider than
//  the viewport. Y uses a fixed zoom=1 reference + panY so
//  vertical zoom can stay anchored at the cursor.
//
//  Zoom scales pixels-per-unit so the coordinate space
//  expands/contracts (dots & curve spread apart) while
//  render sizes (dot/handle radii) stay literal constants.
// ─────────────────────────────────────────────

export interface ViewParams {
  w: number;
  h: number;
  panX: number;
  panY: number;
  zoom: number;
}

export interface View {
  /** current screen position of bezier (0,0) */
  originX: number;
  originY: number;
  /** px per 1.0 bezier unit at the current zoom */
  unitPx: number;
  /** px between adjacent dots at the current zoom */
  dotPx: number;
  toSx: (bx: number) => number;
  toSy: (by: number) => number;
}

/** Snap a coordinate to the nearest dot-grid line (dots sit at half-spacing phase). */
export const snapToDot = (v: number): number => {
  const phase = DOT_SPACING / 2;
  return phase + DOT_SPACING * Math.round((v - phase) / DOT_SPACING);
};

export function computeView({ w, h, panX, panY, zoom }: ViewParams): View {
  const unitPx = BEZIER_UNIT_PX * zoom;
  const dotPx = DOT_SPACING * zoom;
  // X: horizontally centred; panX offsets from centre (0 = centred).
  const originX = (w - unitPx) / 2 + panX;
  // Y: fixed zoom=1 reference + pan (vertical zoom stays cursor-anchored via panY).
  const originY = snapToDot(h / 2 + BEZIER_UNIT_PX / 2) + panY;
  return {
    originX,
    originY,
    unitPx,
    dotPx,
    toSx: (bx: number) => originX + bx * unitPx,
    toSy: (by: number) => originY - by * unitPx,
  };
}

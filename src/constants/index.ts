// ─────────────────────────────────────────────
//  App-wide Constants
// ─────────────────────────────────────────────

export const APP_NAME = 'CurvedMotion';
export const APP_VERSION = '0.1.0';

// Grid / Bezier coordinate system
// Each dot spacing = 0.1 bezier units  →  DOT_SPACING * 10 = 1 full unit
export const DOT_SPACING    = 40;          // px between dots (at zoom = 1)
export const BEZIER_UNIT_PX = DOT_SPACING * 10; // px per 1.0 bezier unit = 400 (at zoom = 1)

// Scroll-wheel zoom: scales the coordinate space (pixels-per-unit), not the DOM.
export const ZOOM_MIN = 0.5;         // furthest zoom-out
export const ZOOM_MAX = 5.0;         // closest zoom-in
export const ZOOM_SENSITIVITY = 0.0015; // wheel deltaY → exponent for the multiplicative step


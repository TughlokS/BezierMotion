# BezierMotion

A visual cubic-bezier curve editor for crafting custom CSS easing functions. Drag control handles, preview animations in real time, and copy the `cubic-bezier()` value straight to your clipboard.

🔗 **[Live Demo](https://tughloks.github.io/BezierMotion/)**

## Features

- **Interactive curve editor** – drag control points with real-time visual feedback
- **Animation previews** – translate, scale, and opacity panels that animate with your curve
- **Preset library** – common easing functions (ease-in, ease-out, spring, etc.)
- **Copy to clipboard** – one-click copy of the `cubic-bezier()` value
- **Dark / Light theme** – ripple-expand transition from the toggle button
- **Snap to grid** – optional 0.1-unit snapping for precision
- **Y-axis panning** – scroll beyond the 0–1 range for overshoot curves

## Tech Stack

- React 19 + TypeScript
- Vite
- Framer Motion
- CSS custom properties (design tokens)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build
```

## Deploy

The app is deployed to GitHub Pages via the `gh-pages` branch:

```bash
npm run build
npx gh-pages -d dist
```

## License

MIT

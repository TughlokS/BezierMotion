// ─────────────────────────────────────────────
//  App Configuration  (reads from .env via Vite)
//  Access env vars with import.meta.env.VITE_*
// ─────────────────────────────────────────────

const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;

export default config;

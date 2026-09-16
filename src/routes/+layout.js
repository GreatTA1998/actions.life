// Capacitor builds are a locally served SPA (adapter-static + fallback).
// The Vercel web build keeps SSR so the marketing homepage is unchanged.
export const ssr = !import.meta.env.CAPACITOR

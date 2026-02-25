## Cursor Cloud specific instructions

### Overview

**actions.life** is a SvelteKit 2 (Svelte 5) PWA for task/calendar management, backed by Firebase (Firestore, Auth, Storage, Cloud Functions) and deployed to Vercel. See `README.md` for project structure.

### Running the app

- **Dev server:** `npm run dev` (Vite, default port 5173). Use `-- --host 0.0.0.0` for external access.
- **Build:** `npm run build` (uses `@sveltejs/adapter-vercel`).
- **Preview:** `npm run preview` (serves the production build locally).
- **Firebase Functions:** located in `functions/`; install separately with `cd functions && npm install`. Functions are optional for local frontend development.

### Linting / Testing

- No ESLint config file exists at root or in `functions/` (the `functions/package.json` defines a lint script but the `.eslintrc` is absent). Lint is effectively unconfigured.
- No automated test suite exists (`svelte-check` is not configured, no test framework is installed).
- The `functions/` directory has `eslint` + `prettier` as devDependencies but no config file to drive them.

### Environment variables

- `VITE_OPENAI_API_KEY` — optional, enables the AI chat feature.
- The Firebase config is hardcoded in `src/lib/db/init.js`; no `.env` file is needed for basic frontend dev.

### Gotchas

- The project uses **npm** (not pnpm/yarn). Always use `npm install`.
- Node 22 is required (`engines` field in both `package.json` files).
- Build warnings about unused CSS selectors and missing `encoding` module in Firebase SDK are expected and harmless.
- Authentication requires Google Sign-In with the production Firebase project; the landing page (home route) works without auth.

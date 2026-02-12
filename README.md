## Tech Stack
actions.life is a SvelteKit PWA that interfaces with Firebase (Firestore, Storage, Functions), deployed via Vercel.

## Project Structure
- [x] Entry Point – ```src/app.html```
- [x] Root Component – ```src/routes/+layout.svelte```
- [x] Home Page – ```src/routes/(home)/+page.svelte```
- [x] Main Calendar – ```src/routes/[user]/+page.svelte```
- [x] Database Schemas – ```src/lib/db/models```
- [x] Database Helpers – ```src/lib/db/helpers.js```
- [x] Global State – ```src/lib/store/index.js```
- [x] Local State – ```<localized within the folder of affected components>```

## .env
```
OPENAI_API_KEY=from-web-dashboard
```

## Code Quality

Run these before merging changes:

```bash
npm run check
npm run test:unit
npm run build
npm --prefix functions run lint
```

Or use the aggregate command:

```bash
npm run quality
```

CI enforces the same checks via `.github/workflows/code-quality.yml`.

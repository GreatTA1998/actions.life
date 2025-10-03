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

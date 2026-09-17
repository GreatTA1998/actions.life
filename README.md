## Tech Stack
actions.life is a SvelteKit PWA with a Firebase backend (Firestore, Storage, Functions), deployed via Vercel.

## Native (Capacitor POC)

Web deploy is unchanged (`adapter-vercel`). Native builds use `adapter-static` SPA output bundled into the iOS/Android shell — not a remote-URL WebView.

```bash
npm install
npm run build:native   # static SPA → build/ → cap sync
```

Then:

- **iOS** (macOS + Xcode): `npx cap open ios` → pick a simulator or device → Run. Minimum iOS 15. Select a development team locally in Xcode (Signing & Capabilities) — do not commit a team ID.
- **Android** (Android Studio): `npx cap open android` → pick an emulator or device → Run. USB debugging for a physical phone.

Or: `npm run native:ios` / `npm run native:android` (build + sync + open).

On device, confirm: cold start from the home-screen icon (bundled assets, no network required for the shell), airplane mode still shows the app, and photo buttons open the native camera/library prompt.

Native Google Sign-In uses the system browser (Safari View Controller / Chrome Custom Tabs), then an HTTPS callback bounces to `life.actions.app://oauth` so Google never sees the WKWebView user-agent. Web GIS is unchanged.

Production `https://actions.life/auth/callback` is the GIS-registered redirect, but it does **not** bounce yet. Until this PR is on production, a local native build must send Google to the current Vercel preview of this branch.

`$env/dynamic/public` is **not** reliable here: adapter-static often ships an empty `_app/env.js` even after `export PUBLIC_NATIVE_OAUTH_REDIRECT=...`. Vite only inlines the value during `npm run build:native` if it is in a gitignored env file or in the Vite process environment.

```bash
cp .env.example .env.local
# edit .env.local — do not commit it
PUBLIC_NATIVE_OAUTH_REDIRECT=https://actions-2w2365sfg-intentions.vercel.app/auth/callback
npm run build:native
```

`build:native` prints the baked `/auth/callback` URL from `build/` and `ios/App/App/public`. Confirm it is the preview host (or another bounce host), then install **that** app — Xcode Run of a stale `DerivedData` bundle will still open production “Welcome! Preparing your account…”. A one-off shell `export` without `.env.local` is not enough.

That preview URL changes on each Vercel deploy of `cursor/capacitor-native-shell-bb25` — use the latest Preview URL on [PR 176](https://github.com/GreatTA1998/actions.life/pull/176). Google Cloud must allow that exact `redirect_uri`. Safari’s window title **actions.life** is the document `<title>`, not the host.

Hop check after Google returns a code:

1. Preview `/auth/callback` should say **Returning to the app…** and open `life.actions.app://oauth`.
2. The app WebView then loads in-app `/auth/callback` (default copy **Welcome! Preparing your account…**) and exchanges the code.
3. If that exchange fails (`exchangeForTokens`, null `currentUser`, `redirect_uri`, timeout), the page must show the error and **Back to home** — never sit on Welcome forever.

Web GIS (`initCodeClient` when not Capacitor) is unchanged.

After pulling plugin changes on a Mac, run `npx cap sync` (or `pod install` in `ios/App`) so CocoaPods pick up App, Browser, and StatusBar. Select a development team locally in Xcode — do not commit a team ID.

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

`.env` / `.env.local` / `.env.*` are gitignored (`!.env.example`). For Capacitor OAuth against a Vercel preview, put `PUBLIC_NATIVE_OAUTH_REDIRECT` in `.env.local` (see Native section). Production website builds must omit it so the default stays `https://actions.life/auth/callback`.

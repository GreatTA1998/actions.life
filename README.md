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

Native Google Sign-In uses the system browser (Safari View Controller / Chrome Custom Tabs), then `https://actions.life/auth/callback` bounces to `life.actions.app://oauth` so Google never sees the WKWebView user-agent. Web GIS is unchanged. That bounce must be live on actions.life (this PR deployed) for simulator sign-in to finish. After pulling plugin changes on a Mac, run `npx cap sync` (or `pod install` in `ios/App`) so CocoaPods pick up App, Browser, and StatusBar.

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

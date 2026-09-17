# actions.life (Expo)

Native iOS + Android client for [actions.life](https://actions.life). Separate TypeScript/React Native codebase — it does not share modules with the SvelteKit app under `src/`.

This is slice 1: inbox + day calendar, nested subtasks, task detail, local create/complete/nest/schedule, and offline persistence. Live Google Sign-In waits on Firebase iOS/Android app registration.

## Run

```bash
cd mobile
npm install
npx expo start
```

- iOS: `npx expo run:ios` (Mac) or Expo Go for the guest path
- Android: `npx expo start --android` / `npx expo run:android`
- Tests (no simulator): `npm test`

Guest sign-in works with no network. Google/Apple need a development build plus OAuth clients.

## What Elton should try

1. Continue as guest (airplane mode is fine).
2. Inbox shows the TO-DO and Visa timeline trees; today has a calendar block.
3. Add a task, nest a subtask (⋯ → Add subtask / Indent / Outdent), complete with the checkbox.
4. Open a task, give it a date + time, confirm it appears on that day and stays on the inbox.
5. Force-quit and reopen: the same data is still there.

Do not use production `https://actions.life/auth/callback` for Google. Native Google Sign-In uses the app’s OAuth clients / `actionslife://` redirect only.

## Config still needed for live Google

1. Firebase project `project-y-2a061`: add iOS and Android apps with bundle/package `life.actions.expo`.
2. Google Cloud OAuth clients for those apps (not the web GIS client).
3. Set `extra.googleIosClientId` / `extra.googleAndroidClientId` in `app.json` (or EAS secrets) and drop `GoogleService-Info.plist` / `google-services.json` into the project.
4. Firestore named database remains `schema-compliant`. Sync drain is stubbed until that wiring exists.

## Layout

Calendar on top, inbox below, matching the web compact layout. Structured mode (scheduled tasks stay on the list).

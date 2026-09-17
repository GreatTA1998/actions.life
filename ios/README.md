# actions.life for iOS

Native SwiftUI client for the existing Firebase project. It does not share code with the SvelteKit app in `src/`.

## Open

1. On a Mac, open `ios/ActionsLife.xcodeproj` in Xcode 16+.
2. Select the **ActionsLife** scheme and an iPhone simulator.
3. Run. Guest sign-in works with no network and no Firebase plist.

## Firebase / Google Sign-In

Live Google Sign-In waits on an iOS app in Firebase project `project-y-2a061`:

1. Register bundle ID `life.actions.ios`.
2. Add `GoogleService-Info.plist` to `ios/ActionsLife/` (the folder-synced target picks it up).
3. Set the reversed client ID as a URL scheme (`GOOGLE_REVERSED_CLIENT_ID` / `GOOGLE_CLIENT_ID` in build settings).
4. Firestore must use the named database `schema-compliant`.

Until that plist is present, the app stays local-first: SwiftData inbox + calendar, nested tasks, and session restore from the Keychain.

## Slice 1

- Guest (anonymous), Google, and Apple sign-in UI. Google is wired to `GIDSignIn` → Firebase Auth.
- Home: calendar above, inbox below, resizable split.
- Task detail sheet: name, notes, date, time, duration, subtasks, archive, delete.
- Local create / complete / nest / schedule persist across relaunch with no network.

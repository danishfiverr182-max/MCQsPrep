# preppk-mobile

Expo (managed workflow) React Native app for PrepPk, JavaScript (not TypeScript),
mirroring the `client/src/` structure of the existing web app.

## Setup

```bash
npm install
cp .env.example .env   # edit if you need to point at a different backend
npx expo start
```

Then press `a` (Android emulator), `i` (iOS simulator, macOS only), or scan the
QR code with the Expo Go app on your phone.

> `node_modules/` is not included in this archive to keep it small — run
> `npm install` first. `package-lock.json` pins the exact versions that were
> installed and verified (bundled successfully with Metro, 0 errors).

## Stack

- Expo SDK 54, React 19.1, React Native 0.81
- React Navigation (native-stack + bottom-tabs)
- axios for API calls
- expo-secure-store for token storage
- expo-splash-screen (config plugin — placeholder emerald splash/icon, see "Branding" below)
- expo-constants for reading resolved config at runtime

## Environment / backend URL

`app.config.js` replaces the static `app.json` and resolves `API_BASE_URL`
from environment variables (see `.env.example`), embedding the result into
`extra.apiBaseUrl` in the app config. `src/utils/config.js` reads that back
out via `expo-constants` — import `API_BASE_URL` from there anywhere you need
it, rather than reading `expo-constants` directly.

Resolution order:
1. `API_BASE_URL` — explicit override, always wins if set
2. `API_BASE_URL_DEV` / `API_BASE_URL_PROD` — picked based on `APP_ENV`
3. hardcoded fallback (`127.0.0.1:5000` dev / the Railway URL prod)

Changing `.env` requires an `expo start` restart — it's only read once at
config-evaluation time, not hot-reloaded. `HomeScreen` prints
`APP_ENV`/`API_BASE_URL` to the console and shows them on screen, so you can
confirm the switch worked.

## API layer

`src/api/axios.js` exports a configured axios instance (`baseURL:
${API_BASE_URL}/api`), mirroring the interceptor pattern from the web
client's `client/src/api/axios.js` but adapted for token-header auth instead
of cookies (RN has no automatic cookie jar):

- **Request interceptor**: placeholder only for now — real token
  attachment (`Authorization: Bearer <token>` from `expo-secure-store`)
  lands in Part 3 once `AuthContext` exists.
- **Response interceptor**: logs `401`/`403` responses to the console for
  now; real handling (clear stored token, redirect to Login) also lands in
  Part 3.

No other API modules exist yet — don't call `api` directly from screens
until the real endpoint wrappers are built.

## Error handling

`src/components/ErrorBoundary.js` wraps the entire app (around
`NavigationContainer` in `App.js`) so an unhandled render error anywhere in
the tree shows a "Something went wrong" fallback with a "Try Again" button
instead of a blank white screen. Note the usual React error-boundary
limits: it only catches render/lifecycle errors in the tree below it, not
errors in event handlers or async code (those still need their own
try/catch at the source).

## Branding

`icon.png`, `splash-icon.png`, `favicon.png`, and the Android adaptive icon
set in `assets/` are **temporary placeholders** — a plain emerald green
(`#10B981`, matching the web client's brand accent) square with "PK"
initials. Final branded assets land in Part 10; swap them out then rather
than treating the current ones as final.

Note: Expo Go shows your app icon in place of the actual splash screen
(this has been true since SDK 52) — to see the real configured splash
screen you need a dev or production build, not Expo Go.

## Platform notes

See `NOTES.md` at the project root for cross-platform findings (Android
emulator vs iOS Simulator vs physical device networking, safe-area status,
hardware back button behavior) — worth a skim before testing on a second
platform for the first time.

## Navigation

- `src/navigation/RootNavigator.js` — top-level stack that switches between
  the Auth flow and the Main App flow. Currently driven by a **temporary**
  local `isAuthenticated` boolean (real auth check via `expo-secure-store` /
  `AuthContext` lands in Part 3) — toggle it via the "Simulate Login" button
  on the Login screen or "Simulate Logout" on the Account screen.
- `src/navigation/AuthNavigator.js` — stack with a placeholder Login screen.
- `src/navigation/MainTabNavigator.js` — bottom tabs: Home, Categories,
  Results, Account, with emoji placeholders for icons (real icon set comes
  in Part 4). The Categories and Results tabs each render a nested stack
  navigator rather than a single screen (see below), so they can push
  deeper screens while still showing a native back button/swipe.
- `src/navigation/CategoryStackNavigator.js` — nested inside the Categories
  tab: `CategoryList` → `TestList` → `TestStart` → `TestTaking`.
- `src/navigation/ResultsStackNavigator.js` — nested inside the Results tab:
  `ResultsList` → `ResultDetail`.

Every screen is a bare placeholder (`src/components/ui/PlaceholderScreen.js`)
rendering its own name, with `src/components/ui/NavButton.js` buttons where a
screen needs to push the next one in its flow. Full list of routes:

| Screen | File |
|---|---|
| Login | `screens/auth/LoginScreen.js` |
| Home | `screens/home/HomeScreen.js` |
| Category List | `screens/category/CategoryListScreen.js` |
| Test List | `screens/category/TestListScreen.js` |
| Test Start | `screens/test/TestStartScreen.js` |
| Test Taking | `screens/test/TestTakingScreen.js` |
| Results | `screens/results/ResultsScreen.js` |
| Result Detail | `screens/results/ResultDetailScreen.js` |
| Account | `screens/account/AccountScreen.js` |

Tap through to check it: Login → Simulate Login → Categories tab → View
Tests → Start Test → Begin Test lands on Test Taking, with a working native
back button/swipe at every step back to Categories. Same for Results → View
Result Detail.

## Folder structure

```
mobile/
  NOTES.md          # cross-platform findings (see "Platform notes" above)
  README.md         # this file
  App.js            # root component: ErrorBoundary > NavigationContainer > RootNavigator
  app.config.js      # dynamic config (env resolution, icon/splash, plugins)
  src/
    api/
      axios.js      # configured axios instance (see "API layer" above)
    components/
      ErrorBoundary.js
      ui/           # shared/reusable UI primitives (PlaceholderScreen, NavButton)
    screens/
      auth/
      home/
      category/
      test/
      results/
      account/
    navigation/     # navigators (stack, tabs)
    context/        # React context providers (auth, theme, etc.) — empty until Part 3
    theme/          # colors, typography, spacing tokens — empty until later parts
    utils/
      config.js     # single source of truth for reading expo-constants `extra`
    assets/         # images, fonts, etc.
```

Each empty folder has a placeholder `index.js` (or `.gitkeep` for `assets/`)
just so git tracks the folder — delete the placeholder once you add real
files there.

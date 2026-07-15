# Cross-Platform Notes (Prompt 1.9)

## How this was checked

This pass was done as a **code-level review**, not a live run on an Android
emulator / iOS simulator — the environment used to build this part doesn't
have a device or emulator attached. The three "done when" items (navigation,
axios test call, icon/splash) were traced through the code on both
platforms' code paths to catch anything that would visibly differ or break.
**Before moving on, actually run `npx expo start` and open the app in Expo
Go (or a simulator) on both platforms once — this review narrows down what
to look at, it doesn't replace doing it.**

Quick way to do that live check:
```
npx expo start
```
Then press `a` for Android (emulator must already be running, or scan the QR
in Expo Go on a physical device) or `i` for iOS (Mac only), or scan the QR
with Expo Go on a physical device of either platform.

## Findings

### 1. API_BASE_URL differs by *how* you run it, not by OS

This is the one that will actually bite if skipped. `127.0.0.1` means a
different machine depending on where the app is running:

| Target                     | What `127.0.0.1` resolves to | What to use instead        |
|-----------------------------|-------------------------------|-----------------------------|
| iOS Simulator               | Your host machine (works fine) | `127.0.0.1` — no change needed |
| Android Emulator             | The emulator itself, not your host | `10.0.2.2` (Android's built-in host alias) |
| Physical device (either OS), Expo Go | The phone itself | Your machine's LAN IP (e.g. `192.168.1.x`) |

`.env.example` already documents this (now updated with the Android-emulator
case specifically) via `API_BASE_URL_DEV`. If the Prompt 1.6 axios smoke
test logs a network error on Android emulator but works fine on iOS
Simulator, this is almost certainly why — it's not a platform bug, just a
loopback-address mismatch.

### 2. Safe area insets aren't wired up yet

`react-native-safe-area-context` is already a dependency, but nothing in
`App.js` or any screen currently uses `SafeAreaProvider` / `SafeAreaView` /
`useSafeAreaInsets`. Right now this mostly reads fine because:
- The tab/stack navigators from `@react-navigation` handle safe areas for
  their own headers and tab bar automatically.
- Plain screens (`HomeScreen`, `LoginScreen`, etc.) are simple centered
  content, so there's nothing pinned to the very top/bottom edge yet.

Where this **will** start to matter: any screen with content pinned to the
top edge under a `headerShown: false` navigator (the outer `RootNavigator`
and `MainTabNavigator` both set this), especially on notched iPhones
(Dynamic Island / notch) or Android devices with a cutout/gesture bar.
Worth wrapping the app in `SafeAreaProvider` once real screen content
(forms, lists with sticky headers, etc.) starts landing in Part 2+.

### 3. Android hardware back button

Nested stacks (`CategoryStackNavigator`, `ResultsStackNavigator`) render
with `headerShown: true`, so React Navigation wires up both the header back
arrow and the Android hardware back button automatically — no extra code
needed for basic back navigation, and this behaves the same on both
platforms.

One thing to flag for later (not a bug now, since there's no real test-taking
logic yet): once `TestTakingScreen` has an actual in-progress test, the
Android hardware back button will call the default `goBack()` with no
confirmation, unlike iOS which only has the header back button (no
hardware back gesture equivalent that bypasses a confirmation prompt as
easily). Part 4/5 should intercept the hardware back button on that screen
specifically (`BackHandler` or a `beforeRemove` navigation listener) so
users can't accidentally lose an in-progress test on Android.

### 4. Splash screen preview limitation (carried over from Prompt 1.7)

Already noted when the splash config was added: Expo Go shows the app
*icon* while the splash config is active, not the actual configured splash
screen — this is expected Expo Go behavior since SDK 52, not a bug in this
project. The real splash screen only renders in a dev build or production
build. Both icon and splash assets were still visually confirmed to be the
new emerald PrepPk placeholder (not the default Expo icon) when previewed
in Expo Go.

### 5. Everything else

Navigation flow (Auth ↔ Main App tabs ↔ nested stacks), the `ErrorBoundary`
fallback, and the axios instance itself are plain JS/React Navigation
behavior with no OS-specific branching in the code — nothing else platform
-specific was found at the code level.

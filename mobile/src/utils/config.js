// src/utils/config.js
//
// Resolves values that app.config.js computed from environment variables
// (see app.config.js + .env.example) and exposes them for use anywhere in
// the app. This is the ONLY place that should read from Constants — every
// other file should import from here instead of touching expo-constants
// directly, so there's a single source of truth if the resolution logic
// ever changes.

import Constants from "expo-constants";

// `expoConfig` is the modern field (SDK 49+). `manifest` is kept as a
// fallback for older/edge runtime cases (e.g. some standalone builds).
const extra =
  Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {};

export const APP_ENV = extra.appEnv ?? "development";
export const API_BASE_URL = extra.apiBaseUrl ?? "http://127.0.0.1:5000";

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log(`[config] APP_ENV=${APP_ENV} API_BASE_URL=${API_BASE_URL}`);
}

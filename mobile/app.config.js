const APP_ENV = process.env.APP_ENV || process.env.NODE_ENV || "development";

const DEFAULTS = {
  development: "http://127.0.0.1:5000",
  production: "https://preppak-production.up.railway.app",
};

const API_BASE_URL =
  process.env.API_BASE_URL ||
  (APP_ENV === "production"
    ? process.env.API_BASE_URL_PROD || DEFAULTS.production
    : process.env.API_BASE_URL_DEV || DEFAULTS.development);

export default ({ config }) => ({
  ...config,
  name: "preppk-mobile",
  slug: "preppk-mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",

  // Prompt 1.7: temporary placeholder branding (emerald green, matches the
  // web client's brand accent color #10B981 — see StatsBar.jsx). Swap for
  // final production assets in Part 10.
  plugins: [
    "expo-secure-store",
    [
      "expo-splash-screen",
      {
        image: "./assets/splash-icon.png",
        imageWidth: 220,
        resizeMode: "contain",
        backgroundColor: "#10B981",
      },
    ],
  ],

  ios: {
    supportsTablet: true,
  },

  android: {
    adaptiveIcon: {
      backgroundColor: "#10B981",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
  },

  web: {
    favicon: "./assets/favicon.png",
  },

  extra: {
    appEnv: APP_ENV,
    apiBaseUrl: API_BASE_URL,
  },
});
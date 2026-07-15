import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import RootNavigator from "./src/navigation/RootNavigator";
import ErrorBoundary from "./src/components/ErrorBoundary";
import api from "./src/api/axios";

export default function App() {
  useEffect(() => {
    // TEMP (Prompt 1.6 smoke test) — confirms the axios instance is wired up
    // correctly against a known public endpoint. Safe to delete once real
    // API modules start calling `api` for their own screens.
    if (__DEV__) {
      api
        .get("/categories")
        .then((res) => {
          // eslint-disable-next-line no-console
          console.log("[axios smoke test] GET /api/categories ->", res.status, res.data);
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log("[axios smoke test] GET /api/categories failed ->", err.message);
        });
    }
  }, []);

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <StatusBar style="auto" />
        <RootNavigator />
      </NavigationContainer>
    </ErrorBoundary>
  );
}

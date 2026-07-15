import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { API_BASE_URL, APP_ENV } from "../../utils/config";

// Placeholder — real dashboard content comes later. The debug box below
// exists to make Prompt 1.3's "done when" condition easy to verify:
// change .env, restart `expo start`, and this value should change too.
export default function HomeScreen() {
  useEffect(() => {
    console.log(`[HomeScreen] APP_ENV=${APP_ENV} API_BASE_URL=${API_BASE_URL}`);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Placeholder — real content comes later.</Text>

      <View style={styles.debugBox}>
        <Text style={styles.debugLabel}>APP_ENV</Text>
        <Text style={styles.debugValue}>{APP_ENV}</Text>
        <Text style={styles.debugLabel}>API_BASE_URL</Text>
        <Text style={styles.debugValue}>{API_BASE_URL}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { color: "#666" },
  debugBox: {
    marginTop: 24,
    width: "100%",
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  debugLabel: { marginTop: 8, fontSize: 12, color: "#94a3b8" },
  debugValue: { fontSize: 14, fontWeight: "600" },
});

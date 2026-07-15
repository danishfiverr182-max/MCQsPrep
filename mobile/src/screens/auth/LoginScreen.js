import { Pressable, StyleSheet, Text, View } from "react-native";

// Placeholder — the real login form (email/password, validation, API call)
// lands in Part 3 once AuthContext exists. For now `onLogin` is a temporary
// callback wired up by RootNavigator so we can manually confirm the Auth
// and Main App navigators both render correctly.
export default function LoginScreen({ onLogin }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>
        Placeholder screen — real form comes in Part 3.
      </Text>

      <Pressable style={styles.button} onPress={onLogin}>
        <Text style={styles.buttonText}>Simulate Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { color: "#666", textAlign: "center" },
  button: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});

import { Pressable, StyleSheet, Text, View } from "react-native";

// Placeholder — real account/profile screen (premium status, expiry,
// logout wired to AuthContext) comes in Part 3. `onLogout` is a temporary
// callback wired up by RootNavigator so we can manually flip back to the
// Auth flow to confirm both navigators render correctly.
export default function AccountScreen({ onLogout }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.subtitle}>
        Placeholder screen — real content comes in Part 3.
      </Text>

      <Pressable style={styles.button} onPress={onLogout}>
        <Text style={styles.buttonText}>Simulate Logout</Text>
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
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});

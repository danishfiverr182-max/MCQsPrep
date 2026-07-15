import { StyleSheet, Text, View } from "react-native";

// Shared shell for the placeholder screens created in Prompt 1.5. Renders a
// title, an optional subtitle, and lets each screen drop in its own
// navigation buttons as children. Swap this out screen-by-screen for real
// content in later prompts — no need to touch the others when you do.
export default function PlaceholderScreen({ title, subtitle, children }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children ? <View style={styles.actions}>{children}</View> : null}
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
  subtitle: { color: "#666", textAlign: "center" },
  actions: { marginTop: 16, gap: 12, width: "100%", alignItems: "center" },
});

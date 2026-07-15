import { StyleSheet, Text, View } from "react-native";

// Placeholder — real category list (default + custom categories, fetched
// from GET /api/categories) comes in a later prompt.
export default function CategoriesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>
      <Text style={styles.subtitle}>Placeholder — real content comes later.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { color: "#666", marginTop: 4 },
});

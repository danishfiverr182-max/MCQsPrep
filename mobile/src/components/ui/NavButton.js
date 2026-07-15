import { Pressable, StyleSheet, Text } from "react-native";

export default function NavButton({ label, onPress, variant = "primary" }) {
  return (
    <Pressable
      style={[styles.button, variant === "danger" && styles.buttonDanger]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 200,
    alignItems: "center",
  },
  buttonDanger: { backgroundColor: "#dc2626" },
  buttonText: { color: "#fff", fontWeight: "600" },
});

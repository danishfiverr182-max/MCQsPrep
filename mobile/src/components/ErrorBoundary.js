/**
 * src/components/ErrorBoundary.js
 *
 * Catches any unhandled render/lifecycle error anywhere below it in the
 * component tree and shows a simple fallback UI instead of a blank white
 * screen / hard crash. This is a class component because
 * `componentDidCatch` / `getDerivedStateFromError` have no hook equivalent
 * in React (error boundaries must be classes).
 *
 * Note: error boundaries only catch errors thrown during render, in
 * lifecycle methods, and in constructors of the tree below them. They do
 * NOT catch errors inside event handlers, async code (e.g. a rejected
 * promise in a button's onPress), or errors thrown in the boundary itself.
 * Those still need their own try/catch — this is a last-resort safety net,
 * not a replacement for handling expected errors at the source.
 */

import { Component } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // TODO Part 3+: wire this into real crash reporting (e.g. Sentry) once
    // that's set up. For now just log so it's visible during development.
    // eslint-disable-next-line no-console
    console.log("[ErrorBoundary] caught an error:", error, errorInfo?.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            An unexpected error occurred. You can try again below.
          </Text>

          {__DEV__ && this.state.error ? (
            <Text style={styles.debugMessage}>{String(this.state.error.message || this.state.error)}</Text>
          ) : null}

          <TouchableOpacity style={styles.button} onPress={this.handleRetry} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  emoji: { fontSize: 40, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "700", color: "#1a1a2e", textAlign: "center" },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  debugMessage: {
    marginTop: 16,
    fontSize: 12,
    color: "#b71c1c",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  button: {
    marginTop: 24,
    backgroundColor: "#10B981",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

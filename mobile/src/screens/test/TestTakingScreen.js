import PlaceholderScreen from "../../components/ui/PlaceholderScreen";

// Placeholder — the real test-taking UI (timer, question navigator,
// keyboard shortcuts, mobile drawer, MCQ options) comes in a later prompt.
// End of the Categories stack flow for now; back navigation (header back
// button / swipe / hardware back on Android) returns to TestStart.
export default function TestTakingScreen() {
  return (
    <PlaceholderScreen
      title="TestTakingScreen"
      subtitle="Placeholder — real test-taking UI comes later."
    />
  );
}

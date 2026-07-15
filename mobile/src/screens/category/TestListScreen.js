import NavButton from "../../components/ui/NavButton";
import PlaceholderScreen from "../../components/ui/PlaceholderScreen";

// Placeholder — real test list for a chosen category (default sections,
// free mock sections, custom tests) comes in a later prompt.
export default function TestListScreen({ navigation }) {
  return (
    <PlaceholderScreen
      title="TestListScreen"
      subtitle="Placeholder — real test list comes later."
    >
      <NavButton
        label="Start Test"
        onPress={() => navigation.navigate("TestStart")}
      />
    </PlaceholderScreen>
  );
}

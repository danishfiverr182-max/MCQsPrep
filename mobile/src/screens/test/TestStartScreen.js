import NavButton from "../../components/ui/NavButton";
import PlaceholderScreen from "../../components/ui/PlaceholderScreen";

// Placeholder — real pre-test screen (instructions, section breakdown,
// timer info, "Begin" gate) comes in a later prompt.
export default function TestStartScreen({ navigation }) {
  return (
    <PlaceholderScreen
      title="TestStartScreen"
      subtitle="Placeholder — real pre-test instructions come later."
    >
      <NavButton
        label="Begin Test"
        onPress={() => navigation.navigate("TestTaking")}
      />
    </PlaceholderScreen>
  );
}

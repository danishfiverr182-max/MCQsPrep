import NavButton from "../../components/ui/NavButton";
import PlaceholderScreen from "../../components/ui/PlaceholderScreen";

// Placeholder — real results list (past TestResult docs, scores, review
// links) comes in a later prompt. First screen in the Results tab's nested
// stack: Results -> ResultDetail.
export default function ResultsScreen({ navigation }) {
  return (
    <PlaceholderScreen
      title="ResultsScreen"
      subtitle="Placeholder — real results list comes later."
    >
      <NavButton
        label="View Result Detail"
        onPress={() => navigation.navigate("ResultDetail")}
      />
    </PlaceholderScreen>
  );
}

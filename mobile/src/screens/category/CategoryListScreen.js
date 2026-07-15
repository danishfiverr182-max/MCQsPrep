import NavButton from "../../components/ui/NavButton";
import PlaceholderScreen from "../../components/ui/PlaceholderScreen";

// Placeholder — real category list (default + custom categories, fetched
// from GET /api/categories) comes in a later prompt. First screen in the
// Categories tab's nested stack: CategoryList -> TestList -> TestStart ->
// TestTaking.
export default function CategoryListScreen({ navigation }) {
  return (
    <PlaceholderScreen
      title="CategoryListScreen"
      subtitle="Placeholder — real category list comes later."
    >
      <NavButton
        label="View Tests"
        onPress={() => navigation.navigate("TestList")}
      />
    </PlaceholderScreen>
  );
}

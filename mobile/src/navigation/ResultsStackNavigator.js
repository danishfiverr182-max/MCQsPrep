import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ResultDetailScreen from "../screens/results/ResultDetailScreen";
import ResultsScreen from "../screens/results/ResultsScreen";

const Stack = createNativeStackNavigator();

// Nested inside the "Results" tab (see MainTabNavigator). Headers are shown
// here so the native back button/swipe works: Results -> ResultDetail.
export default function ResultsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="ResultsList"
        component={ResultsScreen}
        options={{ title: "Results" }}
      />
      <Stack.Screen
        name="ResultDetail"
        component={ResultDetailScreen}
        options={{ title: "Result Detail" }}
      />
    </Stack.Navigator>
  );
}

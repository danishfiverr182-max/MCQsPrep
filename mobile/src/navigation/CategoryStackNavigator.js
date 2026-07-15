import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CategoryListScreen from "../screens/category/CategoryListScreen";
import TestListScreen from "../screens/category/TestListScreen";
import TestStartScreen from "../screens/test/TestStartScreen";
import TestTakingScreen from "../screens/test/TestTakingScreen";

const Stack = createNativeStackNavigator();

// Nested inside the "Categories" tab (see MainTabNavigator). Headers are
// shown here (unlike the outer navigators) so the native back button/swipe
// works at every level: CategoryList -> TestList -> TestStart -> TestTaking.
export default function CategoryStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="CategoryList"
        component={CategoryListScreen}
        options={{ title: "Categories" }}
      />
      <Stack.Screen
        name="TestList"
        component={TestListScreen}
        options={{ title: "Tests" }}
      />
      <Stack.Screen
        name="TestStart"
        component={TestStartScreen}
        options={{ title: "Start Test" }}
      />
      <Stack.Screen
        name="TestTaking"
        component={TestTakingScreen}
        options={{ title: "Test" }}
      />
    </Stack.Navigator>
  );
}

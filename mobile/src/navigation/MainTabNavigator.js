import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

import AccountScreen from "../screens/account/AccountScreen";
import HomeScreen from "../screens/home/HomeScreen";
import CategoryStackNavigator from "./CategoryStackNavigator";
import ResultsStackNavigator from "./ResultsStackNavigator";

const Tab = createBottomTabNavigator();

// Text-glyph placeholders — swap for a real icon set (e.g.
// @expo/vector-icons) in Part 4.
const TAB_ICONS = {
  Home: "🏠",
  Categories: "📚",
  Results: "📊",
  Account: "👤",
};

function TabIcon({ routeName, color }) {
  return <Text style={{ fontSize: 20, color }}>{TAB_ICONS[routeName]}</Text>;
}

export default function MainTabNavigator({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color }) => (
          <TabIcon routeName={route.name} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoryStackNavigator} />
      <Tab.Screen name="Results" component={ResultsStackNavigator} />
      <Tab.Screen name="Account">
        {(props) => <AccountScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

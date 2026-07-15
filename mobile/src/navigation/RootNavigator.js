import { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthNavigator from "./AuthNavigator";
import MainTabNavigator from "./MainTabNavigator";

const RootStack = createNativeStackNavigator();

// TEMPORARY: the real auth check (token in expo-secure-store, AuthContext,
// etc.) lands in Part 3. For now `isAuthenticated` is local state you can
// flip via the "Simulate Login" / "Simulate Logout" buttons on the
// placeholder Login/Account screens, to manually confirm both the Auth
// flow and the Main App flow render correctly.
export default function RootNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="MainApp">
          {() => (
            <MainTabNavigator onLogout={() => setIsAuthenticated(false)} />
          )}
        </RootStack.Screen>
      ) : (
        <RootStack.Screen name="Auth">
          {() => <AuthNavigator onLogin={() => setIsAuthenticated(true)} />}
        </RootStack.Screen>
      )}
    </RootStack.Navigator>
  );
}

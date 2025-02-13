import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WelcomeScreen from "./screens/WelcomeScreen"; // Correct import path
import SignInScreen from "./screens/SignInScreen"; // Correct import path
import SignUpScreen from "./screens/SignUpScreen"; // Correct import path
import DashboardScreen from "./screens/DashboardScreen"; // Correct import path
import ActivityTrackerScreen from './screens/ActivityTrackerScreen'; // Import your screen
import WorkoutLogScreen from './screens/WorkoutLogScreen';
import NutritionTrackerScreen from "./screens/NutritionTrackerScreen";
import ProfileScreen from "./screens/ProfileScreen"; // Import your screen


// Define RootStackParamList for navigation types
export type RootStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Dashboard: undefined;
  ActivityTracker: undefined;
  WorkoutLog: undefined;
  NutritionTracker: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>(); // Using the param list for type safety

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }} // Hide header for Welcome screen
        />
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ title: "Sign In" }} // Customize screen title
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ title: "Sign Up" }} // Customize screen title
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: "Dashboard" }} // Customize screen title
        />
        <Stack.Screen name="ActivityTracker" component={ActivityTrackerScreen} />
        <Stack.Screen name="WorkoutLog" component={WorkoutLogScreen} />
        <Stack.Screen name="NutritionTracker" component={NutritionTrackerScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

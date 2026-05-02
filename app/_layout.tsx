import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { View } from "react-native";

const LimitlessTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#000000",
    card: "#00000a",
    text: "#ffffff",
    border: "#2e2e2e",
  },
};

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#00000a" }}>
      <ThemeProvider value={LimitlessTheme}>
        <Stack>
          <Stack.Screen
            name="sign-in"
            options={{ title: "Log In", headerShown: false }}
          />
          <Stack.Screen
            name="sign-up"
            options={{ title: "Sign Up", headerShown: false }}
          />
          <Stack.Screen
            name="App"
            options={{ title: "Main", headerShown: false }}
          />

          <Stack.Screen
            name="screens/home-screen"
            options={{ title: "Home", headerShown: false }}
          />
          <Stack.Screen
            name="screens/workout-screen"
            options={{ title: "Workout", headerShown: false }}
          />
          <Stack.Screen
            name="screens/logger-screen"
            options={{ title: "Logger", headerShown: false }}
          />
          <Stack.Screen
            name="screens/chatbot-screen"
            options={{ title: "Chatbot", headerShown: false }}
          />
          <Stack.Screen
            name="screens/profile-screen"
            options={{ title: "Profile", headerShown: false }}
          />

          <Stack.Screen
            name="screens/logger/workout-log"
            options={{ title: "Workout Log", headerShown: false }}
          />
          <Stack.Screen
            name="screens/logger/nutrition-log"
            options={{ title: "Nutrition Log", headerShown: false }}
          />
          <Stack.Screen
            name="screens/logger/weight-log"
            options={{ title: "Weight Log", headerShown: false }}
          />
          <Stack.Screen
            name="screens/logger/water-log"
            options={{ title: "Water Log", headerShown: false }}
          />
          <Stack.Screen
            name="screens/logger/photos-log"
            options={{ title: "Photos Log", headerShown: false }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </View>
  );
}

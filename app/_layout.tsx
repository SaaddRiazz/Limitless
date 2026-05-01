import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
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
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

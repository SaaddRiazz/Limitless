import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/context/auth";
import { useColorScheme } from "@/hooks/use-color-scheme";

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "sign-in" || segments[0] === "sign-up";

    if (!session && !inAuthGroup) {
      // Redirect to sign-in if not logged in
      router.replace("/sign-in");
    } else if (session && (inAuthGroup || !segments[0])) {
      // Redirect to main app if logged in and at root or auth screens
      router.replace("/App");
    }
  }, [session, isLoading, segments]);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
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
        name="screens/chat-screen"
        options={{ title: "AI Trainer", headerShown: false }}
      />
      <Stack.Screen
        name="screens/profile-screen"
        options={{ title: "Profile", headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

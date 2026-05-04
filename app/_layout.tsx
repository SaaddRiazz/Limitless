import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/context/auth";
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

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "sign-in" || segments[0] === "sign-up";
    const isSplash = segments[0] === "splash";

    if (isSplash) return;

    if (!session && !inAuthGroup) {
      router.replace("/sign-in");
    } else if (session && inAuthGroup) {
      router.replace("/App");
    }
  }, [session, isLoading, segments]);

  return (
    <Stack
      screenOptions={{ headerShown: false }}
      initialRouteName="index"
    >
      <Stack.Screen name="splash" />
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-in" options={{ title: "Log In" }} />
      <Stack.Screen name="sign-up" options={{ title: "Sign Up" }} />
      <Stack.Screen name="App" options={{ title: "Main" }} />

      <Stack.Screen name="screens/home-screen" />
      <Stack.Screen name="screens/workout-screen" />
      <Stack.Screen name="screens/logger-screen" />
      <Stack.Screen name="screens/chat-screen" />
      <Stack.Screen name="screens/profile-screen" />
      <Stack.Screen name="screens/logger/workout-log" />
      <Stack.Screen name="screens/logger/nutrition-log" />
      <Stack.Screen name="screens/logger/weight-log" />
      <Stack.Screen name="screens/logger/water-log" />
      <Stack.Screen name="screens/logger/photos-log" />

      <Stack.Screen name="screens/tracking/track-workout" />
      <Stack.Screen name="screens/tracking/add-workout-plan" />
      <Stack.Screen name="screens/tracking/edit-workout-plan" />

      <Stack.Screen name="screens/admin/dashboard" />
      <Stack.Screen name="screens/admin/global-workouts-master" />
      <Stack.Screen name="screens/admin/add-global-workout" />
      <Stack.Screen name="screens/admin/edit-global-workout" />
      <Stack.Screen name="screens/admin/add-global-exercise" />
      <Stack.Screen name="screens/admin/community-screen" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#00000a" }}>
      <AuthProvider>
        <ThemeProvider value={LimitlessTheme}>
          <RootLayoutNav />
          <StatusBar style="light" />
        </ThemeProvider>
      </AuthProvider>
    </View>
  );
}

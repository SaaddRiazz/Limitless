import { useAuth } from "@/context/auth";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { main } from "../styles/style";

export default function Index() {
  const { session, isLoading } = useAuth();

  // Show a loading screen while checking for the session
  if (isLoading) {
    return (
      <View style={[main.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  // Redirect based on session status
  if (session) {
    return <Redirect href="/App" />;
  } else {
    return <Redirect href="/sign-in" />;
  }
}

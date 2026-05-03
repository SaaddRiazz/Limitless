import { useAuth } from "@/context/auth";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { main } from "../styles/style";

export default function Index() {
  const { session, isLoading } = useAuth();

  // Show a loading screen while checking for the session
  if (isLoading) {
    return (
      <View style={[main.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "#fff", fontSize: 42, fontWeight: "900", letterSpacing: 8 }}>LIMITLESS</Text>
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

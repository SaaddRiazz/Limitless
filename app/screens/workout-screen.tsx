import React from "react";
import { ScrollView, Text } from "react-native";
import { main } from "../../styles/style";

export default function WorkoutScreen() {
  return (
    <ScrollView style={main.container}>
      <Text style={main.headerTitle}>WORKOUTS</Text>
    </ScrollView>
  );
}

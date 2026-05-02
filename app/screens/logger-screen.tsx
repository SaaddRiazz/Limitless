import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text } from "react-native";
import LoggerCard from "../../components/ui/logger-card";
import { main } from "../../styles/style";

export default function LoggerScreen() {
  const router = useRouter();
  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 65,
      }}
      style={main.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[main.headerTitle, { marginBottom: 30, marginTop: 20 }]}>
        LOGGER
      </Text>

      <LoggerCard
        title="Workout"
        subtitle="Log sets, reps & weight"
        icon="dumbbell"
        hexColor="#2196F3"
        onPress={() => router.push("/screens/logger/workout-log")}
      />

      <LoggerCard
        title="Nutrition"
        subtitle="Track calories & macros"
        icon="food-apple"
        hexColor="#69ff3c"
        onPress={() => router.push("/screens/logger/nutrition-log")}
      />

      <LoggerCard
        title="Body Weight"
        subtitle="Update your current weight"
        icon="scale-bathroom"
        hexColor="#fffa64"
        onPress={() => router.push("/screens/logger/weight-log")}
      />
      <LoggerCard
        title="Hydration"
        subtitle="Monitor daily fluid balance"
        icon="water"
        hexColor="#35d7ff"
        onPress={() => router.push("/screens/logger/water-log")}
      />
      <LoggerCard
        title="Progress Photos"
        subtitle="Visualize the transformation"
        icon="camera-iris"
        hexColor="#a29bfe"
        onPress={() => router.push("/screens/logger/photos-log")}
      />
    </ScrollView>
  );
}

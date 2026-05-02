import { colors } from "@/styles/colors";
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
        hexColor={colors.blue}
        onPress={() => router.push("/screens/logger/workout-log")}
      />

      <LoggerCard
        title="Nutrition"
        subtitle="Track calories & macros"
        icon="food-apple"
        hexColor={colors.green}
        onPress={() => router.push("/screens/logger/nutrition-log")}
      />

      <LoggerCard
        title="Body Weight"
        subtitle="Update your current weight"
        icon="scale-bathroom"
        hexColor={colors.yellow}
        onPress={() => router.push("/screens/logger/weight-log")}
      />
      <LoggerCard
        title="Hydration"
        subtitle="Monitor daily fluid balance"
        icon="water"
        hexColor={colors.cyan}
        onPress={() => router.push("/screens/logger/water-log")}
      />
      <LoggerCard
        title="Progress Photos"
        subtitle="Visualize the transformation"
        icon="camera-iris"
        hexColor={colors.purple}
        onPress={() => router.push("/screens/logger/photos-log")}
      />
    </ScrollView>
  );
}

import { colors } from "@/styles/colors";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";
import LoggerCard from "../../components/ui/logger-card";
import { main, auth } from "../../styles/style";
import { LinearGradient } from "expo-linear-gradient";

export default function LoggerScreen() {
  const router = useRouter();
  
  return (
    <LinearGradient colors={["#020205", "#0a0a1a"]} style={styles.container}>
      <View>
        <Text style={[auth.title, { marginBottom: 15 }]}>LOGGER</Text>
      </View>
      <View style={styles.fullLine} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  fullLine: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    width: "100%",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
});

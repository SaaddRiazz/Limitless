import { HistoryCard } from "@/components/ui/history-card";
import { colors } from "@/styles/colors";
import { auth, logger, main } from "@/styles/style";
import MaterialCommunityIcons from "@expo/vector-icons/build/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function WorkoutScreen() {
  const router = useRouter();
  const savedPlans = [
    {
      id: "1",
      title: "Push Day",
      subtitle: "6 Exercises • chest, shoulders, triceps",
      color: colors.blue,
      day: "Monday",
    },
    {
      id: "2",
      title: "Pull Day",
      subtitle: "5 Exercises • back, biceps",
      color: colors.green,
      day: "Tuesday",
    },
    {
      id: "3",
      title: "Legs",
      subtitle: "7 Exercises • quads, hams, abs",
      color: colors.orange,
      day: "Wednesday",
    },
  ];

  return (
    <View style={main.container}>
      <View style={{ marginTop: 60, marginBottom: 20 }}>
        <Text style={main.headerTitle}>WORKOUTS</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <TouchableOpacity
          style={[
            auth.filledBtn,
            {
              backgroundColor: colors.blue,
              flexDirection: "row",
              justifyContent: "center",
              gap: 10,
              marginTop: 0,
            },
          ]}
          onPress={() => router.push("/screens/tracking/add-workout-plan")}
        >
          <MaterialCommunityIcons name="plus" size={24} color={colors.white} />
          <Text style={auth.filledBtnText}>ADD WORKOUT PLAN</Text>
        </TouchableOpacity>

        <Text
          style={[logger.sectionTitle, { marginTop: 30, marginBottom: 15 }]}
        >
          My Routines
        </Text>

        {savedPlans.length > 0 ? (
          savedPlans.map((plan) => (
            <HistoryCard
              key={plan.id}
              title={plan.title}
              subtitle={plan.subtitle}
              color={plan.color}
              onPress={() => console.log(`Opening ${plan.title}`)}
              date={plan.day}
            />
          ))
        ) : (
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <Text style={{ color: colors.textDark }}>
              No routines saved yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

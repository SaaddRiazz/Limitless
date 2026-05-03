import { HistoryCard } from "@/components/ui/history-card";
import { colors } from "@/styles/colors";
import MaterialCommunityIcons from "@expo/vector-icons/build/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BackButton } from "../../../components/ui/back-button";
import { auth, logger, main } from "../../../styles/style";

export default function WorkoutLog() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const workoutPlans = [
    { id: 1, name: "Push" },
    { id: 2, name: "Pull" },
    { id: 3, name: "Legs" },
    { id: 4, name: "Upper" },
    { id: 5, name: "Lower" },
  ];

  return (
    <View style={main.container}>
      <BackButton color={colors.blue} />
      <Text style={logger.sectionTitle}>Training Log</Text>
      <View
        style={{
          zIndex: 1000,
          position: "relative",
        }}
      >
        <TouchableOpacity
          style={[
            auth.filledBtn,
            { marginTop: 0, backgroundColor: colors.blue },
          ]}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text style={auth.filledBtnText}>Start Workout</Text>
        </TouchableOpacity>
        {showDropdown && (
          <View style={styles.dropdown}>
            {workoutPlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={styles.dropdownItem}
                onPress={() => {
                  router.push("/screens/tracking/track-workout");
                }}
              >
                <Text style={{ color: "#fff" }}>{plan.name}</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#555"
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={[logger.sectionTitle, { marginTop: 40 }]}>
          Recent History
        </Text>
        <HistoryCard
          date="Oct 24, 2025"
          title="Pull"
          subtitle="6 Exercises • 18 Sets"
          color={colors.blue}
          onPress={() => console.log("View Details")}
        />
        <HistoryCard
          date="Oct 24, 2025"
          title="Push"
          subtitle="6 Exercises • 18 Sets"
          color={colors.green}
          onPress={() => console.log("View Details")}
        />
        <HistoryCard
          date="Oct 24, 2025"
          title="Legs"
          subtitle="6 Exercises • 18 Sets"
          color={colors.yellow}
          onPress={() => console.log("View Details")}
        />
        <HistoryCard
          date="Oct 24, 2025"
          title="Upper"
          subtitle="6 Exercises • 18 Sets"
          color={colors.orange}
          onPress={() => console.log("View Details")}
        />
        <HistoryCard
          date="Oct 24, 2025"
          title="Lower"
          subtitle="6 Exercises • 18 Sets"
          color={colors.red}
          onPress={() => console.log("View Details")}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: "#111",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#222",
    overflow: "hidden",
    position: "absolute",
    top: 55,
    width: "100%",
    zIndex: 2000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyCard: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 12,
  },
});

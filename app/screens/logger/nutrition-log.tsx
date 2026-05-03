import { NutritionHistoryCard } from "@/components/ui/nutrition-history-card";
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

export default function NutritionLog() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const mealTypes = [
    { id: 1, name: "Breakfast" },
    { id: 2, name: "Lunch" },
    { id: 3, name: "Dinner" },
    { id: 4, name: "Snacks" },
  ];

  const historyData = [
    {
      date: "Oct 26, 2025",
      color: colors.blue,
      meals: [
        { type: "Breakfast", calories: 450, label: "3 entries" },
        { type: "Lunch", calories: 650, label: "2 entries" },
        { type: "Dinner", calories: 800, label: "3 entries" },
      ],
    },
    {
      date: "Oct 25, 2025",
      color: colors.green,
      meals: [
        { type: "Breakfast", calories: 300, label: "2 entries" },
        { type: "Snacks", calories: 200, label: "1 entries" },
        { type: "Dinner", calories: 1200, label: "7 entries" },
      ],
    },
    {
      date: "Oct 24, 2025",
      color: colors.yellow,
      meals: [
        { type: "Breakfast", calories: 450, label: "5 entries" },
        { type: "Lunch", calories: 650, label: "2 entries" },
        { type: "Dinner", calories: 800, label: "2 entries" },
      ],
    },
  ];

  return (
    <View style={main.container}>
      <BackButton color={colors.green} />

      <View style={{ zIndex: 2000 }}>
        <Text style={logger.sectionTitle}>Nutrition Log</Text>
        <TouchableOpacity
          style={[
            auth.filledBtn,
            { marginTop: 0, backgroundColor: colors.green },
          ]}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text style={auth.filledBtnText}>Track Calories</Text>
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdown}>
            {mealTypes.map((meal) => (
              <TouchableOpacity
                key={meal.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setShowDropdown(false);
                  router.push("/screens/tracking/track-calories");
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  {meal.name}
                </Text>
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

      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[logger.sectionTitle, { marginTop: 40 }]}>
          Recent History
        </Text>

        {historyData.map((day, index) => (
          <NutritionHistoryCard
            key={index}
            date={day.date}
            meals={day.meals as any}
            color={day.color}
            onPress={() => console.log("Viewing Day Detail")}
          />
        ))}
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
    top: 85,
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
});

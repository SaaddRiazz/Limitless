import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MealItem {
  name: string;
  cal: number;
}

interface MealEntry {
  type: "Breakfast" | "Lunch" | "Dinner" | "Snacks";
  calories: number;
  itemsList?: MealItem[];
}

interface NutritionHistoryCardProps {
  date: string;
  meals: MealEntry[];
  onPress?: () => void;
  color?: string;
}

export const NutritionHistoryCard = ({
  date,
  meals,
  onPress,
  color = "#2196F3",
}: NutritionHistoryCardProps) => {
  const order = ["Breakfast", "Lunch", "Snacks", "Dinner"];

  const sortedMeals = meals
    .filter((m) => order.includes(m.type))
    .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

  return (
    <TouchableOpacity
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        borderColor: "rgba(255, 255, 255, 0.05)",
        borderWidth: 1,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.05)", paddingBottom: 8 }}>
        <Text style={{ color, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 }}>
          {date.toUpperCase()}
        </Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255, 255, 255, 0.3)" />
      </View>

      <View style={styles.content}>
        {sortedMeals.map((meal, index) => (
          <View key={index} style={styles.mealSection}>
            <View style={styles.mealHeaderRow}>
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "900", fontStyle: "italic" }}>
                {meal.type.toUpperCase()}
              </Text>
              <Text style={styles.mealCalText}>{meal.calories} kcal</Text>
            </View>

            {meal.itemsList &&
              meal.itemsList.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <Text style={styles.subtitleText} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemCalText}>{item.cal} kcal</Text>
                </View>
              ))}
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.mealHeaderRow}>
          <Text style={{ color, fontSize: 16, fontWeight: "900", fontStyle: "italic" }}>TOTAL</Text>
          <Text
            style={{ color, fontSize: 16, fontWeight: "900", textAlign: "right" }}
          >
            {totalCalories} kcal
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  mealSection: {
    gap: 6,
  },
  mealHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingLeft: 8,
    marginTop: 2,
  },
  subtitleText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 13,
    flex: 1,
    paddingRight: 10,
    fontWeight: "600",
  },
  itemCalText: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
    minWidth: 60,
  },
  mealCalText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
    minWidth: 80,
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginVertical: 4,
  },
});

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
      style={[
        styles.card,
        { backgroundColor: `${color}10`, borderColor: `${color}40` },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.header, { borderBottomColor: `${color}40` }]}>
        <Text style={styles.dateText}>{date.toUpperCase()}</Text>
        <MaterialCommunityIcons name="chevron-right" size={18} color="#666" />
      </View>

      <View style={styles.content}>
        {sortedMeals.map((meal, index) => (
          <View key={index} style={styles.mealSection}>
            <View style={styles.mealHeaderRow}>
              <Text style={styles.titleText}>{meal.type}</Text>
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

        <View style={[styles.divider, { backgroundColor: `${color}40` }]} />

        <View style={styles.mealHeaderRow}>
          <Text style={[styles.titleText, { color: color }]}>TOTAL</Text>
          <Text
            style={[styles.mealCalText, { color: color, fontWeight: "900" }]}
          >
            {totalCalories} kcal
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  dateText: {
    color: "#888",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  content: {
    gap: 16,
  },
  mealSection: {
    gap: 4,
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
  titleText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  subtitleText: {
    color: "#666",
    fontSize: 13,
    flex: 1,
    paddingRight: 10,
  },
  itemCalText: {
    color: "#444",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "right",
    minWidth: 60,
  },
  mealCalText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
    minWidth: 80,
  },
  divider: {
    height: 1,
    width: "100%",
    marginVertical: 4,
  },
});

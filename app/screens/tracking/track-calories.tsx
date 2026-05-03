import { BackButton } from "@/components/ui/back-button";
import { FoodItem } from "@/components/ui/food-item";
import { colors } from "@/styles/colors";
import { exercise, logger, main } from "@/styles/style";
import * as Crypto from "expo-crypto";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CalorieEntry {
  id: string;
  name: string;
  description: string;
  calories: string;
}

export default function TrackCalories() {
  const [items, setItems] = useState<CalorieEntry[]>([
    { id: Crypto.randomUUID(), name: "", description: "", calories: "" },
  ]);

  const addItem = () => {
    setItems([
      ...items,
      { id: Crypto.randomUUID(), name: "", description: "", calories: "" },
    ]);
  };

  const updateItem = (id: string, updates: Partial<CalorieEntry>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const deleteItem = (id: string) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const totalCalories = items.reduce(
    (sum, item) => sum + (parseInt(item.calories) || 0),
    0,
  );

  const handleSave = () => {
    console.log(
      "Saving Calorie Log:",
      JSON.stringify({ items, totalCalories }, null, 2),
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={main.container}
    >
      <View>
        <BackButton color={colors.green} />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 10,
          }}
        >
          <Text style={[logger.sectionTitle, { marginBottom: 0 }]}>
            Track Calories
          </Text>
          <Text
            style={{ color: colors.green, fontWeight: "900", fontSize: 18 }}
          >
            {totalCalories} kcal
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[exercise.scrollContent, { paddingTop: 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item) => (
          <FoodItem
            key={item.id}
            item={item}
            onUpdate={(updates) => updateItem(item.id, updates)}
            onDelete={() => deleteItem(item.id)}
          />
        ))}

        <TouchableOpacity
          style={[
            exercise.addExerciseBtn,
            { borderColor: colors.green, backgroundColor: `${colors.green}15` },
          ]}
          onPress={addItem}
        >
          <Text style={[exercise.addExerciseText, { color: colors.green }]}>
            + ADD ITEM
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={exercise.fixedFooter}>
        <TouchableOpacity
          style={[logger.submitBtn, { backgroundColor: colors.green }]}
          onPress={handleSave}
        >
          <Text style={[logger.submitBtnText, { color: colors.white }]}>
            SAVE LOG
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

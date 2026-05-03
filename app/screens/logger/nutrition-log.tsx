import { NutritionHistoryCard } from "@/components/ui/nutrition-history-card";
import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BackButton } from "../../../components/ui/back-button";
import { auth, logger, main } from "../../../styles/style";

const genAI = new GoogleGenerativeAI(
  process.env.EXPO_PUBLIC_GEMINI_API_KEY || "",
);

export default function NutritionLog() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("");
  const [foodName, setFoodName] = useState("");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const mealTypes = [
    { id: 1, name: "Breakfast" },
    { id: 2, name: "Lunch" },
    { id: 3, name: "Dinner" },
    { id: 4, name: "Snacks" },
  ];

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("nutrition_logs")
        .select("*")
        .eq("user_id", session.user.id)
        .order("logged_at", { ascending: true });

      if (error) throw error;

      const grouped = data.reduce((acc: any, log: any) => {
        const date = new Date(log.logged_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        if (!acc[date]) {
          acc[date] = {
            date,
            color:
              date ===
              new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
                ? colors.green
                : colors.blue,
            meals: {},
          };
        }

        if (!acc[date].meals[log.meal_type]) {
          acc[date].meals[log.meal_type] = {
            type: log.meal_type,
            calories: 0,
            items: [],
          };
        }

        acc[date].meals[log.meal_type].calories += log.calories;
        acc[date].meals[log.meal_type].items.push({
          name: log.food_name,
          cal: log.calories,
        });

        return acc;
      }, {});

      const formattedData = Object.values(grouped).map((day: any) => ({
        ...day,
        meals: Object.values(day.meals).map((m: any) => ({
          ...m,
          itemsList: m.items,
        })),
      }));

      setHistoryData(formattedData);
    } catch (error: any) {
      console.error("Error fetching history:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const estimateCalories = async () => {
    if (!foodName) {
      Alert.alert("Error", "Please enter a food name first.");
      return;
    }

    setIsEstimating(true);
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-3.1-flash-lite-preview",
      });
      const prompt = `Estimate the calories for: ${foodName} - ${description}. Return ONLY the integer number. If you cannot estimate, return 0.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      const calorieValue = parseInt(text.replace(/[^0-9]/g, "")) || 0;
      setCalories(calorieValue.toString());
    } catch (error) {
      console.error("Gemini Error:", error);
      Alert.alert(
        "AI Error",
        "Failed to estimate calories. Please enter manually.",
      );
    } finally {
      setIsEstimating(false);
    }
  };

  const saveLog = async () => {
    if (!foodName || !calories || !selectedMealType) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setIsSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const { error } = await supabase.from("nutrition_logs").insert([
        {
          user_id: session.user.id,
          food_name: foodName,
          description: description,
          calories: parseInt(calories),
          meal_type: selectedMealType,
          logged_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setModalVisible(false);
      resetForm();
      fetchHistory();
      Alert.alert("Success", "Food logged successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFoodName("");
    setDescription("");
    setCalories("");
    setSelectedMealType("");
  };

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
                  setSelectedMealType(meal.name);
                  setModalVisible(true);
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

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.green}
            style={{ marginTop: 20 }}
          />
        ) : historyData.length > 0 ? (
          historyData.map((day, index) => (
            <NutritionHistoryCard
              key={index}
              date={day.date}
              meals={day.meals as any}
              color={day.color}
            />
          ))
        ) : (
          <Text
            style={{
              color: colors.textMuted,
              textAlign: "center",
              marginTop: 20,
            }}
          >
            No nutrition logs found. Start tracking today!
          </Text>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log {selectedMealType}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Food Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Grilled Chicken Breast"
                placeholderTextColor="#444"
                value={foodName}
                onChangeText={setFoodName}
              />

              <Text style={styles.inputLabel}>Description / Portion</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 200g, 1 plate"
                placeholderTextColor="#444"
                value={description}
                onChangeText={setDescription}
              />

              <Text style={styles.inputLabel}>Calories (kcal)</Text>
              <View style={styles.calorieInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="0"
                  placeholderTextColor="#444"
                  keyboardType="numeric"
                  value={calories}
                  onChangeText={setCalories}
                />
                <TouchableOpacity
                  style={styles.aiButton}
                  onPress={estimateCalories}
                  disabled={isEstimating}
                >
                  {isEstimating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <MaterialCommunityIcons
                      name="robot"
                      size={24}
                      color="#fff"
                    />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
                onPress={saveLog}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.saveButtonText}>SAVE ENTRY</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0a0a0a",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#222",
    minHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1,
  },
  modalBody: {
    gap: 15,
  },
  inputLabel: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222",
    padding: 15,
    color: "#fff",
    fontSize: 16,
    marginBottom: 5,
  },
  calorieInputRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  aiButton: {
    backgroundColor: `${colors.blue}20`,
    borderColor: colors.blue,
    borderWidth: 1,
    width: 55,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: colors.green,
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
  },
});

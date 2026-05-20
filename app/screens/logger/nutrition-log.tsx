import { NutritionHistoryCard } from "@/components/ui/nutrition-history-card";
import { supabase } from "@/lib/supabase";
import { addXP, XP_VALUES } from "@/lib/xp-service";
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
import { LinearGradient } from "expo-linear-gradient";

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
        .order("logged_at", { ascending: false });

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

      const formattedData = Object.values(grouped)
        .reverse()
        .map((day: any) => ({
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
      const prompt = `Estimate the calories for: ${foodName} - ${description}. Return ONLY the integer number, no units or text. If you cannot estimate, return 0.`;

      let text = "";
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
        const result = await model.generateContent(prompt);
        text = result.response.text().trim();
      } catch {
        console.warn("Primary Gemini model failed, trying fallback...");
        const fallback = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
        const result = await fallback.generateContent(prompt);
        text = result.response.text().trim();
      }

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

      await addXP(XP_VALUES.MEAL_LOG);
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
    <LinearGradient colors={["#020205", "#0a0a1a"]} style={styles.container}>
      <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
        <BackButton color={colors.green} />
        <Text style={[auth.title, { paddingStart: 0, marginTop: 10, marginBottom: 15 }]}>
          NUTRITION LOG
        </Text>
      </View>
      <View style={styles.fullLine} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ zIndex: 2000, position: "relative", marginBottom: 20 }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setShowDropdown(!showDropdown)}
            style={styles.trackBtnWrapper}
          >
            <LinearGradient
              colors={["#4ec42a", "#256214"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.trackBtn}
            >
              <MaterialCommunityIcons name="food-apple" size={24} color="#fff" />
              <Text style={styles.trackBtnText}>TRACK CALORIES</Text>
            </LinearGradient>
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
                    color="rgba(255, 255, 255, 0.3)"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>RECENT HISTORY</Text>

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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No nutrition logs found. Start tracking today!</Text>
          </View>
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
              <Text style={styles.modalTitle}>LOG {selectedMealType.toUpperCase()}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              <Text style={styles.inputLabel}>Food Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Grilled Chicken Breast"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={foodName}
                onChangeText={setFoodName}
              />

              <Text style={styles.inputLabel}>Description / Portion</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 200g, 1 plate"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={description}
                onChangeText={setDescription}
              />

              <Text style={styles.inputLabel}>Calories (kcal)</Text>
              <View style={styles.calorieInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="0"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
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
                      size={22}
                      color="#fff"
                    />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.saveBtnWrapper, isSaving && { opacity: 0.7 }]}
                onPress={saveLog}
                disabled={isSaving}
              >
                <LinearGradient
                  colors={["#4ec42a", "#256214"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveBtn}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>SAVE ENTRY</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  trackBtnWrapper: {
    borderRadius: 15,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  trackBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    gap: 8,
  },
  trackBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  dropdown: {
    backgroundColor: "#0a0a14",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
    position: "absolute",
    top: 60,
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
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 15,
    marginTop: 20,
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "rgba(255, 255, 255, 0.01)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.03)",
    borderStyle: "dashed",
    marginTop: 10,
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0a0a14",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1,
    fontStyle: "italic",
  },
  modalBody: {
    gap: 15,
    paddingBottom: 30,
  },
  inputLabel: {
    color: colors.green,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: "#161622",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    padding: 15,
    color: "#fff",
    fontSize: 15,
  },
  calorieInputRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  aiButton: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderColor: "rgba(0, 122, 255, 0.3)",
    borderWidth: 1,
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnWrapper: {
    borderRadius: 15,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 20,
  },
  saveBtn: {
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
});

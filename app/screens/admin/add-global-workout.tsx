import { BackButton } from "@/components/ui/back-button";
import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { auth } from "@/styles/style";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface WorkoutExercise {
  tempId: string;
  name: string;
  targetSets: string;
  targetReps: string;
}

export default function AddGlobalWorkout() {
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDesc, setWorkoutDesc] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Search logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchGlobalExercises();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const searchGlobalExercises = async () => {
    let query = supabase.from("global_exercises").select("*");
    if (searchQuery.trim()) {
      query = query.ilike("name", `%${searchQuery.trim()}%`);
    }
    const { data } = await query.limit(20);
    setSearchResults(data || []);
  };

  const addExerciseToWorkout = (name: string) => {
    setExercises([
      ...exercises,
      {
        tempId: Math.random().toString(),
        name,
        targetSets: "3",
        targetReps: "10",
      },
    ]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeExercise = (tempId: string) => {
    setExercises(exercises.filter((e) => e.tempId !== tempId));
  };

  const handleSave = async () => {
    if (!workoutName || exercises.length === 0) {
      return Alert.alert(
        "Required",
        "Workout name and at least one exercise are required.",
      );
    }

    setIsSaving(true);
    try {
      // 1. Check for new exercises and add them to global_exercises library
      for (const ex of exercises) {
        const { data: existing } = await supabase
          .from("global_exercises")
          .select("id")
          .eq("name", ex.name)
          .single();

        if (!existing) {
          await supabase
            .from("global_exercises")
            .insert([{ name: ex.name, met_value: 3.5 }]);
        }
      }

      // 2. Save the Global Workout
      const { data: workout, error: workoutError } = await supabase
        .from("global_workouts")
        .insert([{ name: workoutName, description: workoutDesc }])
        .select()
        .single();

      if (workoutError) throw workoutError;

      // 3. Link exercises to the workout (junction table: global_workout_exercises)
      const junctionEntries = exercises.map((ex, index) => ({
        workout_id: workout.id,
        exercise_name: ex.name,
        target_sets: parseInt(ex.targetSets),
        target_reps: parseInt(ex.targetReps),
        order_index: index,
      }));

      const { error: junctionError } = await supabase
        .from("global_workout_exercises")
        .insert(junctionEntries);

      if (junctionError) throw junctionError;

      Alert.alert(
        "Success",
        "Global workout and exercises synced successfully.",
      );
      setWorkoutName("");
      setWorkoutDesc("");
      setExercises([]);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <LinearGradient colors={["#020205", "#0a0a1a"]} style={styles.container}>
      <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
        <BackButton color={colors.blue} />
        <Text style={[auth.title, { paddingStart: 0, marginTop: 10, marginBottom: 15 }]}>
          CREATE GLOBAL ROUTINE
        </Text>
      </View>
      <View style={styles.fullLine} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>ROUTINE NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Global Upper Hypertrophy"
            placeholderTextColor="rgba(255, 255, 255, 0.25)"
            value={workoutName}
            onChangeText={setWorkoutName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>DESCRIPTION</Text>
          <TextInput
            style={[styles.input, { height: 70, textAlignVertical: "top" }]}
            placeholder="Describe this workout plan..."
            placeholderTextColor="rgba(255, 255, 255, 0.25)"
            multiline
            value={workoutDesc}
            onChangeText={setWorkoutDesc}
          />
        </View>

        <View style={styles.searchSection}>
          <Text style={styles.inputLabel}>ADD EXERCISES</Text>
          <View style={styles.searchBar}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Search or type new exercise..."
              placeholderTextColor="rgba(255, 255, 255, 0.25)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addExerciseToWorkout(searchQuery)}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={24}
                  color={colors.blue}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Results Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <View style={styles.resultsContainer}>
              {searchResults.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.resultItem}
                  onPress={() => addExerciseToWorkout(item.name)}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>{item.name}</Text>
                  <MaterialCommunityIcons
                    name="library-outline"
                    size={16}
                    color="rgba(255, 255, 255, 0.4)"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Selected Exercises List */}
        <View style={{ marginTop: 20 }}>
          {exercises.map((ex, idx) => (
            <View key={ex.tempId} style={styles.exerciseCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.exerciseName}>
                  {idx + 1}. {ex.name}
                </Text>
                <TouchableOpacity onPress={() => removeExercise(ex.tempId)}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={22}
                    color={colors.red}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.inputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniLabel}>TARGET SETS</Text>
                  <TextInput
                    style={styles.miniInput}
                    keyboardType="numeric"
                    value={ex.targetSets}
                    onChangeText={(val) => {
                      const newExs = [...exercises];
                      newExs[idx].targetSets = val;
                      setExercises(newExs);
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniLabel}>TARGET REPS</Text>
                  <TextInput
                    style={styles.miniInput}
                    keyboardType="numeric"
                    value={ex.targetReps}
                    onChangeText={(val) => {
                      const newExs = [...exercises];
                      newExs[idx].targetReps = val;
                      setExercises(newExs);
                    }}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.publishBtnWrapper}
          onPress={handleSave}
          disabled={isSaving}
        >
          <LinearGradient
            colors={["#007AFF", "#003b82"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.publishBtn}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.publishBtnText}>PUBLISH GLOBAL WORKOUT</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  inputContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
  },
  inputLabel: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#161622",
    color: "#fff",
    padding: 14,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    fontSize: 16,
    fontWeight: "600",
  },
  searchSection: {
    zIndex: 100,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
  },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10 },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: "#161622",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.blue,
  },
  resultsContainer: {
    backgroundColor: "#0a0a14",
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  exerciseName: {
    color: colors.blue,
    fontWeight: "900",
    fontSize: 16,
  },
  inputRow: { flexDirection: "row", gap: 20 },
  miniLabel: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
  },
  miniInput: {
    backgroundColor: "#161622",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    color: "#fff",
    paddingVertical: 8,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
  },
  publishBtnWrapper: {
    borderRadius: 15,
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 20,
  },
  publishBtn: {
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  publishBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
});

import { BackButton } from "@/components/ui/back-button";
import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { auth, logger, main } from "@/styles/style";
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
    <View style={main.container}>
      <BackButton color={colors.blue} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={logger.sectionTitle}>Create Global Routine</Text>

        <TextInput
          style={styles.input}
          placeholder="Routine Name (e.g., Push Day)"
          placeholderTextColor="#444"
          value={workoutName}
          onChangeText={setWorkoutName}
        />

        <TextInput
          style={[styles.input, { height: 60 }]}
          placeholder="Routine Description"
          placeholderTextColor="#444"
          multiline
          value={workoutDesc}
          onChangeText={setWorkoutDesc}
        />

        <View style={styles.searchSection}>
          <Text style={styles.label}>ADD EXERCISES</Text>
          <View style={styles.searchBar}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Search or type new exercise..."
              placeholderTextColor="#444"
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
                  <Text style={{ color: "#fff" }}>{item.name}</Text>
                  <MaterialCommunityIcons
                    name="library-outline"
                    size={16}
                    color="#666"
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
                    size={20}
                    color={colors.red}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.inputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniLabel}>SETS</Text>
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
                  <Text style={styles.miniLabel}>REPS</Text>
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
          style={[
            auth.filledBtn,
            { backgroundColor: colors.blue, marginTop: 30 },
            isSaving && { opacity: 0.7 },
          ]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={auth.filledBtnText}>PUBLISH GLOBAL WORKOUT</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#111",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#222",
  },
  label: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 10,
    letterSpacing: 1,
  },
  searchSection: { zIndex: 100 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10 },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: "#111",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.blue,
  },
  resultsContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#333",
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  exerciseCard: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#222",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  exerciseName: { color: colors.blue, fontWeight: "bold", fontSize: 16 },
  inputRow: { flexDirection: "row", gap: 20 },
  miniLabel: {
    color: "#555",
    fontSize: 10,
    fontWeight: "900",
    marginBottom: 4,
  },
  miniInput: {
    backgroundColor: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    color: "#fff",
    paddingVertical: 5,
    textAlign: "center",
  },
});

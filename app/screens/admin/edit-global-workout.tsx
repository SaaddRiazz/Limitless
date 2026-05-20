import { BackButton } from "@/components/ui/back-button";
import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { auth } from "@/styles/style";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  name: string;
  targetSets: string;
  targetReps: string;
}

export default function EditGlobalWorkout() {
  const { workoutId } = useLocalSearchParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchWorkoutDetails();
  }, [workoutId]);

  const fetchWorkoutDetails = async () => {
    try {
      const { data: workout, error: wError } = await supabase
        .from("global_workouts")
        .select("*")
        .eq("id", workoutId)
        .single();

      if (wError) throw wError;
      setName(workout.name);
      setDesc(workout.description);

      const { data: exData, error: eError } = await supabase
        .from("global_workout_exercises")
        .select("*")
        .eq("workout_id", workoutId)
        .order("order_index", { ascending: true });

      if (eError) throw eError;
      setExercises(
        exData.map((e) => ({
          name: e.exercise_name,
          targetSets: e.target_sets.toString(),
          targetReps: e.target_reps.toString(),
        })),
      );
    } catch (err) {
      Alert.alert("Error", "Could not load workout details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      // 1. Update main details
      await supabase
        .from("global_workouts")
        .update({ name, description: desc })
        .eq("id", workoutId);

      // 2. Clear and re-insert junction table (simplest sync method)
      await supabase
        .from("global_workout_exercises")
        .delete()
        .eq("workout_id", workoutId);

      const junctionEntries = exercises.map((ex, index) => ({
        workout_id: workoutId,
        exercise_name: ex.name,
        target_sets: parseInt(ex.targetSets),
        target_reps: parseInt(ex.targetReps),
        order_index: index,
      }));

      await supabase.from("global_workout_exercises").insert(junctionEntries);

      Alert.alert("Success", "Global workout updated");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#020205", "#0a0a1a"]} style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.blue} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#020205", "#0a0a1a"]} style={styles.container}>
      <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
        <BackButton color={colors.blue} />
        <Text style={[auth.title, { paddingStart: 0, marginTop: 10, marginBottom: 15 }]}>
          EDIT GLOBAL ROUTINE
        </Text>
      </View>
      <View style={styles.fullLine} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>ROUTINE NAME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Workout Name"
            placeholderTextColor="rgba(255, 255, 255, 0.25)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>DESCRIPTION</Text>
          <TextInput
            style={[styles.input, { height: 70, textAlignVertical: "top" }]}
            value={desc}
            onChangeText={setDesc}
            multiline
            placeholder="Description"
            placeholderTextColor="rgba(255, 255, 255, 0.25)"
          />
        </View>

        <View style={{ marginTop: 10 }}>
          {exercises.map((ex, idx) => (
            <View key={idx} style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>{ex.name}</Text>
              <View style={styles.inputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniLabel}>TARGET SETS</Text>
                  <TextInput
                    style={styles.miniInput}
                    value={ex.targetSets}
                    keyboardType="numeric"
                    onChangeText={(v) => {
                      const next = [...exercises];
                      next[idx].targetSets = v;
                      setExercises(next);
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniLabel}>TARGET REPS</Text>
                  <TextInput
                    style={styles.miniInput}
                    value={ex.targetReps}
                    keyboardType="numeric"
                    onChangeText={(v) => {
                      const next = [...exercises];
                      next[idx].targetReps = v;
                      setExercises(next);
                    }}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.updateBtnWrapper}
          onPress={handleUpdate}
          disabled={isSaving}
        >
          <LinearGradient
            colors={["#007AFF", "#003b82"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.updateBtn}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.updateBtnText}>UPDATE CHANGES</Text>
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
  exerciseCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
  },
  exerciseName: {
    color: colors.blue,
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 15,
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
  updateBtnWrapper: {
    borderRadius: 15,
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 20,
  },
  updateBtn: {
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  updateBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
});

import { BackButton } from "@/components/ui/back-button";
import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { auth, logger, main } from "@/styles/style";
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

  if (loading)
    return (
      <View style={main.container}>
        <ActivityIndicator color={colors.blue} style={{ marginTop: 100 }} />
      </View>
    );

  return (
    <View style={main.container}>
      <BackButton color={colors.blue} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
        <Text style={logger.sectionTitle}>Edit Global Routine</Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Workout Name"
          placeholderTextColor="#444"
        />
        <TextInput
          style={[styles.input, { height: 60 }]}
          value={desc}
          onChangeText={setDesc}
          multiline
          placeholder="Description"
          placeholderTextColor="#444"
        />

        {exercises.map((ex, idx) => (
          <View key={idx} style={styles.exCard}>
            <Text style={styles.exName}>{ex.name}</Text>
            <View style={{ flexDirection: "row", gap: 15 }}>
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
        ))}

        <TouchableOpacity
          style={[
            auth.filledBtn,
            { backgroundColor: colors.blue, marginTop: 20 },
          ]}
          onPress={handleUpdate}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={auth.filledBtnText}>UPDATE CHANGES</Text>
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
  exCard: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#222",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exName: { color: colors.blue, fontWeight: "bold" },
  miniInput: {
    backgroundColor: "#000",
    color: "#fff",
    padding: 8,
    borderRadius: 5,
    width: 50,
    textAlign: "center",
  },
});

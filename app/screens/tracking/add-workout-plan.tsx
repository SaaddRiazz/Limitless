import { BackButton } from "@/components/ui/back-button";
import { PlanExerciseCard } from "@/components/ui/plan-exercise-card";
import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { auth } from "@/styles/style";
import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface SetEntry {
  id: string;
  weight: string;
  reps: string;
}

interface PlanExercise {
  id: string;
  name: string;
  sets: SetEntry[];
}

export default function AddWorkoutPlan() {
  const [planName, setPlanName] = useState("");
  const [exercises, setExercises] = useState<PlanExercise[]>([
    {
      id: Crypto.randomUUID(),
      name: "",
      sets: [{ id: Crypto.randomUUID(), weight: "", reps: "" }],
    },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        id: Crypto.randomUUID(),
        name: "",
        sets: [{ id: Crypto.randomUUID(), weight: "", reps: "" }],
      },
    ]);
  };

  const deleteExercise = (exId: string) => {
    setExercises((prev) => prev.filter((item) => item.id !== exId));
  };

  const addSet = (exId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exId) {
          const lastSet = ex.sets[ex.sets.length - 1];

          return {
            ...ex,
            sets: [
              ...ex.sets,
              {
                id: Crypto.randomUUID(),
                weight: lastSet ? lastSet.weight : "",
                reps: lastSet ? lastSet.reps : "",
              },
            ],
          };
        }
        return ex;
      }),
    );
  };

  const updateSet = (
    exId: string,
    setId: string,
    updates: Partial<SetEntry>,
  ) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exId) {
          return {
            ...ex,
            sets: ex.sets.map((s) =>
              s.id === setId ? { ...s, ...updates } : s,
            ),
          };
        }
        return ex;
      }),
    );
  };

  const deleteSet = (exId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exId) {
          return { ...ex, sets: ex.sets.filter((s) => s.id !== setId) };
        }
        return ex;
      }),
    );
  };

  const handleSavePlan = async () => {
    if (!planName.trim()) {
      Alert.alert("Error", "Please enter a routine name.");
      return;
    }

    if (exercises.some((ex) => !ex.name.trim())) {
      Alert.alert("Error", "All exercises must have a name.");
      return;
    }

    setIsSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      // 1. Save Plan
      const { data: plan, error: planError } = await supabase
        .from("workout_plans")
        .insert([
          {
            user_id: session.user.id,
            name: planName,
            description: `${exercises.length} Exercises`,
          },
        ])
        .select()
        .single();

      if (planError) throw planError;

      // 2. Save Exercises
      const exercisesToInsert = exercises.map((ex, index) => ({
        plan_id: plan.id,
        user_id: session.user.id,
        exercise_name: ex.name,
        target_sets: ex.sets.length,
        target_reps: parseInt(ex.sets[0]?.reps || "0"),
        target_weight: parseFloat(ex.sets[0]?.weight || "0"),
        order_index: index,
      }));

      const { error: exercisesError } = await supabase
        .from("plan_exercises")
        .insert(exercisesToInsert);

      if (exercisesError) throw exercisesError;

      Alert.alert("Success", "Workout routine saved!");
      router.back();
    } catch (error: any) {
      console.error("Save Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <LinearGradient colors={["#020205", "#0a0a1a"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
          <BackButton color={colors.blue} />
          <Text style={[auth.title, { paddingStart: 0, marginTop: 10, marginBottom: 15 }]}>
            CREATE ROUTINE
          </Text>
        </View>
        <View style={styles.fullLine} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.routineInputContainer}>
            <Text style={styles.inputLabel}>ROUTINE NAME</Text>
            <TextInput
              style={styles.routineInput}
              placeholder="e.g. Hypertrophy Upper body"
              placeholderTextColor="rgba(255, 255, 255, 0.25)"
              value={planName}
              onChangeText={setPlanName}
            />
          </View>

          {exercises.map((ex, exIdx) => (
            <PlanExerciseCard
              key={ex.id}
              ex={ex}
              exIdx={exIdx}
              onUpdateName={(newName) => {
                setExercises(
                  exercises.map((e) =>
                    e.id === ex.id ? { ...e, name: newName } : e,
                  ),
                );
              }}
              onUpdateSet={(setId, updates) => updateSet(ex.id, setId, updates)}
              onDeleteExercise={() => deleteExercise(ex.id)}
              onAddSet={() => addSet(ex.id)}
              onDeleteSet={(setId) => deleteSet(ex.id, setId)}
            />
          ))}

          <TouchableOpacity style={styles.addExerciseBtn} onPress={addExercise}>
            <Text style={styles.addExerciseText}>+ ADD EXERCISE</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.fixedFooter}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.saveBtnWrapper}
            onPress={handleSavePlan}
            disabled={isSaving}
          >
            <LinearGradient
              colors={["#007AFF", "#003b82"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveBtn}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>SAVE ROUTINE</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: 110,
  },
  routineInputContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  inputLabel: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  routineInput: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    fontStyle: "italic",
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    paddingBottom: 6,
  },
  addExerciseBtn: {
    borderWidth: 1,
    borderColor: "rgba(33, 150, 243, 0.25)",
    borderStyle: "dashed",
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "rgba(33, 150, 243, 0.03)",
    marginBottom: 40,
  },
  addExerciseText: {
    color: colors.blue,
    fontWeight: "900",
    letterSpacing: 1,
    fontSize: 14,
  },
  fixedFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#020205",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  saveBtnWrapper: {
    borderRadius: 15,
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
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

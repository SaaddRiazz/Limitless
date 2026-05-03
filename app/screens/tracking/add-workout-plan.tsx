import { BackButton } from "@/components/ui/back-button";
import { PlanExerciseCard } from "@/components/ui/plan-exercise-card";
import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { exercise, logger, main } from "@/styles/style";
import * as Crypto from "expo-crypto";
import { router, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      // 1. Save Plan
      const { data: plan, error: planError } = await supabase
        .from("workout_plans")
        .insert([{ 
          user_id: session.user.id, 
          name: planName, 
          description: `${exercises.length} Exercises` 
        }])
        .select()
        .single();

      if (planError) throw planError;

      // 2. Save Exercises (schema: plan_id, user_id, exercise_name, target_sets, target_reps, target_weight, order_index)
      const exercisesToInsert = exercises.map((ex, index) => ({
        plan_id: plan.id,
        user_id: session.user.id,
        exercise_name: ex.name,
        target_sets: ex.sets.length,
        target_reps: parseInt(ex.sets[0]?.reps || "0"),
        target_weight: parseFloat(ex.sets[0]?.weight || "0"),
        order_index: index
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={main.container}
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <BackButton color={colors.blue} />

        <Text style={[logger.sectionTitle, { marginBottom: 5, marginTop: 10 }]}>
          Create Routine
        </Text>

        <TextInput
          style={[
            exercise.exerciseInput,
            {
              fontSize: 28,
              color: colors.blue,
              borderBottomWidth: 1,
              borderBottomColor: colors.cardBorder,
              paddingBottom: 5,
            },
          ]}
          placeholder="Routine Name"
          placeholderTextColor="#444"
          value={planName}
          onChangeText={setPlanName}
        />
      </View>

      <ScrollView
        contentContainerStyle={[exercise.scrollContent, { paddingTop: 20 }]}
        showsVerticalScrollIndicator={false}
      >
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

        <TouchableOpacity style={exercise.addExerciseBtn} onPress={addExercise}>
          <Text style={exercise.addExerciseText}>+ ADD EXERCISE</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={exercise.fixedFooter}>
        <TouchableOpacity
          style={[logger.submitBtn, { backgroundColor: colors.blue }, isSaving && { opacity: 0.7 }]}
          onPress={handleSavePlan}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={[logger.submitBtnText, { color: colors.white }]}>
              SAVE ROUTINE
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

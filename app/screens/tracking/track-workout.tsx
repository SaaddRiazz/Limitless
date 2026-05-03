import { BackButton } from "@/components/ui/back-button";
import { ExerciseCard } from "@/components/ui/exercise-card";
import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { exercise, logger, main } from "@/styles/style";
import * as Crypto from "expo-crypto";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SetEntry {
  id: string;
  weight: string;
  reps: string;
  checked: boolean;
  isUnlocked: boolean;
  prevWeight?: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: SetEntry[];
}

export default function TrackWorkout() {
  const router = useRouter();
  const { planId, planName } = useLocalSearchParams<{ planId: string; planName: string }>();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const [startTime] = useState(new Date());

  useEffect(() => {
    if (planId) {
      fetchPlanExercises();
    } else {
      setLoading(false);
    }
  }, [planId]);

  const fetchPlanExercises = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("plan_exercises")
        .select("*")
        .eq("plan_id", planId)
        .order("order_index", { ascending: true });

      if (error) throw error;

      // Map rows to the UI structure. Each row has 'target_sets' count.
      const formattedExercises = data.map((item: any) => {
        const setsCount = parseInt(item.target_sets) || 1;
        const sets = Array.from({ length: setsCount }).map((_, i) => ({
          id: Crypto.randomUUID(),
          weight: item.target_weight?.toString() || "",
          reps: item.target_reps?.toString() || "",
          checked: false,
          isUnlocked: i === 0,
          prevWeight: "Target",
        }));

        return {
          id: Crypto.randomUUID(),
          name: item.exercise_name,
          sets,
        };
      });

      setExercises(formattedExercises);
    } catch (error: any) {
      console.error("Fetch Error:", error.message);
      Alert.alert("Error", "Failed to load plan exercises.");
    } finally {
      setLoading(false);
    }
  };

  const finishWorkout = async () => {
    if (exercises.length === 0) return;

    setIsFinishing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const endTime = new Date();
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

      // 1. Create Workout Log (schema: user_id, plan_id, workout_name, duration_minutes, completed_at)
      const { data: log, error: logError } = await supabase
        .from("workout_logs")
        .insert([{
          user_id: session.user.id,
          plan_id: planId || null,
          workout_name: planName || "Untitled Workout",
          duration_minutes: durationMinutes,
          completed_at: endTime.toISOString()
        }])
        .select()
        .single();

      if (logError) throw logError;

      // 2. Save Sets (schema: workout_log_id, user_id, exercise_name, weight, reps, set_number, is_completed)
      const setsToInsert = exercises.flatMap((ex) =>
        ex.sets.map((set, index) => ({
          workout_log_id: log.id,
          user_id: session.user.id,
          exercise_name: ex.name,
          weight: parseFloat(set.weight || "0"),
          reps: parseInt(set.reps || "0"),
          set_number: index + 1,
          is_completed: true
        }))
      );

      const { error: setsError } = await supabase
        .from("exercise_sets")
        .insert(setsToInsert);

      if (setsError) throw setsError;

      Alert.alert("Victory!", "Workout completed and saved!");
      router.replace("/screens/logger/workout-log");
    } catch (error: any) {
      console.error("Finish Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setIsFinishing(false);
    }
  };

  const isWorkoutComplete = exercises.length > 0 && exercises.every((ex) =>
    ex.sets.every((s) => s.checked),
  );

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        id: Crypto.randomUUID(),
        name: "",
        sets: [
          {
            id: Crypto.randomUUID(),
            weight: "",
            reps: "",
            checked: false,
            isUnlocked: true,
            prevWeight: "—",
          },
        ],
      },
    ]);
  };

  const deleteExercise = (exId: string) => {
    setExercises((prev) => prev.filter((item) => item.id !== exId));
  };

  const addSet = (exId: string) => {
    setExercises((prev) =>
      prev.map((item) => {
        if (item.id === exId) {
          const lastSet = item.sets[item.sets.length - 1];
          const shouldBeUnlocked = lastSet ? lastSet.checked : true;

          return {
            ...item,
            sets: [
              ...item.sets,
              {
                id: Crypto.randomUUID(),
                weight: lastSet ? lastSet.weight : "—",
                reps: lastSet ? lastSet.reps : "—",
                checked: false,
                isUnlocked: shouldBeUnlocked,
                prevWeight: lastSet?.prevWeight || "—",
              },
            ],
          };
        }
        return item;
      }),
    );
  };

  const updateSet = (
    exId: string,
    setId: string,
    updates: Partial<SetEntry>,
  ) => {
    setExercises((prev) =>
      prev.map((item) => {
        if (item.id === exId) {
          const newSets = item.sets.map((s) =>
            s.id === setId ? { ...s, ...updates } : s,
          );

          return {
            ...item,
            sets: newSets.map((s, i) => {
              const prevSet = newSets[i - 1];
              if (i === 0 || prevSet?.checked || s.isUnlocked) {
                return { ...s, isUnlocked: true };
              }
              return s;
            }),
          };
        }
        return item;
      }),
    );
  };

  const deleteSet = (exId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((item) => {
        if (item.id === exId) {
          if (item.sets.length <= 1) return item;
          return { ...item, sets: item.sets.filter((s) => s.id !== setId) };
        }
        return item;
      }),
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={main.container}
    >
      <BackButton color={colors.blue} />
      <ScrollView
        contentContainerStyle={exercise.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 50 }} />
        ) : (
          <>
            {exercises.map((ex, exIdx) => (
              <ExerciseCard
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
                onDeleteExercise={() => deleteExercise(ex.id)}
                onUpdateSet={(setId, updates) => updateSet(ex.id, setId, updates)}
                onAddSet={() => addSet(ex.id)}
                onDeleteSet={(setId) => deleteSet(ex.id, setId)}
              />
            ))}

            <TouchableOpacity style={exercise.addExerciseBtn} onPress={addExercise}>
              <Text style={exercise.addExerciseText}>+ ADD EXERCISE</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <View style={exercise.fixedFooter}>
        <TouchableOpacity
          style={[
            logger.submitBtn,
            {
              backgroundColor: isWorkoutComplete ? colors.blue : colors.divider,
            },
            isFinishing && { opacity: 0.7 }
          ]}
          disabled={!isWorkoutComplete || isFinishing}
          onPress={finishWorkout}
        >
          {isFinishing ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text
              style={[
                logger.submitBtnText,
                { color: isWorkoutComplete ? colors.white : colors.textDark },
              ]}
            >
              FINISH WORKOUT
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

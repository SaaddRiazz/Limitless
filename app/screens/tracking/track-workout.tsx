import { BackButton } from "@/components/ui/back-button";
import { ExerciseCard } from "@/components/ui/exercise-card";
import { supabase } from "@/lib/supabase";
import { addXP, XP_VALUES } from "@/lib/xp-service";
import { colors } from "@/styles/colors";
import { auth } from "@/styles/style";
import * as Crypto from "expo-crypto";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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
  const { planId, planName, isGlobal } = useLocalSearchParams<{
    planId: string;
    planName: string;
    isGlobal: string;
  }>();

  const isGlobalWorkout = isGlobal === "true";

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const [startTime] = useState(new Date());
  const [historySets, setHistorySets] = useState<any[]>([]);

  useEffect(() => {
    if (planId) {
      initWorkout();
    } else {
      setLoading(false);
    }
  }, [planId]);

  const initWorkout = async () => {
    setLoading(true);
    try {
      let planExData: any[] = [];

      if (isGlobalWorkout) {
        const { data, error } = await supabase
          .from("global_workout_exercises")
          .select("*")
          .eq("workout_id", planId)
          .order("order_index", { ascending: true });

        if (error) throw error;
        planExData = data || [];
      } else {
        const { data, error } = await supabase
          .from("plan_exercises")
          .select("*")
          .eq("plan_id", planId)
          .order("order_index", { ascending: true });

        if (error) throw error;
        planExData = data || [];
      }

      let prevSets: any[] = [];

      if (!isGlobalWorkout) {
        const { data: lastLog } = await supabase
          .from("workout_logs")
          .select("id")
          .eq("plan_id", planId)
          .order("completed_at", { ascending: false })
          .limit(1)
          .single();

        if (lastLog) {
          const { data: lastSets } = await supabase
            .from("exercise_sets")
            .select("exercise_name, weight, set_number")
            .eq("workout_log_id", lastLog.id);

          prevSets = lastSets || [];
          setHistorySets(prevSets);
        }
      }

      const formattedExercises = planExData.map((item: any) => {
        const setsCount = parseInt(item.target_sets) || 1;
        const sets = Array.from({ length: setsCount }).map((_, i) => {
          const matchingPrevSet = prevSets.find(
            (ps) =>
              ps.exercise_name === item.exercise_name &&
              ps.set_number === i + 1,
          );

          return {
            id: Crypto.randomUUID(),
            weight: item.target_weight?.toString() || "",
            reps: item.target_reps?.toString() || "",
            checked: false,
            isUnlocked: i === 0,
            prevWeight: matchingPrevSet
              ? matchingPrevSet.weight.toString()
              : "—",
          };
        });

        return {
          id: Crypto.randomUUID(),
          name: item.exercise_name,
          sets,
        };
      });

      setExercises(formattedExercises);
    } catch (error: any) {
      console.error("Init Error:", error.message);
      Alert.alert("Error", "Failed to load workout details.");
    } finally {
      setLoading(false);
    }
  };

  const finishWorkout = async () => {
    if (exercises.length === 0) return;

    setIsFinishing(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const endTime = new Date();
      const durationMinutes = Math.round(
        (endTime.getTime() - startTime.getTime()) / 60000,
      );

      const { data: log, error: logError } = await supabase
        .from("workout_logs")
        .insert([
          {
            user_id: session.user.id,
            plan_id: isGlobalWorkout ? null : (planId || null),
            workout_name: planName || "Untitled Workout",
            duration_minutes: durationMinutes,
            completed_at: endTime.toISOString(),
          },
        ])
        .select()
        .single();

      if (logError) throw logError;

      const setsToInsert = exercises.flatMap((ex) =>
        ex.sets.map((set, index) => ({
          workout_log_id: log.id,
          user_id: session.user.id,
          exercise_name: ex.name,
          weight: parseFloat(set.weight || "0"),
          reps: parseInt(set.reps || "0"),
          set_number: index + 1,
          is_completed: set.checked,
        })),
      );

      const { error: setsError } = await supabase
        .from("exercise_sets")
        .insert(setsToInsert);

      if (setsError) throw setsError;

      await addXP(XP_VALUES.WORKOUT_COMPLETE);
      Alert.alert("Victory!", "Workout completed and saved!");
      router.dismissAll();
      router.push("/screens/logger/workout-log");
    } catch (error: any) {
      console.error("Finish Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setIsFinishing(false);
    }
  };

  const isWorkoutComplete =
    exercises.length > 0 &&
    exercises.every((ex) => ex.sets.every((s) => s.checked));

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
          const newSetNumber = item.sets.length + 1;
          const shouldBeUnlocked = lastSet ? lastSet.checked : true;

          const matchingPrevSet = historySets.find(
            (ps) =>
              ps.exercise_name === item.name && ps.set_number === newSetNumber,
          );

          return {
            ...item,
            sets: [
              ...item.sets,
              {
                id: Crypto.randomUUID(),
                weight: lastSet ? lastSet.weight : "",
                reps: lastSet ? lastSet.reps : "",
                checked: false,
                isUnlocked: shouldBeUnlocked,
                prevWeight: matchingPrevSet
                  ? matchingPrevSet.weight.toString()
                  : "—",
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
    <LinearGradient colors={["#020205", "#0a0a1a"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
          <BackButton color={colors.blue} />
          <Text style={[auth.title, { paddingStart: 0, marginTop: 10, marginBottom: 15 }]}>
            {planName ? planName.toUpperCase() : "ACTIVE WORKOUT"}
          </Text>
        </View>
        <View style={styles.fullLine} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator
              size="large"
              color={colors.blue}
              style={{ marginTop: 50 }}
            />
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
                  onUpdateSet={(setId, updates) =>
                    updateSet(ex.id, setId, updates)
                  }
                  onAddSet={() => addSet(ex.id)}
                  onDeleteSet={(setId) => deleteSet(ex.id, setId)}
                />
              ))}

              <TouchableOpacity
                style={styles.addExerciseBtn}
                onPress={addExercise}
              >
                <Text style={styles.addExerciseText}>+ ADD EXERCISE</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

        <View style={styles.fixedFooter}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.finishBtnWrapper, !isWorkoutComplete && { opacity: 0.5 }]}
            disabled={!isWorkoutComplete || isFinishing}
            onPress={finishWorkout}
          >
            <LinearGradient
              colors={isWorkoutComplete ? ["#007AFF", "#003b82"] : ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.finishBtn}
            >
              {isFinishing ? (
                <ActivityIndicator color={isWorkoutComplete ? "#fff" : "rgba(255,255,255,0.4)"} />
              ) : (
                <Text
                  style={[
                    styles.finishBtnText,
                    { color: isWorkoutComplete ? "#fff" : "rgba(255, 255, 255, 0.3)" },
                  ]}
                >
                  FINISH WORKOUT
                </Text>
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
  finishBtnWrapper: {
    borderRadius: 15,
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  finishBtn: {
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  finishBtnText: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
});

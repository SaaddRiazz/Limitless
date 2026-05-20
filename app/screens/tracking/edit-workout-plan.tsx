import { BackButton } from "@/components/ui/back-button";
import { PlanExerciseCard } from "@/components/ui/plan-exercise-card";
import { supabase } from "@/lib/supabase";
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
  id?: string;
  tempId: string;
  name: string;
  sets: SetEntry[];
}

export default function EditWorkoutPlan() {
  const { planId } = useLocalSearchParams();
  const router = useRouter();
  const [planName, setPlanName] = useState("");
  const [exercises, setExercises] = useState<PlanExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPlanDetails();
  }, [planId]);

  const fetchPlanDetails = async () => {
    try {
      const { data: plan, error: planError } = await supabase
        .from("workout_plans")
        .select(`*, plan_exercises(*)`)
        .eq("id", planId)
        .single();

      if (planError) throw planError;

      setPlanName(plan.name);
      const formattedExercises = plan.plan_exercises
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((ex: any) => ({
          id: ex.id,
          tempId: Crypto.randomUUID(),
          name: ex.exercise_name,
          sets: Array.from({ length: ex.target_sets }).map(() => ({
            id: Crypto.randomUUID(),
            weight: ex.target_weight.toString(),
            reps: ex.target_reps.toString(),
          })),
        }));
      setExercises(formattedExercises);
    } catch (error: any) {
      Alert.alert("Error", "Could not load plan details.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        tempId: Crypto.randomUUID(),
        name: "",
        sets: [{ id: Crypto.randomUUID(), weight: "", reps: "" }],
      },
    ]);
  };

  const deleteExercise = (tempId: string) => {
    setExercises((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const addSet = (tempId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.tempId === tempId) {
          const lastSet = ex.sets[ex.sets.length - 1];
          return {
            ...ex,
            sets: [
              ...ex.sets,
              {
                id: Crypto.randomUUID(),
                weight: lastSet?.weight || "",
                reps: lastSet?.reps || "",
              },
            ],
          };
        }
        return ex;
      }),
    );
  };

  const updateSet = (
    tempId: string,
    setId: string,
    updates: Partial<SetEntry>,
  ) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.tempId === tempId) {
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

  const handleUpdatePlan = async () => {
    if (!planName.trim() || exercises.some((ex) => !ex.name.trim())) {
      Alert.alert("Error", "Please fill in all names.");
      return;
    }

    setIsSaving(true);
    try {
      await supabase
        .from("workout_plans")
        .update({
          name: planName,
          description: `${exercises.length} Exercises`,
        })
        .eq("id", planId);

      await supabase.from("plan_exercises").delete().eq("plan_id", planId);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const exercisesToInsert = exercises.map((ex, index) => ({
        plan_id: planId,
        user_id: session?.user.id,
        exercise_name: ex.name,
        target_sets: ex.sets.length,
        target_reps: parseInt(ex.sets[0]?.reps || "0"),
        target_weight: parseFloat(ex.sets[0]?.weight || "0"),
        order_index: index,
      }));

      await supabase.from("plan_exercises").insert(exercisesToInsert);

      Alert.alert("Success", "Routine updated!");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
          <BackButton color={colors.blue} />
          <Text style={[auth.title, { paddingStart: 0, marginTop: 10, marginBottom: 15 }]}>
            EDIT ROUTINE
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
              key={ex.tempId}
              ex={{ ...ex, id: ex.tempId }}
              exIdx={exIdx}
              onUpdateName={(n) =>
                setExercises(
                  exercises.map((e) =>
                    e.tempId === ex.tempId ? { ...e, name: n } : e,
                  ),
                )
              }
              onUpdateSet={(sid, up) => updateSet(ex.tempId, sid, up)}
              onDeleteExercise={() => deleteExercise(ex.tempId)}
              onAddSet={() => addSet(ex.tempId)}
              onDeleteSet={(sid) =>
                setExercises(
                  exercises.map((e) =>
                    e.tempId === ex.tempId
                      ? { ...e, sets: e.sets.filter((s) => s.id !== sid) }
                      : e,
                  ),
                )
              }
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
            onPress={handleUpdatePlan}
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
                <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
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

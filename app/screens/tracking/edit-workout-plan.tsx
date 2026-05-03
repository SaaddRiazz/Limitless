import { BackButton } from "@/components/ui/back-button";
import { PlanExerciseCard } from "@/components/ui/plan-exercise-card";
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

  if (loading)
    return (
      <View style={[main.container, { justifyContent: "center" }]}>
        <ActivityIndicator color={colors.blue} />
      </View>
    );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={main.container}
    >
      <View>
        <BackButton color={colors.blue} />
        <Text style={[logger.sectionTitle, { marginTop: 10 }]}>
          Edit Routine
        </Text>
        <TextInput
          style={[
            exercise.exerciseInput,
            {
              fontSize: 24,
              color: colors.blue,
              borderBottomWidth: 1,
              borderBottomColor: colors.cardBorder,
            },
          ]}
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
        <TouchableOpacity style={exercise.addExerciseBtn} onPress={addExercise}>
          <Text style={exercise.addExerciseText}>+ ADD EXERCISE</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={exercise.fixedFooter}>
        <TouchableOpacity
          style={[logger.submitBtn, { backgroundColor: colors.blue }]}
          onPress={handleUpdatePlan}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={logger.submitBtnText}>SAVE CHANGES</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

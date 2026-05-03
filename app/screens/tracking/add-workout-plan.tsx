import { BackButton } from "@/components/ui/back-button";
import { PlanExerciseCard } from "@/components/ui/plan-exercise-card";
import { colors } from "@/styles/colors";
import { exercise, logger, main } from "@/styles/style";
import * as Crypto from "expo-crypto";
import React, { useState } from "react";
import {
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

  const handleSavePlan = () => {
    const planData = {
      title: planName || "New Routine",
      exercises: exercises,
    };
    console.log("Saving Plan:", JSON.stringify(planData, null, 2));
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
          style={[logger.submitBtn, { backgroundColor: colors.blue }]}
          onPress={handleSavePlan}
        >
          <Text style={[logger.submitBtnText, { color: colors.white }]}>
            SAVE ROUTINE
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

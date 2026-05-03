import { BackButton } from "@/components/ui/back-button";
import { ExerciseCard } from "@/components/ui/exercise-card";
import { colors } from "@/styles/colors";
import { exercise, logger, main } from "@/styles/style";
import * as Crypto from "expo-crypto";
import React, { useState } from "react";
import {
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
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: Crypto.randomUUID(),
      name: "Bench Press",
      sets: [
        {
          id: Crypto.randomUUID(),
          weight: "",
          reps: "",
          checked: false,
          isUnlocked: true,
          prevWeight: "40kg",
        },
      ],
    },
  ]);

  const isWorkoutComplete = exercises.every((ex) =>
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
      </ScrollView>

      <View style={exercise.fixedFooter}>
        <TouchableOpacity
          style={[
            logger.submitBtn,
            {
              backgroundColor: isWorkoutComplete ? colors.blue : colors.divider,
            },
          ]}
          disabled={!isWorkoutComplete}
          onPress={() => console.log("Data:", exercises)}
        >
          <Text
            style={[
              logger.submitBtnText,
              { color: isWorkoutComplete ? colors.white : colors.textDark },
            ]}
          >
            FINISH WORKOUT
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

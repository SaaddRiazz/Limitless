import { colors } from "@/styles/colors";
import { exercise } from "@/styles/style";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

interface SetEntry {
  id: string;
  weight: string;
  reps: string;
  checked: boolean;
  isUnlocked: boolean;
  prevWeight?: string;
}

interface ExerciseCardProps {
  ex: {
    id: string;
    name: string;
    sets: SetEntry[];
  };
  exIdx: number;
  onUpdateName: (name: string) => void;
  onUpdateSet: (setId: string, updates: Partial<SetEntry>) => void;
  onAddSet: () => void;
  onDeleteSet: (setId: string) => void;
  onDeleteExercise: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  ex,
  exIdx,
  onUpdateName,
  onUpdateSet,
  onAddSet,
  onDeleteSet,
  onDeleteExercise,
}) => {
  const handleSetDeletion = (setId: string) => {
    if (ex.sets.length <= 1) {
      Alert.alert(
        "Remove Exercise?",
        "Deleting the only set will remove the whole exercise.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: onDeleteExercise },
        ],
      );
    } else {
      onDeleteSet(setId);
    }
  };

  return (
    <View style={exercise.exerciseCard}>
      <View style={exercise.cardHeader}>
        <Text style={exercise.exerciseTitle}>EXERCISE {exIdx + 1}</Text>
        <TouchableOpacity onPress={onDeleteExercise}>
          <MaterialCommunityIcons
            name="close-circle-outline"
            size={20}
            color={colors.textDark}
          />
        </TouchableOpacity>
      </View>

      <TextInput
        style={exercise.exerciseInput}
        value={ex.name}
        onChangeText={onUpdateName}
        placeholder="Exercise Name"
        placeholderTextColor="#444"
      />

      <View style={exercise.setRow}>
        <Text style={[exercise.headerText, { width: 30 }]}>SET</Text>
        <Text style={[exercise.headerText, { flex: 1 }]}>WEIGHT</Text>
        <Text style={[exercise.headerText, { flex: 1 }]}>REPS</Text>
        <Text style={[exercise.headerText, { flex: 1 }]}>PREV</Text>
        <View style={{ width: 60 }} />
      </View>

      {ex.sets.map((set, sIdx) => {
        const isDisabled = !set.isUnlocked;

        return (
          <View key={set.id} style={exercise.setRow}>
            <View
              style={[exercise.interactiveRow, isDisabled && { opacity: 0.3 }]}
              pointerEvents={isDisabled ? "none" : "auto"}
            >
              <Text style={exercise.setNumber}>{sIdx + 1}</Text>
              <TextInput
                style={exercise.input}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#444"
                value={set.weight}
                onChangeText={(v) => onUpdateSet(set.id, { weight: v })}
              />
              <TextInput
                style={exercise.input}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#444"
                value={set.reps}
                onChangeText={(v) => onUpdateSet(set.id, { reps: v })}
              />

              <View style={exercise.prevContainer}>
                <Text style={exercise.prevText}>{set.prevWeight || "—"}</Text>
              </View>

              <TouchableOpacity
                onPress={() => onUpdateSet(set.id, { checked: !set.checked })}
                style={exercise.checkBtn}
              >
                <MaterialCommunityIcons
                  name={
                    set.checked ? "checkbox-marked" : "checkbox-blank-outline"
                  }
                  size={24}
                  color={set.checked ? colors.green : colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => handleSetDeletion(set.id)}>
              <MaterialCommunityIcons
                name="delete"
                size={20}
                color={colors.red}
              />
            </TouchableOpacity>
          </View>
        );
      })}

      <TouchableOpacity style={exercise.addSetBtn} onPress={onAddSet}>
        <Text style={exercise.addSetText}>+ ADD SET</Text>
      </TouchableOpacity>
    </View>
  );
};

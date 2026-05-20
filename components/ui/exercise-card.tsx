import { colors } from "@/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

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
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.exerciseTitle}>EXERCISE {exIdx + 1}</Text>
        <TouchableOpacity onPress={onDeleteExercise}>
          <MaterialCommunityIcons
            name="close-circle-outline"
            size={22}
            color="rgba(255, 255, 255, 0.4)"
          />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.exerciseInput}
        value={ex.name}
        onChangeText={onUpdateName}
        placeholder="Exercise Name"
        placeholderTextColor="rgba(255, 255, 255, 0.25)"
      />

      <View style={styles.setTableHeader}>
        <Text style={[styles.headerText, { width: 35 }]}>SET</Text>
        <Text style={[styles.headerText, { flex: 1 }]}>WEIGHT</Text>
        <Text style={[styles.headerText, { flex: 1 }]}>REPS</Text>
        <Text style={[styles.headerText, { flex: 1 }]}>PREV</Text>
        <View style={{ width: 45 }} />
      </View>

      {ex.sets.map((set, sIdx) => {
        const isDisabled = !set.isUnlocked;

        return (
          <View key={set.id} style={styles.setRow}>
            <View
              style={[styles.interactiveRow, isDisabled && { opacity: 0.3 }]}
              pointerEvents={isDisabled ? "none" : "auto"}
            >
              <Text style={styles.setNumber}>{sIdx + 1}</Text>
              
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="rgba(255, 255, 255, 0.2)"
                value={set.weight}
                onChangeText={(v) => onUpdateSet(set.id, { weight: v })}
              />
              
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="rgba(255, 255, 255, 0.2)"
                value={set.reps}
                onChangeText={(v) => onUpdateSet(set.id, { reps: v })}
              />

              <View style={styles.prevContainer}>
                <Text style={styles.prevText}>{set.prevWeight || "—"}</Text>
              </View>

              <TouchableOpacity
                onPress={() => onUpdateSet(set.id, { checked: !set.checked })}
                style={styles.checkBtn}
              >
                <MaterialCommunityIcons
                  name={set.checked ? "checkbox-marked" : "checkbox-blank-outline"}
                  size={24}
                  color={set.checked ? colors.green : "rgba(255, 255, 255, 0.3)"}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => handleSetDeletion(set.id)} style={{ paddingLeft: 5 }}>
              <MaterialCommunityIcons
                name="delete-outline"
                size={20}
                color={colors.red}
              />
            </TouchableOpacity>
          </View>
        );
      })}

      <TouchableOpacity style={styles.addSetBtn} onPress={onAddSet}>
        <Text style={styles.addSetText}>+ ADD SET</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  exerciseTitle: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
  },
  exerciseInput: {
    backgroundColor: "#161622",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    padding: 12,
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 15,
  },
  setTableHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  headerText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 1,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    gap: 8,
  },
  interactiveRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  setNumber: {
    color: "#fff",
    width: 35,
    textAlign: "center",
    fontWeight: "900",
    fontStyle: "italic",
    fontSize: 14,
  },
  input: {
    flex: 1,
    backgroundColor: "#161622",
    color: "#fff",
    textAlign: "center",
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    fontSize: 15,
    fontWeight: "600",
  },
  prevContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  prevText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontWeight: "600",
    fontSize: 14,
  },
  checkBtn: {
    width: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  addSetBtn: {
    marginTop: 15,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  addSetText: {
    color: colors.blue,
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
});

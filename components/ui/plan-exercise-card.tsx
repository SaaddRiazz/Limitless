import { colors } from "@/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "@/lib/supabase";

interface SetEntry {
  id: string;
  weight: string;
  reps: string;
}

interface PlanExerciseCardProps {
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

export const PlanExerciseCard: React.FC<PlanExerciseCardProps> = ({
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
        "A plan needs at least one set per exercise.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: onDeleteExercise },
        ],
      );
    } else {
      onDeleteSet(setId);
    }
  };

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const searchExercises = async () => {
      let query = supabase.from("global_exercises").select("*");
      if (ex.name.trim()) {
        query = query.ilike("name", `%${ex.name.trim()}%`);
      }
      const { data } = await query.limit(10);
      setSearchResults(data || []);
    };
    
    const timeout = setTimeout(searchExercises, 300);
    return () => clearTimeout(timeout);
  }, [ex.name]);

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

      <View style={{ zIndex: 100, marginBottom: 15 }}>
        <TextInput
          style={styles.exerciseInput}
          value={ex.name}
          onChangeText={onUpdateName}
          placeholder="Exercise Name"
          placeholderTextColor="rgba(255, 255, 255, 0.25)"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
        
        {isFocused && searchResults.length > 0 && (
          <View style={styles.searchResultsContainer}>
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.searchResultItem}
                onPress={() => {
                  onUpdateName(item.name);
                  setIsFocused(false);
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.setTableHeader}>
        <Text style={[styles.headerText, { width: 35 }]}>SET</Text>
        <Text style={[styles.headerText, { flex: 1 }]}>WEIGHT</Text>
        <Text style={[styles.headerText, { flex: 1 }]}>REPS</Text>
        <View style={{ width: 30 }} />
      </View>

      {ex.sets.map((set, sIdx) => (
        <View key={set.id} style={styles.setRow}>
          <View style={styles.interactiveRow}>
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
          </View>

          <TouchableOpacity onPress={() => handleSetDeletion(set.id)} style={{ paddingLeft: 5 }}>
            <MaterialCommunityIcons
              name="delete-outline"
              size={20}
              color={colors.red}
            />
          </TouchableOpacity>
        </View>
      ))}

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
  },
  searchResultsContainer: {
    backgroundColor: "#0a0a14",
    borderRadius: 12,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    flexDirection: "row",
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

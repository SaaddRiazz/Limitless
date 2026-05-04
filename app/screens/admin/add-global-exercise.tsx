import { BackButton } from "@/components/ui/back-button";
import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { auth, logger, main } from "@/styles/style";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddGlobalExercise() {
  const [name, setName] = useState("");
  const [met, setMet] = useState("");

  const handleSave = async () => {
    if (!name || !met) return Alert.alert("Error", "Fill all fields");
    const { error } = await supabase.from("global_exercises").insert([
      {
        name,
        met_value: parseFloat(met),
      },
    ]);
    if (!error) {
      Alert.alert("Success", "Exercise added to library");
      setName("");
      setMet("");
    }
  };

  return (
    <View style={main.container}>
      <BackButton color={colors.green} />
      <View style={{ padding: 20 }}>
        <Text style={logger.sectionTitle}>Add Global Exercise</Text>
        <Text style={styles.label}>EXERCISE NAME</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Bench Press"
          placeholderTextColor="#333"
        />

        <Text style={styles.label}>MET VALUE (Metabolic Equivalent)</Text>
        <TextInput
          style={styles.input}
          value={met}
          onChangeText={setMet}
          keyboardType="numeric"
          placeholder="e.g. 6.0"
          placeholderTextColor="#333"
        />
        <Text style={styles.hint}>
          MET is used for calculating calories burned based on body weight and
          duration.
        </Text>

        <TouchableOpacity
          style={[auth.filledBtn, { backgroundColor: colors.green }]}
          onPress={handleSave}
        >
          <Text style={[auth.filledBtnText, { color: "#000" }]}>
            ADD TO LIBRARY
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#111",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#222",
  },
  hint: { color: "#666", fontSize: 12, marginBottom: 20 },
});

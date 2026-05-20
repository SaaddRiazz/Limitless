import { BackButton } from "@/components/ui/back-button";
import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { auth } from "@/styles/style";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function AddGlobalExercise() {
  const [name, setName] = useState("");

  const handleSave = async () => {
    if (!name) return Alert.alert("Error", "Fill all fields");
    const { error } = await supabase.from("global_exercises").insert([
      {
        name,
      },
    ]);
    if (!error) {
      Alert.alert("Success", "Exercise added to library");
      setName("");
    }
  };

  return (
    <LinearGradient colors={["#020205", "#0a0a1a"]} style={styles.container}>
      <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
        <BackButton color={colors.green} />
        <Text style={[auth.title, { paddingStart: 0, marginTop: 10, marginBottom: 15 }]}>
          ADD EXERCISE
        </Text>
      </View>
      <View style={styles.fullLine} />

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>EXERCISE NAME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Incline Bench Press"
            placeholderTextColor="rgba(255, 255, 255, 0.25)"
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.saveBtnWrapper}
          onPress={handleSave}
        >
          <LinearGradient
            colors={["#4ec42a", "#256214"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveBtn}
          >
            <Text style={styles.saveBtnText}>ADD TO LIBRARY</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  content: {
    padding: 20,
    paddingTop: 30,
  },
  inputContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 15,
    marginBottom: 25,
  },
  inputLabel: {
    color: colors.green,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#161622",
    color: "#fff",
    padding: 14,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    fontSize: 16,
    fontWeight: "600",
  },
  saveBtnWrapper: {
    borderRadius: 15,
    shadowColor: colors.green,
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

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { logger, main } from "../../../styles/style";

export default function WorkoutLog() {
  return (
    <View style={main.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={logger.sectionTitle}>Active Session</Text>

        <View style={[logger.exerciseCard, { borderLeftColor: "#2196F3" }]}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
              Incline Bench Press
            </Text>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={20}
              color="#555"
            />
          </View>

          <View style={logger.setInput}>
            <Text style={{ color: "#888" }}>Set 1</Text>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>100kg x 8</Text>
            <MaterialCommunityIcons
              name="check-circle"
              size={22}
              color="#69ff3c"
            />
          </View>
        </View>

        <TouchableOpacity style={logger.photoSlot}>
          <Text style={{ color: "#555", fontWeight: "bold" }}>
            + ADD EXERCISE
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={{ padding: 20 }}>
        <TouchableOpacity
          style={[logger.submitBtn, { backgroundColor: "#2196F3" }]}
        >
          <Text style={logger.submitBtnText}>FINISH WORKOUT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

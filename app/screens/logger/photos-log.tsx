import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { logger, main } from "../../../styles/style";

export default function PhotosLog() {
  return (
    <View style={main.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={logger.sectionTitle}>Gains Gallery</Text>

        <View style={logger.photoGrid}>
          <TouchableOpacity style={logger.photoSlot}>
            <MaterialCommunityIcons
              name="camera-plus"
              size={32}
              color="#a29bfe"
            />
            <Text
              style={{
                color: "#a29bfe",
                fontSize: 10,
                marginTop: 8,
                fontWeight: "bold",
              }}
            >
              NEW ENTRY
            </Text>
          </TouchableOpacity>

          <View
            style={[
              logger.photoSlot,
              { borderStyle: "solid", backgroundColor: "#1a1a1a" },
            ]}
          >
            <MaterialCommunityIcons name="image" size={32} color="#333" />
            <Text style={{ color: "#444", fontSize: 10, marginTop: 8 }}>
              Oct 24
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={{ padding: 20 }}>
        <TouchableOpacity
          style={[logger.submitBtn, { backgroundColor: "#a29bfe" }]}
        >
          <Text style={logger.submitBtnText}>COMPARE PROGRESS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

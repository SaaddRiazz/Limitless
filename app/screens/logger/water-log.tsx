import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { logger, main } from "../../../styles/style";

export default function WaterLog() {
  const [ml, setMl] = useState(0);

  return (
    <View style={[main.container, { padding: 20 }]}>
      <View style={logger.centerWrapper}>
        <MaterialCommunityIcons name="water" size={80} color="#35d7ff" />
        <Text style={logger.largeValue}>
          {ml}
          <Text style={logger.unitText}> ml</Text>
        </Text>
        <Text style={logger.macroLabel}>DAILY TOTAL</Text>
      </View>

      <Text style={logger.sectionTitle}>Quick Add</Text>
      <View style={logger.quickAddGrid}>
        {[250, 500, 750].map((amt) => (
          <TouchableOpacity
            key={amt}
            style={logger.quickAddBtn}
            onPress={() => setMl(ml + amt)}
          >
            <Text style={{ color: "#35d7ff", fontWeight: "bold" }}>
              +{amt}ml
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[logger.submitBtn, { backgroundColor: "#35d7ff" }]}
      >
        <Text style={logger.submitBtnText}>CONFIRM LOG</Text>
      </TouchableOpacity>
    </View>
  );
}

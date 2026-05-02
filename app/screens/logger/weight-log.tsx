import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { logger, main } from "../../../styles/style";

export default function WeightLog() {
  const [weight, setWeight] = useState("82.4");

  return (
    <View style={[main.container, { padding: 20 }]}>
      <View style={logger.centerWrapper}>
        <Text style={logger.sectionTitle}>Current Mass</Text>
        <TextInput
          style={logger.largeValue}
          keyboardType="decimal-pad"
          value={weight}
          onChangeText={setWeight}
        />
        <Text style={logger.unitText}>KILOGRAMS</Text>
      </View>

      <TouchableOpacity
        style={[logger.submitBtn, { backgroundColor: "#fffa64" }]}
      >
        <Text style={logger.submitBtnText}>UPDATE BIOMETRICS</Text>
      </TouchableOpacity>
    </View>
  );
}

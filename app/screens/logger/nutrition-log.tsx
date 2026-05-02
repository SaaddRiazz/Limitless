import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { logger, main } from "../../../styles/style";

export default function NutritionLog() {
  const Macro = ({ label, value, color }: any) => (
    <View style={logger.macroItem}>
      <Text style={logger.macroLabel}>{label}</Text>
      <Text style={{ color: color, fontSize: 22, fontWeight: "900" }}>
        {value}g
      </Text>
    </View>
  );

  return (
    <ScrollView style={main.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={logger.sectionTitle}>Daily Summary</Text>
      <View style={{ alignItems: "center", marginVertical: 20 }}>
        <Text style={logger.largeValue}>1,840</Text>
        <Text style={logger.unitText}>kcal</Text>
      </View>

      <View style={logger.macroContainer}>
        <Macro label="PRO" value="165" color="#69ff3c" />
        <Macro label="CARB" value="210" color="#2196F3" />
        <Macro label="FAT" value="55" color="#fffa64" />
      </View>

      <TouchableOpacity
        style={[
          logger.submitBtn,
          { backgroundColor: "#69ff3c", marginTop: 40 },
        ]}
      >
        <Text style={logger.submitBtnText}>ADD MEAL</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

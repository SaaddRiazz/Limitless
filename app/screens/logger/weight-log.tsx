import { BackButton } from "@/components/ui/back-button";
import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { colors } from "../../../styles/colors";
import { logger, main } from "../../../styles/style";

export default function WeightLog() {
  const [weight, setWeight] = useState("75");
  const [height, setHeight] = useState("180");

  const weightInputRef = useRef<TextInput>(null);
  const heightInputRef = useRef<TextInput>(null);

  const [history, setHistory] = useState([
    { date: "04/01", val: 88.2 },
    { date: "04/02", val: 88.0 },
    { date: "04/03", val: 88.1 },
    { date: "04/12", val: 86.6 },
    { date: "04/13", val: 86.2 },
    { date: "04/04", val: 87.8 },
    { date: "04/05", val: 87.5 },
    { date: "04/06", val: 87.6 },
    { date: "04/07", val: 87.2 },
    { date: "04/15", val: 86.0 },
    { date: "04/08", val: 87.0 },
    { date: "04/09", val: 87.1 },
    { date: "04/10", val: 86.8 },
    { date: "04/11", val: 86.5 },
    { date: "04/14", val: 85.9 },
  ]);

  const bmiData = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (!w || !h) return { score: "0.0", label: "---", color: "#666" };

    const scoreValue = w / (h * h);
    const score = scoreValue.toFixed(1);
    let label = "Normal";
    let color = colors.green;

    if (scoreValue < 18.5) {
      label = "Underweight";
      color = colors.cyan;
    } else if (scoreValue >= 25 && scoreValue < 30) {
      label = "Overweight";
      color = colors.orange;
    } else if (scoreValue >= 30) {
      label = "Obese";
      color = colors.red;
    }

    return { score, label, color };
  }, [weight, height]);

  const handleUpdate = () => {
    const newEntry = {
      date: new Date().toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
      }),
      val: parseFloat(weight),
    };
    setHistory([...history, newEntry]);
  };

  const chartData = {
    labels: history.slice(-5).map((h) => h.date),
    datasets: [
      {
        data: history.slice(-15).map((h) => Number(h.val)),
        color: () => colors.yellow,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: "#000",
    backgroundGradientFrom: "#000",
    backgroundGradientTo: "#0a0a0a",
    color: (opacity = 1) => `rgba(255, 250, 100, ${opacity})`,
    fillShadowGradientFrom: colors.yellow,
    fillShadowGradientTo: "#000",
    fillShadowGradientOpacity: 0.3,
    strokeWidth: 3,

    labelColor: (opacity = 1) => "#aaa",
    propsForBackgroundLines: { stroke: "#1a1a1a" },
  };

  return (
    <View style={main.container}>
      <BackButton color={colors.yellow} />
      <ScrollView>
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={logger.inputGroup}
            onPress={() => {
              weightInputRef.current?.blur();
              setTimeout(() => {
                weightInputRef.current?.focus();
              }, 50);
            }}
          >
            <Text style={logger.sectionTitle}>Body Mass</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "baseline",
                justifyContent: "space-between",
              }}
            >
              <TextInput
                ref={weightInputRef}
                style={[
                  logger.largeValue,
                  { color: colors.yellow, minWidth: 100, fontSize: 30 },
                ]}
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
              />
              <Text style={logger.unitText}> KG</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={logger.inputGroup}
            onPress={() => {
              heightInputRef.current?.blur();
              setTimeout(() => {
                heightInputRef.current?.focus();
              }, 50);
            }}
          >
            <Text style={logger.sectionTitle}>Height</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "baseline",
                justifyContent: "space-between",
              }}
            >
              <TextInput
                ref={heightInputRef}
                style={[
                  logger.largeValue,
                  { color: colors.yellow, minWidth: 100, fontSize: 30 },
                ]}
                keyboardType="decimal-pad"
                value={height}
                onChangeText={setHeight}
              />
              <Text style={logger.unitText}> CM</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: `${bmiData.color}15`,
            padding: 20,
            borderRadius: 12,
            marginVertical: 25,
            borderWidth: 1,
            borderColor: bmiData.color,
          }}
        >
          <Text style={{ color: "#666", fontSize: 12, fontWeight: "700" }}>
            CURRENT BMI
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 32, fontWeight: "800" }}>
              {bmiData.score}
            </Text>
            <Text
              style={{ color: bmiData.color, fontSize: 16, fontWeight: "600" }}
            >
              {bmiData.label.toUpperCase()}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            logger.submitBtn,
            { backgroundColor: colors.yellow, marginBottom: 40 },
          ]}
          onPress={handleUpdate}
        >
          <Text style={[logger.submitBtnText, { color: "#000" }]}>
            SAVE BIOMETRICS
          </Text>
        </TouchableOpacity>

        <Text style={[logger.sectionTitle, { marginBottom: 15 }]}>
          Weight Projection
        </Text>
        <View>
          <LineChart
            data={chartData}
            width={Dimensions.get("window").width - 20}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 16, marginLeft: -15 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

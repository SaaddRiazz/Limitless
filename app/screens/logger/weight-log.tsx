import { BackButton } from "@/components/ui/back-button";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { supabase } from "@/lib/supabase";
import { addXP, XP_VALUES } from "@/lib/xp-service";
import { colors } from "../../../styles/colors";
import { logger, main } from "../../../styles/style";

export default function WeightLog() {
  const [weight, setWeight] = useState("0");
  const [height, setHeight] = useState("0");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const weightInputRef = useRef<TextInput>(null);
  const heightInputRef = useRef<TextInput>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const user_id = session.user.id;

      // Fetch the most recent biometric entry for pre-filling fields
      const { data: latest_data, error: latest_error } = await supabase
        .from("biometrics")
        .select("weight_kg, height_cm")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (latest_error) throw latest_error;

      if (latest_data && latest_data.length > 0) {
        setWeight(latest_data[0].weight_kg.toString());
        setHeight(latest_data[0].height_cm.toString());
      }

      // Fetch last 15 entries for chart (ascending for chronological order)
      const { data: history_data, error: history_error } = await supabase
        .from("biometrics")
        .select("weight_kg, created_at")
        .eq("user_id", user_id)
        .order("created_at", { ascending: true })
        .limit(15);

      if (history_error) throw history_error;

      const formatted_history = (history_data || []).map((item) => ({
        date: new Date(item.created_at).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
        }),
        val: item.weight_kg,
      }));

      setHistory(formatted_history);
    } catch (error) {
      console.error("Error fetching weight data:", error);
    }
  };

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

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const user_id = session.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();
      const tomorrowStr = new Date(today.getTime() + 86400000).toISOString();

      // Check if an entry already exists for today
      const { data: existing } = await supabase
        .from("biometrics")
        .select("id")
        .eq("user_id", user_id)
        .gte("created_at", todayStr)
        .lt("created_at", tomorrowStr)
        .limit(1);

      if (existing && existing.length > 0) {
        // Update today's existing row
        const { error } = await supabase
          .from("biometrics")
          .update({
            weight_kg: parseFloat(weight),
            height_cm: parseFloat(height),
            bmi: parseFloat(bmiData.score),
          })
          .eq("id", existing[0].id);

        if (error) throw error;
      } else {
        // Insert a new row
        const { error } = await supabase
          .from("biometrics")
          .insert({
            user_id,
            weight_kg: parseFloat(weight),
            height_cm: parseFloat(height),
            bmi: parseFloat(bmiData.score),
          });

        if (error) throw error;
      }

      await addXP(XP_VALUES.WEIGHT_LOG);
      fetchInitialData();
    } catch (error) {
      console.error("Error updating biometrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: history.length > 0 ? history.slice(-5).map((h) => h.date) : ["-"],
    datasets: [
      {
        data: history.length > 0 ? history.slice(-15).map((h) => Number(h.val)) : [0],
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
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.black} />
          ) : (
            <Text style={[logger.submitBtnText, { color: "#000" }]}>
              SAVE BIOMETRICS
            </Text>
          )}
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

import { BackButton } from "@/components/ui/back-button";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { supabase } from "@/lib/supabase";
import { addXP, XP_VALUES } from "@/lib/xp-service";
import { colors } from "../../../styles/colors";
import { auth, logger, main } from "../../../styles/style";
import { LinearGradient } from "expo-linear-gradient";

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
    backgroundColor: "#020205",
    backgroundGradientFrom: "#020205",
    backgroundGradientTo: "#0a0a1a",
    color: (opacity = 1) => `rgba(255, 250, 100, ${opacity})`,
    fillShadowGradientFrom: colors.yellow,
    fillShadowGradientTo: "#020205",
    fillShadowGradientOpacity: 0.2,
    strokeWidth: 3,
    labelColor: (opacity = 1) => "rgba(255, 255, 255, 0.4)",
    propsForBackgroundLines: { stroke: "rgba(255, 255, 255, 0.05)" },
  };

  return (
    <LinearGradient colors={["#020205", "#0a0a1a"]} style={styles.container}>
      <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
        <BackButton color={colors.yellow} />
        <Text style={[auth.title, { paddingStart: 0, marginTop: 10, marginBottom: 15 }]}>
          BIOMETRICS
        </Text>
      </View>
      <View style={styles.fullLine} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={{ marginTop: 10 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.cardInput}
            onPress={() => {
              weightInputRef.current?.blur();
              setTimeout(() => {
                weightInputRef.current?.focus();
              }, 50);
            }}
          >
            <Text style={styles.inputLabel}>BODY MASS</Text>
            <View style={styles.inputValRow}>
              <TextInput
                ref={weightInputRef}
                style={styles.largeValue}
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
              />
              <Text style={styles.unitText}>KG</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.cardInput}
            onPress={() => {
              heightInputRef.current?.blur();
              setTimeout(() => {
                heightInputRef.current?.focus();
              }, 50);
            }}
          >
            <Text style={styles.inputLabel}>HEIGHT</Text>
            <View style={styles.inputValRow}>
              <TextInput
                ref={heightInputRef}
                style={styles.largeValue}
                keyboardType="decimal-pad"
                value={height}
                onChangeText={setHeight}
              />
              <Text style={styles.unitText}>CM</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: `${bmiData.color}10`,
            padding: 20,
            borderRadius: 20,
            marginVertical: 20,
            borderWidth: 1,
            borderColor: `${bmiData.color}35`,
          }}
        >
          <Text style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: 11, fontWeight: "900", letterSpacing: 1.5 }}>
            CURRENT BMI
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 5,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 32, fontWeight: "950", fontStyle: "italic" }}>
              {bmiData.score}
            </Text>
            <View style={{ backgroundColor: `${bmiData.color}15`, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: `${bmiData.color}25` }}>
              <Text style={{ color: bmiData.color, fontSize: 13, fontWeight: "900", letterSpacing: 0.5 }}>
                {bmiData.label.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.saveBtnWrapper}
          onPress={handleUpdate}
          disabled={loading}
        >
          <LinearGradient
            colors={["#fffa64", "#c7c22e"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveBtn}
          >
            {loading ? (
              <ActivityIndicator color={colors.black} />
            ) : (
              <Text style={styles.saveBtnText}>SAVE BIOMETRICS</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>WEIGHT PROJECTION</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={Dimensions.get("window").width - 40}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 20 }}
          />
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  cardInput: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
  },
  inputLabel: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  inputValRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  largeValue: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "950",
    fontStyle: "italic",
    padding: 0,
    margin: 0,
    textShadowColor: "rgba(255, 250, 100, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    minWidth: 150,
  },
  unitText: {
    color: colors.yellow,
    fontSize: 18,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
  saveBtnWrapper: {
    borderRadius: 15,
    shadowColor: colors.yellow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 20,
  },
  saveBtn: {
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  saveBtnText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  sectionTitle: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 15,
    marginTop: 25,
    marginLeft: 5,
  },
  chartContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});

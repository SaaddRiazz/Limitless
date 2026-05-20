import { supabase } from "@/lib/supabase";
import { addXP, XP_VALUES } from "@/lib/xp-service";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BackButton } from "../../../components/ui/back-button";
import { HistoryCard } from "../../../components/ui/history-card";
import { colors } from "../../../styles/colors";
import { auth, logger, main } from "../../../styles/style";
import { LinearGradient } from "expo-linear-gradient";

export default function WaterLog() {
  const [ml, setMl] = useState(0);
  const [savedMl, setSavedMl] = useState(0);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const user_id = session.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: today_data, error: today_error } = await supabase
        .from("water_logs")
        .select("amount_ml")
        .eq("user_id", user_id)
        .gte("created_at", today.toISOString());

      if (today_error) throw today_error;

      const total_today =
        today_data?.reduce((sum, item) => sum + item.amount_ml, 0) || 0;
      setMl(total_today);
      setSavedMl(total_today);

      const seven_days_ago = new Date();
      seven_days_ago.setDate(seven_days_ago.getDate() - 7);
      seven_days_ago.setHours(0, 0, 0, 0);

      const { data: history_data, error: history_error } = await supabase
        .from("water_logs")
        .select("amount_ml, created_at")
        .eq("user_id", user_id)
        .gte("created_at", seven_days_ago.toISOString())
        .lt("created_at", today.toISOString())
        .order("created_at", { ascending: false });

      if (history_error) throw history_error;

      const grouped = (history_data || []).reduce((acc: any, item) => {
        const date_key = new Date(item.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        if (!acc[date_key]) acc[date_key] = 0;
        acc[date_key] += item.amount_ml;
        return acc;
      }, {});

      const history_array = Object.keys(grouped).map((date, index) => ({
        id: index,
        date,
        total: `${grouped[date]}ml`,
        title: grouped[date] >= 3000 ? "Goal Reached" : "Under Goal",
        color: grouped[date] >= 3000 ? colors.green : colors.orange,
      }));

      setHistory(history_array);
    } catch (error) {
      console.error("Error fetching water data:", error);
    }
  };

  const adjustWater = (amount: number) => {
    setMl((prev) => Math.max(0, prev + amount));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const amount_to_add = ml - savedMl;
      if (amount_to_add === 0) return;

      const { error } = await supabase.from("water_logs").insert({
        user_id: session.user.id,
        amount_ml: amount_to_add,
      });

      if (error) throw error;

      await addXP(XP_VALUES.WATER_LOG);
      setSavedMl(ml);
      fetchInitialData();
    } catch (error) {
      console.error("Error saving water log:", error);
    } finally {
      setLoading(false);
    }
  };

  const isAtZero = ml <= 0;
  const isChanged = ml !== savedMl;

  return (
    <LinearGradient colors={["#020205", "#0a0a1a"]} style={styles.container}>
      <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
        <BackButton color={colors.cyan} />
        <Text style={[auth.title, { paddingStart: 0, marginTop: 10, marginBottom: 15 }]}>
          WATER LOG
        </Text>
      </View>
      <View style={styles.fullLine} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.controlPanel}>
          <Text style={styles.controlLabel}>QUICK ADJUST</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              disabled={isAtZero}
              style={[
                styles.adjustBtn,
                { borderColor: isAtZero ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 0, 0, 0.3)" },
                isAtZero && { opacity: 0.3 },
              ]}
              onPress={() => adjustWater(-250)}
            >
              <MaterialCommunityIcons
                name="minus"
                size={22}
                color={isAtZero ? "rgba(255, 255, 255, 0.2)" : colors.red}
              />
              <Text
                style={{
                  color: isAtZero ? "rgba(255, 255, 255, 0.2)" : colors.red,
                  fontWeight: "900",
                  fontSize: 12,
                  letterSpacing: 1,
                }}
              >
                GLASS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adjustBtn, { borderColor: "rgba(53, 215, 255, 0.3)" }]}
              onPress={() => adjustWater(250)}
            >
              <MaterialCommunityIcons
                name="plus"
                size={22}
                color={colors.cyan}
              />
              <Text style={{ color: colors.cyan, fontWeight: "900", fontSize: 12, letterSpacing: 1 }}>
                GLASS
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[logger.centerWrapper, { marginVertical: 35 }]}>
          <MaterialCommunityIcons name="water" size={100} color={colors.cyan} style={styles.waterIcon} />
          <Text style={styles.largeValue}>
            {ml}
            <Text style={styles.unitText}> ml</Text>
          </Text>
          <Text style={styles.macroLabel}>
            {ml !== savedMl ? "UNSAVED INTAKE" : "Goal: 3000ml"}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>HISTORY</Text>
        <HistoryCard
          date="Today"
          title={`${savedMl}ml`}
          subtitle={ml !== savedMl ? "Pending changes..." : "Keep Drinking!"}
          color={colors.cyan}
        />

        {history.map((item) => (
          <HistoryCard
            key={item.id}
            date={item.date}
            title={item.total}
            subtitle={item.title}
            color={item.color}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.saveBtnWrapper, !isChanged && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={!isChanged || loading}
        >
          <LinearGradient
            colors={isChanged ? ["#35d7ff", "#008da8"] : ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveBtn}
          >
            {loading ? (
              <ActivityIndicator color={isChanged ? "#000" : "#fff"} />
            ) : (
              <Text style={[styles.saveBtnText, { color: isChanged ? "#000" : "rgba(255, 255, 255, 0.4)" }]}>
                {ml === savedMl ? "SAVED" : "SAVE SESSION"}
              </Text>
            )}
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  controlPanel: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  controlLabel: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    gap: 12,
  },
  adjustBtn: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.01)",
  },
  largeValue: {
    color: "#fff",
    fontSize: 54,
    fontWeight: "900",
    fontStyle: "italic",
    textAlign: "center",
    textShadowColor: "rgba(53, 215, 255, 0.4)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  unitText: {
    fontSize: 24,
    color: "rgba(255, 255, 255, 0.5)",
  },
  macroLabel: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: 8,
    textAlign: "center",
  },
  waterIcon: {
    textShadowColor: "rgba(53, 215, 255, 0.3)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
    marginBottom: 10,
  },
  sectionTitle: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 15,
    marginTop: 30,
    marginLeft: 5,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "transparent",
  },
  saveBtnWrapper: {
    borderRadius: 15,
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
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
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
});

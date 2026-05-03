import { supabase } from "@/lib/supabase";
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
import { logger, main } from "../../../styles/style";

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

      setSavedMl(ml);
      fetchInitialData();
    } catch (error) {
      console.error("Error saving water log:", error);
    } finally {
      setLoading(false);
    }
  };

  const isAtZero = ml <= 0;

  return (
    <View style={main.container}>
      <BackButton color={colors.cyan} />
      <ScrollView>
        <View style={styles.controlPanel}>
          <Text style={logger.sectionTitle}>QUICK ADJUST</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              disabled={isAtZero}
              style={[
                styles.adjustBtn,
                { borderColor: isAtZero ? colors.divider : colors.red },
                isAtZero && { opacity: 0.3 },
              ]}
              onPress={() => adjustWater(-250)}
            >
              <MaterialCommunityIcons
                name="minus"
                size={24}
                color={isAtZero ? colors.textDark : colors.red}
              />
              <Text
                style={{
                  color: isAtZero ? colors.textDark : colors.red,
                  fontWeight: "900",
                }}
              >
                GLASS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adjustBtn, { borderColor: colors.cyan }]}
              onPress={() => adjustWater(250)}
            >
              <MaterialCommunityIcons
                name="plus"
                size={24}
                color={colors.cyan}
              />
              <Text style={{ color: colors.cyan, fontWeight: "900" }}>
                GLASS
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[logger.centerWrapper, { marginVertical: 40 }]}>
          <MaterialCommunityIcons name="water" size={100} color={colors.cyan} />
          <Text style={logger.largeValue}>
            {ml}
            <Text style={logger.unitText}> ml</Text>
          </Text>
          <Text style={logger.macroLabel}>
            {ml !== savedMl ? "UNSAVED INTAKE" : "Goal: 3000ml"}
          </Text>
        </View>
        <Text style={[logger.sectionTitle, { marginBottom: 15 }]}>HISTORY</Text>
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

      <View style={{ paddingVertical: 10 }}>
        <TouchableOpacity
          style={[
            logger.submitBtn,
            { backgroundColor: ml === savedMl ? colors.divider : colors.cyan },
          ]}
          onPress={handleSave}
          disabled={ml === savedMl || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.black} />
          ) : (
            <Text style={[logger.submitBtnText, { color: colors.black }]}>
              {ml === savedMl ? "SAVED" : "SAVE SESSION"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controlPanel: {
    marginTop: 10,
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
  adjustBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: colors.black,
  },
});

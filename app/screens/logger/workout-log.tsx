import { HistoryCard } from "@/components/ui/history-card";
import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BackButton } from "../../../components/ui/back-button";
import { auth, logger, main } from "../../../styles/style";

export default function WorkoutLog() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch Plans
      const { data: plans } = await supabase
        .from("workout_plans")
        .select("*")
        .eq("user_id", session.user.id);
      
      setWorkoutPlans(plans || []);

      // Fetch History (logs joined with plans to get names)
      const { data: logs, error: logsError } = await supabase
        .from("workout_logs")
        .select(`
          *,
          workout_plans (name)
        `)
        .eq("user_id", session.user.id)
        .order("completed_at", { ascending: false });

      if (logsError) throw logsError;

      // Also fetch set counts for each log to show in subtitle
      const historyWithDetails = await Promise.all((logs || []).map(async (log: any) => {
        const { count } = await supabase
          .from("exercise_sets")
          .select("*", { count: "exact", head: true })
          .eq("workout_log_id", log.id);
        
        return {
          ...log,
          setCount: count || 0
        };
      }));

      setHistory(historyWithDetails);
    } catch (error: any) {
      console.error("Fetch Log Error:", error.message);
      Alert.alert("Error", "Failed to load workout history.");
    } finally {
      setLoading(false);
    }
  };

  const getLogColor = (index: number) => {
    const palette = [colors.blue, colors.green, colors.orange, colors.red, colors.purple];
    return palette[index % palette.length];
  };

  return (
    <View style={main.container}>
      <BackButton color={colors.blue} />
      <Text style={logger.sectionTitle}>Training Log</Text>
      <View
        style={{
          zIndex: 1000,
          position: "relative",
        }}
      >
        <TouchableOpacity
          style={[
            auth.filledBtn,
            { marginTop: 0, backgroundColor: colors.blue },
          ]}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text style={auth.filledBtnText}>Start Workout</Text>
        </TouchableOpacity>
        {showDropdown && (
          <View style={styles.dropdown}>
            {workoutPlans.length > 0 ? workoutPlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setShowDropdown(false);
                  router.push({
                    pathname: "/screens/tracking/track-workout",
                    params: { planId: plan.id, planName: plan.name }
                  });
                }}
              >
                <Text style={{ color: "#fff" }}>{plan.name}</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#555"
                />
              </TouchableOpacity>
            )) : (
              <View style={styles.dropdownItem}>
                <Text style={{ color: colors.textDark }}>No plans saved.</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={[logger.sectionTitle, { marginTop: 40 }]}>
          Recent History
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 20 }} />
        ) : history.length > 0 ? (
          history.map((log, index) => (
            <HistoryCard
              key={log.id}
              date={new Date(log.completed_at).toLocaleDateString()}
              title={log.workout_plans?.name || "Custom Workout"}
              subtitle={`${log.setCount} Total Sets completed`}
              color={getLogColor(index)}
              onPress={() => console.log("View Details")}
            />
          ))
        ) : (
          <Text style={{ color: colors.textDark, textAlign: "center", marginTop: 20 }}>
            No workout logs found. Start your first session!
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: "#111",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#222",
    overflow: "hidden",
    position: "absolute",
    top: 55,
    width: "100%",
    zIndex: 2000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyCard: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 12,
  },
});

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
import { LinearGradient } from "expo-linear-gradient";

export default function WorkoutLog() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [globalWorkouts, setGlobalWorkouts] = useState<any[]>([]);
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

      // Fetch Global Workouts
      const { data: globals } = await supabase
        .from("global_workouts")
        .select("*")
        .order("created_at", { ascending: false });
        
      setGlobalWorkouts(globals || []);

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
    <LinearGradient colors={["#020205", "#0a0a1a"]} style={styles.container}>
      <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
        <BackButton color={colors.blue} />
        <Text style={[auth.title, { paddingStart: 0, marginTop: 10, marginBottom: 15 }]}>
          TRAINING LOG
        </Text>
      </View>
      <View style={styles.fullLine} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View
          style={{
            zIndex: 1000,
            position: "relative",
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setShowDropdown(!showDropdown)}
            style={styles.startBtnWrapper}
          >
            <LinearGradient
              colors={["#007AFF", "#003b82"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startBtn}
            >
              <MaterialCommunityIcons name="play" size={24} color="#fff" />
              <Text style={styles.startBtnText}>START WORKOUT</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          {showDropdown && (
            <View style={styles.dropdown}>
              <ScrollView nestedScrollEnabled style={{ maxHeight: 280 }}>
                <Text style={styles.dropdownSectionLabel}>MY ROUTINES</Text>
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
                    <Text style={{ color: "#fff", fontWeight: "600" }}>{plan.name}</Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color="rgba(255, 255, 255, 0.3)"
                    />
                  </TouchableOpacity>
                )) : (
                  <View style={styles.dropdownItem}>
                    <Text style={{ color: "rgba(255, 255, 255, 0.3)" }}>No plans saved.</Text>
                  </View>
                )}

                <Text style={[styles.dropdownSectionLabel, { color: "#a29bfe", borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)' }]}>GLOBAL ROUTINES</Text>
                {globalWorkouts.length > 0 ? globalWorkouts.map((workout) => (
                  <TouchableOpacity
                    key={workout.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setShowDropdown(false);
                      router.push({
                        pathname: "/screens/tracking/track-workout",
                        params: { planId: workout.id, planName: workout.name, isGlobal: "true" }
                      });
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "600" }}>{workout.name}</Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color="rgba(255, 255, 255, 0.3)"
                    />
                  </TouchableOpacity>
                )) : (
                  <View style={styles.dropdownItem}>
                    <Text style={{ color: "rgba(255, 255, 255, 0.3)" }}>No global routines.</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>RECENT HISTORY</Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 20 }} />
        ) : history.length > 0 ? (
          history.map((log, index) => (
            <HistoryCard
              key={log.id}
              date={new Date(log.completed_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              title={log.workout_name || log.workout_plans?.name || "Custom Workout"}
              subtitle={`${log.setCount} Total Sets completed`}
              color={getLogColor(index)}
              onPress={() => console.log("View Details")}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No workout logs found. Start your first session!</Text>
          </View>
        )}
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
  startBtnWrapper: {
    borderRadius: 15,
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    gap: 8,
  },
  startBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  dropdown: {
    backgroundColor: "#0a0a14",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
    position: "absolute",
    top: 60,
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
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownSectionLabel: {
    color: colors.blue,
    padding: 12,
    paddingBottom: 6,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    fontStyle: "italic",
  },
  sectionTitle: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 15,
    marginTop: 20,
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "rgba(255, 255, 255, 0.01)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.03)",
    borderStyle: "dashed",
    marginTop: 10,
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});

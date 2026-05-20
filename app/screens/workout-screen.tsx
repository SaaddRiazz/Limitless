import { WorkoutPlanCard } from "@/components/ui/workout-plan-card";
import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { auth, logger, main } from "@/styles/style";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function WorkoutScreen() {
  const router = useRouter();
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [globalWorkouts, setGlobalWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalLoading, setGlobalLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
      fetchGlobalWorkouts();
    }, []),
  );

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("workout_plans")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedPlans(data || []);
    } catch (error: any) {
      Alert.alert("Error", "Failed to load workout plans.");
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalWorkouts = async () => {
    try {
      setGlobalLoading(true);
      const { data, error } = await supabase
        .from("global_workouts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGlobalWorkouts(data || []);
    } catch (error: any) {
      console.error("Failed to load global workouts:", error);
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    Alert.alert(
      "Delete Plan",
      "Are you sure you want to delete this routine?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("workout_plans")
              .delete()
              .eq("id", id);
            if (error) Alert.alert("Error", "Could not delete plan.");
            else fetchPlans();
          },
        },
      ],
    );
  };

  return (
    <LinearGradient colors={["#020205", "#0a0a1a"]} style={styles.container}>
      <View>
        <Text style={[auth.title, { marginBottom: 15 }]}>WORKOUT</Text>
      </View>
      <View style={styles.fullLine} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/screens/tracking/add-workout-plan")}
          style={styles.addBtnWrapper}
        >
          <LinearGradient
            colors={["#007AFF", "#003b82"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addBtn}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            <Text style={styles.addBtnText}>ADD WORKOUT PLAN</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* My Routines */}
        <Text style={styles.sectionTitle}>MY ROUTINES</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.blue}
            style={{ marginTop: 20, marginBottom: 20 }}
          />
        ) : savedPlans.length > 0 ? (
          savedPlans.map((plan) => (
            <WorkoutPlanCard
              key={plan.id}
              title={plan.name}
              subtitle={plan.description || "No description"}
              color={colors.blue}
              isGlobal={false}
              onPress={() =>
                router.push({
                  pathname: "/screens/tracking/edit-workout-plan",
                  params: { planId: plan.id },
                })
              }
              onDelete={() => handleDeletePlan(plan.id)}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No routines saved yet.</Text>
          </View>
        )}

        {/* Global Routines */}
        <Text style={[styles.sectionTitle, { marginTop: 25 }]}>GLOBAL ROUTINES</Text>

        {globalLoading ? (
          <ActivityIndicator
            size="large"
            color="#a29bfe"
            style={{ marginTop: 20, marginBottom: 20 }}
          />
        ) : globalWorkouts.length > 0 ? (
          globalWorkouts.map((workout) => (
            <WorkoutPlanCard
              key={workout.id}
              title={workout.name}
              subtitle={workout.description || "Global routine"}
              color={colors.orange}
              isGlobal={true}
              onPress={() =>
                router.push({
                  pathname: "/screens/tracking/track-workout",
                  params: {
                    planId: workout.id,
                    planName: workout.name,
                    isGlobal: "true",
                  },
                })
              }
            />
          ))
        ) : (
          <View style={[styles.emptyContainer, { marginBottom: 40 }]}>
            <Text style={styles.emptyText}>No global routines available.</Text>
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
  sectionTitle: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 15,
    marginTop: 30,
    marginLeft: 5,
  },
  addBtnWrapper: {
    borderRadius: 15,
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 10,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    gap: 8,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    backgroundColor: "rgba(255, 255, 255, 0.01)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.03)",
    borderStyle: "dashed",
    marginTop: 10,
    marginBottom: 15,
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: 14,
    fontWeight: "600",
  },
});

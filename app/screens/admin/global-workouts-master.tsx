import { BackButton } from "@/components/ui/back-button";
import { WorkoutPlanCard } from "@/components/ui/workout-plan-card";
import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { auth } from "@/styles/style";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function GlobalWorkoutsMaster() {
  const router = useRouter();
  const [globalPlans, setGlobalPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchGlobalWorkouts();
    }, []),
  );

  const fetchGlobalWorkouts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("global_workouts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGlobalPlans(data || []);
    } catch (error: any) {
      Alert.alert("Error", "Failed to fetch global workouts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Global Workout",
      "Are you sure? This will remove this routine for all users.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("global_workouts")
              .delete()
              .eq("id", id);
            if (!error) fetchGlobalWorkouts();
          },
        },
      ],
    );
  };

  return (
    <LinearGradient colors={["#020205", "#0a0a1a"]} style={styles.container}>
      <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
        <BackButton color={colors.blue} />
        <Text style={[auth.title, { paddingStart: 0, marginTop: 10, marginBottom: 15 }]}>
          GLOBAL ROUTINES
        </Text>
      </View>
      <View style={styles.fullLine} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.createBtnWrapper}
          onPress={() => router.push("/screens/admin/add-global-workout" as any)}
        >
          <LinearGradient
            colors={["#007AFF", "#003b82"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.createBtn}
          >
            <Text style={styles.createBtnText}>+ CREATE NEW GLOBAL WORKOUT</Text>
          </LinearGradient>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.blue}
            style={{ marginTop: 50 }}
          />
        ) : (
          globalPlans.map((plan) => (
            <WorkoutPlanCard
              key={plan.id}
              title={plan.name}
              subtitle={plan.description || "Global Routine"}
              color={colors.blue}
              isGlobal={true}
              onPress={() =>
                router.push({
                  pathname: "/screens/admin/edit-global-workout" as any,
                  params: { workoutId: plan.id },
                })
              }
              onDelete={() => handleDelete(plan.id)}
            />
          ))
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  createBtnWrapper: {
    borderRadius: 15,
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 20,
  },
  createBtn: {
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "900",
    letterSpacing: 1,
    fontSize: 14,
  },
});

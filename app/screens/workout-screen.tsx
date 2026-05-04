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
} from "react-native";

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
    <View style={main.container}>
      <Text style={[main.headerTitle, { marginBottom: 30, marginTop: 20 }]}>
        WORKOUT
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <TouchableOpacity
          style={[
            auth.filledBtn,
            {
              backgroundColor: colors.blue,
              flexDirection: "row",
              justifyContent: "center",
              gap: 10,
              marginTop: 0,
            },
          ]}
          onPress={() => router.push("/screens/tracking/add-workout-plan")}
        >
          <Text style={auth.filledBtnText}>ADD WORKOUT PLAN</Text>
        </TouchableOpacity>

        {/* My Routines */}
        <Text
          style={[logger.sectionTitle, { marginTop: 30, marginBottom: 15 }]}
        >
          My Routines
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.blue}
            style={{ marginTop: 20 }}
          />
        ) : savedPlans.length > 0 ? (
          savedPlans.map((plan) => (
            <WorkoutPlanCard
              key={plan.id}
              title={plan.name}
              subtitle={plan.description || "No description"}
              color={colors.blue}
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
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Text style={{ color: colors.textDark }}>
              No routines saved yet.
            </Text>
          </View>
        )}

        {/* Global Routines */}
        <Text
          style={[logger.sectionTitle, { marginTop: 35, marginBottom: 15 }]}
        >
          Global Routines
        </Text>

        {globalLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.orange}
            style={{ marginTop: 20 }}
          />
        ) : globalWorkouts.length > 0 ? (
          globalWorkouts.map((workout) => (
            <WorkoutPlanCard
              key={workout.id}
              title={workout.name}
              subtitle={workout.description || "Global routine"}
              color={colors.orange}
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
          <View style={{ alignItems: "center", marginTop: 20, marginBottom: 40 }}>
            <Text style={{ color: colors.textDark }}>
              No global routines available.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

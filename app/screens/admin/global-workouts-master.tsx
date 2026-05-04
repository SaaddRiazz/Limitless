import { BackButton } from "@/components/ui/back-button";
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
    <View style={main.container}>
      <BackButton color={colors.blue} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
        <Text style={logger.sectionTitle}>Global Library</Text>

        <TouchableOpacity
          style={[
            auth.filledBtn,
            { backgroundColor: colors.blue, marginBottom: 20 },
          ]}
          onPress={() => router.push("/screens/admin/add-global-workout")}
        >
          <Text style={auth.filledBtnText}>+ CREATE NEW GLOBAL WORKOUT</Text>
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
              onPress={() =>
                router.push({
                  pathname: "./admin/edit-global-workout",
                  params: { workoutId: plan.id },
                })
              }
              onDelete={() => handleDelete(plan.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

import { HistoryCard } from "@/components/ui/history-card";
import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { auth, logger, main } from "@/styles/style";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, [])
  );

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("workout_plans")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log(`Fetched ${data?.length || 0} workout plans`);
      setSavedPlans(data || []);
    } catch (error: any) {
      console.error("Fetch Error:", error.message);
      Alert.alert("Error", "Failed to load workout plans.");
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (index: number) => {
    const palette = [colors.blue, colors.green, colors.orange, colors.red, colors.purple];
    return palette[index % palette.length];
  };

  return (
    <View style={main.container}>
      <View style={{ marginTop: 60, marginBottom: 20 }}>
        <Text style={main.headerTitle}>WORKOUTS</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
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
          <MaterialCommunityIcons name="plus" size={24} color={colors.white} />
          <Text style={auth.filledBtnText}>ADD WORKOUT PLAN</Text>
        </TouchableOpacity>

        <Text
          style={[logger.sectionTitle, { marginTop: 30, marginBottom: 15 }]}
        >
          My Routines
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 50 }} />
        ) : savedPlans.length > 0 ? (
          savedPlans.map((plan, index) => (
            <HistoryCard
              key={plan.id}
              title={plan.name}
              subtitle={plan.description || "No description"}
              color={getPlanColor(index)}
              onPress={() => router.push({
                pathname: "/screens/tracking/track-workout",
                params: { planId: plan.id, planName: plan.name }
              })}
              date={new Date(plan.created_at).toLocaleDateString()}
            />
          ))
        ) : (
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <Text style={{ color: colors.textDark }}>
              No routines saved yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

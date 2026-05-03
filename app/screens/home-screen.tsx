import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DashboardCard from "../../components/ui/dashboard-card";
import { colors } from "../../styles/colors";
import { auth, main } from "../../styles/style";

export default function HomeScreen({ navigation }: any) {
  const [profile, setProfile] = useState({
    username: "CHAMPION",
    xp: 0,
    level: 1,
    streak: 0,
    water: 0,
    calories: 0,
    workouts: 0,
    weight: "—",
  });
  const [loading, setLoading] = useState(true);

  const nextLevelXP = 2000;
  const progressPercent = Math.min(
    Math.max((profile.xp / nextLevelXP) * 100, 0),
    100,
  );

  const animatedWidth = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, []),
  );

  useEffect(() => {
    if (!loading) {
      Animated.timing(animatedWidth, {
        toValue: progressPercent,
        duration: 1500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }).start();
    }
  }, [progressPercent, loading]);

  async function fetchProfile() {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) return;

      // 1. Fetch Profile Info
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, xp, level, streak")
        .eq("id", user.id)
        .single();

      // 2. Fetch Today's Data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      // Water
      const { data: waterData } = await supabase
        .from("water_logs")
        .select("amount_ml")
        .eq("user_id", user.id)
        .gte("created_at", todayStr);

      const totalWater = waterData?.reduce((sum, item) => sum + item.amount_ml, 0) || 0;

      // Calories
      const { data: nutritionData } = await supabase
        .from("nutrition_logs")
        .select("calories")
        .eq("user_id", user.id)
        .gte("logged_at", todayStr);

      const totalCalories = nutritionData?.reduce((sum, item) => sum + item.calories, 0) || 0;

      // Workouts
      const { count: workoutCount } = await supabase
        .from("workout_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("completed_at", todayStr);

      // Weight (Latest)
      const { data: weightData } = await supabase
        .from("biometrics")
        .select("weight_kg")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setProfile({
        username: profileData?.username || "CHAMPION",
        xp: profileData?.xp || 0,
        level: profileData?.level || 1,
        streak: profileData?.streak || 0,
        water: totalWater,
        calories: totalCalories,
        workouts: workoutCount || 0,
        weight: weightData ? `${weightData.weight_kg}kg` : "—",
      });
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && profile.xp === 0) {
    return (
      <View style={[main.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={main.container}>
      <Text style={[main.headerTitle, { marginBottom: 30, marginTop: 20 }]}>
        DASHBOARD
      </Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center", marginBottom: 25, marginTop: 10 }}>
          <Text style={[auth.welcomeText, { marginBottom: 5 }]}>
            Welcome back,
          </Text>
          <Text style={main.headerTitle}>{profile.username.toUpperCase()}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={main.levelContainer}
          onPress={() => router.push("/screens/profile-screen")}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Level {profile.level}
            </Text>
            <Text style={{ color: colors.blue, fontWeight: "bold" }}>
              {profile.xp.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
            </Text>
          </View>

          <View style={main.progressBarBg}>
            <Animated.View
              style={[
                main.progressBarFill,
                {
                  width: animatedWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </TouchableOpacity>

        <View style={{ marginVertical: 20 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate={0.98}
            disableIntervalMomentum={false}
            contentContainerStyle={[
              main.statsContainer,
              { paddingHorizontal: 5 },
            ]}
          >
            <DashboardCard
              title="Streak"
              icon="fire"
              value={profile.streak.toString()}
              onPress={() => {}}
              hexColor={colors.orange}
            />
            <DashboardCard
              title="Workouts"
              icon="arm-flex"
              value={profile.workouts.toString()}
              onPress={() => router.push("/screens/logger/workout-log")}
              hexColor={colors.red}
            />
            <DashboardCard
              title="Weight"
              icon="scale-bathroom"
              value={profile.weight}
              onPress={() => router.push("/screens/logger/weight-log")}
              hexColor={colors.yellow}
            />
            <DashboardCard
              title="Calories"
              icon="food-apple"
              value={profile.calories.toString()}
              onPress={() => router.push("/screens/logger/nutrition-log")}
              hexColor={colors.green}
            />
            <DashboardCard
              title="Water"
              icon="water"
              value={`${profile.water}ml`}
              onPress={() => router.push("/screens/logger/water-log")}
              hexColor={colors.cyan}
            />
          </ScrollView>
        </View>

        <TouchableOpacity
          style={main.workoutCard}
          activeOpacity={0.9}
          onPress={() => router.push("/screens/logger/workout-log")}
        >
          <View>
            <Text
              style={{
                color: "#fff",
                fontSize: 22,
                fontWeight: "900",
                fontStyle: "italic",
              }}
            >
              START WORKOUT
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.8)",
                marginTop: 4,
                fontWeight: "600",
              }}
            >
              Select a routine to begin
            </Text>
          </View>
          <MaterialCommunityIcons name="play-circle" size={50} color="#fff" />
        </TouchableOpacity>

        <View
          style={{
            marginTop: 50,
            alignItems: "center",
            opacity: 0.4,
            marginBottom: 40,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontStyle: "italic",
              textAlign: "center",
              fontSize: 13,
            }}
          >
            "The only limit is the one you set yourself."
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

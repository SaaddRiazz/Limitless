import { supabase } from "@/lib/supabase";
import { getXPForLevel } from "@/lib/xp-service";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { colors } from "../../styles/colors";
import { auth, main } from "../../styles/style";

const { width } = Dimensions.get("window");

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

  const nextLevelXP = getXPForLevel(profile.level);
  const progressPercent = Math.min(Math.max((profile.xp / nextLevelXP) * 100, 0), 100);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
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

  async function checkAndUpdateStreak(userId: string) {
    try {
      const { data: lastLog } = await supabase
        .from("workout_logs")
        .select("completed_at")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false })
        .limit(1)
        .single();

      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("streak")
        .eq("id", userId)
        .single();

      const currentStreak = currentProfile?.streak ?? 0;

      if (!lastLog) {
        if (currentStreak !== 0) {
          await supabase.from("profiles").update({ streak: 0 }).eq("id", userId);
        }
        return 0;
      }

      const lastDate = new Date(lastLog.completed_at);
      lastDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      let newStreak = currentStreak;

      if (diffDays === 0) {
        return currentStreak;
      } else if (diffDays === 1) {
        newStreak = currentStreak + 1;
        await supabase.from("profiles").update({ streak: newStreak }).eq("id", userId);
      } else {
        newStreak = 0;
        await supabase.from("profiles").update({ streak: 0 }).eq("id", userId);
      }

      return newStreak;
    } catch (error) {
      return 0;
    }
  }

  async function fetchProfile() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) return;

      const updatedStreak = await checkAndUpdateStreak(user.id);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, xp, level, streak")
        .eq("id", user.id)
        .single();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      const { data: waterData } = await supabase
        .from("water_logs")
        .select("amount_ml")
        .eq("user_id", user.id)
        .gte("created_at", todayStr);

      const totalWater = waterData?.reduce((sum, item) => sum + item.amount_ml, 0) || 0;

      const { data: nutritionData } = await supabase
        .from("nutrition_logs")
        .select("calories")
        .eq("user_id", user.id)
        .gte("logged_at", todayStr);

      const totalCalories = nutritionData?.reduce((sum, item) => sum + item.calories, 0) || 0;

      const { count: workoutCount } = await supabase
        .from("workout_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("completed_at", todayStr);

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
        streak: profileData?.streak ?? updatedStreak,
        water: totalWater,
        calories: totalCalories,
        workouts: workoutCount || 0,
        weight: weightData ? `${weightData.weight_kg}kg` : "—",
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  if (loading && profile.xp === 0) {
    return (
      <LinearGradient colors={["#050511", "#000000"]} style={[main.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colors.blue} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#020205", "#0a0a1a"]} style={styles.container}>
      <View>
        <Text style={[auth.title, { marginBottom: 15 }]}>DASHBOARD</Text>
      </View>
      <View style={styles.fullLine} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.heroSection}>
          <LinearGradient
            colors={["rgba(33, 150, 243, 0.15)", "rgba(0, 0, 0, 0.8)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Text style={styles.welcomeSub}>READY TO CRUSH IT,</Text>
              <Text style={styles.usernameText}>{profile.username.toUpperCase()}</Text>

              <View style={styles.levelBadge}>
                <MaterialCommunityIcons name="shield-star" size={20} color={colors.blue} />
                <Text style={styles.levelBadgeText}>LVL {profile.level}</Text>
              </View>

              <View style={styles.xpContainer}>
                <View style={styles.xpHeader}>
                  <Text style={styles.xpLabel}>PROGRESS</Text>
                  <Text style={styles.xpValue}>{profile.xp.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</Text>
                </View>
                <View style={styles.progressTrack}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: animatedWidth.interpolate({
                          inputRange: [0, 100],
                          outputRange: ["0%", "100%"],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/screens/logger/workout-log")}
            style={styles.workoutBtnWrapper}
          >
            <LinearGradient
              colors={["#007AFF", "#003b82"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.workoutBtn}
            >
              <View style={styles.workoutBtnLeft}>
                <MaterialCommunityIcons name="lightning-bolt" size={32} color="#fff" />
                <View style={{ marginLeft: 15 }}>
                  <Text style={styles.workoutBtnTitle}>START WORKOUT</Text>
                  <Text style={styles.workoutBtnSub}>Log your next session</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={32} color="rgba(255,255,255,0.5)" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>TODAY'S METRICS</Text>

        <View style={styles.gridContainer}>
          <TouchableOpacity style={[styles.metricCard, { width: "100%" }]} onPress={() => { }}>
            <MaterialCommunityIcons name="fire" size={28} color={colors.orange} />
            <Text style={styles.metricValue}>{profile.streak}</Text>
            <Text style={styles.metricLabel}>Day Streak</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.metricCard} onPress={() => router.push("/screens/logger/workout-log")}>
            <MaterialCommunityIcons name="arm-flex" size={28} color={colors.red} />
            <Text style={styles.metricValue}>{profile.workouts}</Text>
            <Text style={styles.metricLabel}>Workouts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.metricCard} onPress={() => router.push("/screens/logger/weight-log")}>
            <MaterialCommunityIcons name="scale-bathroom" size={28} color={colors.yellow} />
            <Text style={styles.metricValue}>{profile.weight}</Text>
            <Text style={styles.metricLabel}>Weight</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.metricCard} onPress={() => router.push("/screens/logger/nutrition-log")}>
            <MaterialCommunityIcons name="food-apple" size={28} color={colors.green} />
            <Text style={styles.metricValue}>{profile.calories}</Text>
            <Text style={styles.metricLabel}>Calories</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.metricCard} onPress={() => router.push("/screens/logger/water-log")}>
            <MaterialCommunityIcons name="water" size={28} color={colors.cyan} />
            <Text style={styles.metricValue}>{profile.water} ml</Text>
            <Text style={styles.metricLabel}>Hydration</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  headerContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  fullLine: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    width: "100%",
  },
  headerSeparator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  headerText: {
    color: colors.blue,
    paddingHorizontal: 15,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(33, 150, 243, 0.3)",
    marginBottom: 25,
    marginTop: 20,
  },
  heroGradient: {
    padding: 25,
  },
  heroContent: {
    alignItems: "flex-start",
  },
  welcomeSub: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 5,
  },
  usernameText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: 1,
    textShadowColor: "rgba(101, 204, 255, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: 15,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(33, 150, 243, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(33, 150, 243, 0.4)",
    marginBottom: 25,
  },
  levelBadgeText: {
    color: colors.blue,
    fontWeight: "900",
    fontSize: 14,
    marginLeft: 6,
    letterSpacing: 1,
  },
  xpContainer: {
    width: "100%",
  },
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  xpLabel: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  xpValue: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: "bold",
  },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.blue,
    borderRadius: 4,
  },
  actionSection: {
    marginBottom: 30,
  },
  workoutBtnWrapper: {
    borderRadius: 20,
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  workoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  workoutBtnLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  workoutBtnTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: 1,
  },
  workoutBtnSub: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  sectionTitle: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 3,
    marginBottom: 15,
    marginLeft: 5,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  metricCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    width: (width - 40 - 12) / 2,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  metricValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 10,
    marginBottom: 4,
  },
  metricLabel: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
});

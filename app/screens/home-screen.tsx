import { supabase } from "@/lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
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
import { auth, main } from "../../styles/style";

export default function HomeScreen({ navigation }: any) {
  const [profile, setProfile] = useState({
    username: "CHAMPION",
    xp: 0,
    level: 1,
    streak: 0,
  });
  const [loading, setLoading] = useState(true);

  const nextLevelXP = 2000;
  const progressPercent = Math.min(
    Math.max((profile.xp / nextLevelXP) * 100, 0),
    100
  );

  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProfile();
  }, []);

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

      const { data, error } = await supabase
        .from("profiles")
        .select("username, xp, level, streak")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching home profile:", error.message);
      } else if (data) {
        setProfile({
          username: data.username || "CHAMPION",
          xp: data.xp || 0,
          level: data.level || 1,
          streak: data.streak || 0,
        });
      }
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
    <ScrollView style={main.container} showsVerticalScrollIndicator={false}>
      <View style={{ alignItems: "center", marginBottom: 25, marginTop: 10 }}>
        <Text style={[auth.welcomeText, { marginBottom: 5, marginTop: 30 }]}>
          Welcome back,
        </Text>
        <Text style={main.headerTitle}>{profile.username.toUpperCase()}</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={main.levelContainer}
        onPress={() => navigation.navigate("Profile")}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Level {profile.level}
          </Text>
          <Text style={{ color: "#2196F3", fontWeight: "bold" }}>
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
            hexColor={"#dc6a00"}
          />
          <DashboardCard
            title="Steps"
            icon="run"
            value="8,432"
            onPress={() => {}}
            hexColor={"#ff0000"}
          />
          <DashboardCard
            title="Sleep"
            icon="weather-night"
            value="7h 20m"
            onPress={() => {}}
            hexColor={"#fffa64"}
          />
          <DashboardCard
            title="Calories"
            icon="food-apple"
            value="1,450"
            onPress={() => {}}
            hexColor={"#69ff3c"}
          />
          <DashboardCard
            title="Water"
            icon="water"
            value="1.5L"
            onPress={() => {}}
            hexColor={"#35d7ff"}
          />
        </ScrollView>
      </View>

      <TouchableOpacity style={main.workoutCard} activeOpacity={0.9}>
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
            Push Pull Legs - Day 3
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
  );
}

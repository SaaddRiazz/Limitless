import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
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
  const currentXP = 1090;
  const nextLevelXP = 2000;
  const progressPercent = Math.min(
    Math.max((currentXP / nextLevelXP) * 100, 0),
    100,
  );

  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progressPercent,
      duration: 1500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, [progressPercent]);

  return (
    <ScrollView style={main.container} showsVerticalScrollIndicator={false}>
      <View style={{ alignItems: "center", marginBottom: 25, marginTop: 10 }}>
        <Text style={[auth.welcomeText, { marginBottom: 5, marginTop: 30 }]}>
          Welcome back,
        </Text>
        <Text style={main.headerTitle}>CHAMPION</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={main.levelContainer}
        onPress={() => navigation.navigate("Profile")}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Level 12</Text>
          <Text style={{ color: colors.blue, fontWeight: "bold" }}>
            {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
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
            value="28"
            onPress={() => {}}
            hexColor={colors.orange}
          />
          <DashboardCard
            title="Steps"
            icon="run"
            value="8,432"
            onPress={() => {}}
            hexColor={colors.red}
          />
          <DashboardCard
            title="Sleep"
            icon="weather-night"
            value="7h 20m"
            onPress={() => {}}
            hexColor={colors.yellow}
          />
          <DashboardCard
            title="Calories"
            icon="food-apple"
            value="1,450"
            onPress={() => {}}
            hexColor={colors.green}
          />
          <DashboardCard
            title="Water"
            icon="water"
            value="1.5L"
            onPress={() => {}}
            hexColor={colors.cyan}
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

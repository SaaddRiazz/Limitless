import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { auth, main } from "@/styles/style";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ users: 0, workouts: 0, exercises: 0 });

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const fetchStats = async () => {
    const { count: users } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    const { count: workouts } = await supabase
      .from("global_workouts")
      .select("*", { count: "exact", head: true });
    const { count: exercises } = await supabase
      .from("global_exercises")
      .select("*", { count: "exact", head: true });
    setStats({
      users: users || 0,
      workouts: workouts || 0,
      exercises: exercises || 0,
    });
  };

  const AdminBtn = ({ title, path, gradient }: any) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.btnWrapper}
      onPress={() => router.push(path)}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.btn}
      >
        <Text style={styles.btnText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#020205", "#0a0a1a"]} style={styles.container}>
      <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
        <Text style={[auth.title, { paddingStart: 0, marginTop: 10, marginBottom: 15 }]}>
          ADMIN PANEL
        </Text>
      </View>
      <View style={styles.fullLine} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats.users}</Text>
            <Text style={styles.statLabel}>USERS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats.workouts}</Text>
            <Text style={styles.statLabel}>WORKOUTS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats.exercises}</Text>
            <Text style={styles.statLabel}>EXERCISES</Text>
          </View>
        </View>

        <View style={{ gap: 20, marginTop: 10 }}>
          <AdminBtn
            title="MANAGE GLOBAL WORKOUTS"
            path="/screens/admin/global-workouts-master"
            gradient={["#007AFF", "#003b82"]}
          />
          <AdminBtn
            title="ADD GLOBAL EXERCISE"
            path="/screens/admin/add-global-exercise"
            gradient={["#4ec42a", "#256214"]}
          />
          <AdminBtn
            title="MODERATE COMMUNITY"
            path="/screens/admin/community-screen"
            gradient={["#ff3b30", "#8e0a0a"]}
          />
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
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  statBox: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    padding: 15,
    borderRadius: 20,
    width: "31%",
  },
  statNum: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    fontStyle: "italic",
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginTop: 4,
  },
  btnWrapper: {
    borderRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  btn: {
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  btnText: {
    color: "#fff",
    fontWeight: "900",
    letterSpacing: 1.5,
    fontSize: 14,
  },
});

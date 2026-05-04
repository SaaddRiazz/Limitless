import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { main } from "@/styles/style";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

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

  const AdminBtn = ({ title, path, color }: any) => (
    <TouchableOpacity
      style={[styles.btn, { borderColor: color }]}
      onPress={() => router.push(path)}
    >
      <Text style={[styles.btnText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={main.container}>
      <Text style={[main.headerTitle, { marginTop: 60 }]}>ADMIN PANEL</Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{stats.users}</Text>
          <Text style={styles.statLabel}>Users</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{stats.workouts}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{stats.exercises}</Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>
      </View>

      <View style={{ gap: 15, padding: 20 }}>
        <AdminBtn
          title="ADD GLOBAL WORKOUT"
          path="/screens/admin/global-workouts-master"
          color={colors.blue}
        />
        <AdminBtn
          title="ADD GLOBAL EXERCISE"
          path="/screens/admin/add-global-exercise"
          color={colors.green}
        />
        <AdminBtn
          title="MODERATE COMMUNITY"
          path="/screens/admin/community-screen"
          color={colors.red}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
  },
  statBox: {
    alignItems: "center",
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 15,
    width: "30%",
  },
  statNum: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  statLabel: { color: "#666", fontSize: 12 },
  btn: { borderWidth: 1, padding: 20, borderRadius: 15, alignItems: "center" },
  btnText: { fontWeight: "900", letterSpacing: 1 },
});

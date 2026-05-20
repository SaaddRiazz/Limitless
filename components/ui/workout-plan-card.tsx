import { colors } from "@/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface WorkoutPlanCardProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  onDelete?: () => void;
  color?: string;
  isGlobal?: boolean;
}

export const WorkoutPlanCard = ({
  title,
  subtitle,
  onPress,
  onDelete,
  color = colors.blue,
  isGlobal = false,
}: WorkoutPlanCardProps) => {
  const isPremium = isGlobal || color === colors.orange;

  const content = (
    <View style={styles.content}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900", fontStyle: "italic" }}>
            {title.toUpperCase()}
          </Text>
          {isPremium && (
            <View style={{ backgroundColor: "rgba(162, 155, 254, 0.15)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: "rgba(162, 155, 254, 0.3)" }}>
              <Text style={{ letterSpacing: 0.5, fontWeight: "900", fontSize: 10, color: "#a29bfe" }}>GLOBAL</Text>
            </View>
          )}
        </View>
        {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
      </View>

      <View style={styles.actions}>
        {onDelete && (
          <TouchableOpacity
            onPress={onDelete}
            style={styles.deleteBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={20}
              color={colors.red}
            />
          </TouchableOpacity>
        )}
        <MaterialCommunityIcons name="chevron-right" size={24} color={isPremium ? "rgba(162, 155, 254, 0.5)" : "rgba(255, 255, 255, 0.3)"} />
      </View>
    </View>
  );

  if (isPremium) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={{ marginBottom: 12 }}
      >
        <LinearGradient
          colors={["rgba(162, 155, 254, 0.12)", "rgba(0, 0, 0, 0.8)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderColor: "rgba(162, 155, 254, 0.25)",
            borderWidth: 1,
            borderRadius: 20,
            padding: 20,
          }}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        borderColor: "rgba(255, 255, 255, 0.05)",
        borderWidth: 1,
        borderRadius: 20,
        padding: 20,
        marginBottom: 12,
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  subtitleText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "600",
  },
  deleteBtn: {
    padding: 4,
  },
});

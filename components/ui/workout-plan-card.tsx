import { colors } from "@/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface WorkoutPlanCardProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  onDelete?: () => void;
  color?: string;
}

export const WorkoutPlanCard = ({
  title,
  subtitle,
  onPress,
  onDelete,
  color = colors.blue,
}: WorkoutPlanCardProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: `${color}15`, borderColor: `${color}40` },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={{ flex: 1 }}>
          <Text style={styles.titleText}>{title}</Text>
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
          <MaterialCommunityIcons name="chevron-right" size={24} color="#555" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
  },
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
  titleText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitleText: {
    color: "#888",
    fontSize: 13,
    marginTop: 4,
  },
  deleteBtn: {
    padding: 4,
  },
});

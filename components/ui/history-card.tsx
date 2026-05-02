import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HistoryCardProps {
  date: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  color?: string;
}

export const HistoryCard = ({
  date,
  title,
  subtitle,
  onPress,
  color = "#2196F3",
}: HistoryCardProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: `${color}15`, borderColor: `${color}80` },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.header, { borderBottomColor: `${color}80` }]}>
        <Text style={styles.dateText}>{date.toUpperCase()}</Text>
        <MaterialCommunityIcons name="chevron-right" size={18} color="#444" />
      </View>

      <View style={styles.content}>
        <View>
          <Text style={styles.titleText}>{title}</Text>
          {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  dateText: {
    color: "#666",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  subtitleText: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
});

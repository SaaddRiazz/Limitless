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
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.05)", paddingBottom: 8 }}>
        <Text style={{ color, fontSize: 10, fontWeight: "950", letterSpacing: 1.5 }}>
          {date.toUpperCase()}
        </Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255, 255, 255, 0.3)" />
      </View>

      <View style={styles.content}>
        <View>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900", fontStyle: "italic" }}>
            {title.toUpperCase()}
          </Text>
          {subtitle && (
            <Text style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 13, marginTop: 4, fontWeight: "600" }}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
});

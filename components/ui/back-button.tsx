import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BackButtonProps {
  label?: string;
  color?: string;
}

export const BackButton = ({
  label = "BACK",
  color = "#fff",
}: BackButtonProps) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={styles.container}
      activeOpacity={0.7}
    >
      <View style={[styles.circle, { borderColor: color + "33" }]}>
        <MaterialCommunityIcons name="chevron-left" size={24} color={color} />
      </View>
      {label && <Text style={[styles.text, { color }]}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    alignSelf: "flex-start", // Keeps it from stretching
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#111",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  text: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
  },
});

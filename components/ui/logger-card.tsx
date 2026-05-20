import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { ComponentProps } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { main } from "../../styles/style";

interface LoggerCardProps {
  title: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  subtitle?: string;
  hexColor: string;
  onPress: () => void;
}

const LoggerCard: React.FC<LoggerCardProps> = ({
  title,
  icon,
  subtitle,
  hexColor,
  onPress,
}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.03)",
      borderColor: "rgba(255, 255, 255, 0.05)",
      borderWidth: 1,
      borderRadius: 20,
      width: "100%",
      height: 135,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 25,
      marginBottom: 16,
    }}
    onPress={onPress}
  >
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons
        name={icon}
        size={36}
        color={hexColor}
        style={{
          textShadowColor: hexColor,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 15,
        }}
      />
    </View>

    <View style={styles.textContainer}>
      <Text style={{ fontSize: 20, fontWeight: "900", color: "#fff", fontStyle: "italic" }}>
        {title.toUpperCase()}
      </Text>
      {subtitle && (
        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4, fontWeight: "600" }}>
          {subtitle}
        </Text>
      )}
    </View>

    <MaterialCommunityIcons
      name="chevron-right"
      size={24}
      color="rgba(255, 255, 255, 0.3)"
    />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  iconContainer: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
});

export default LoggerCard;

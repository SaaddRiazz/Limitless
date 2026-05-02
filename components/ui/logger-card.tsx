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
    style={[
      main.card,
      {
        borderColor: `${hexColor}80`,
        backgroundColor: `${hexColor}15`,
        width: "100%",
        height: 135,
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        marginBottom: 16,
      },
    ]}
    onPress={onPress}
  >
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons
        name={icon}
        size={32}
        color={hexColor}
        style={{
          textShadowColor: hexColor,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 12,
        }}
      />
    </View>

    <View style={styles.textContainer}>
      <Text
        style={[main.cardTitle, { marginTop: 0, fontSize: 18, color: "#fff" }]}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 }}
        >
          {subtitle}
        </Text>
      )}
    </View>

    <MaterialCommunityIcons
      name="chevron-right"
      size={24}
      color={`${hexColor}80`}
    />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  iconContainer: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
});

export default LoggerCard;

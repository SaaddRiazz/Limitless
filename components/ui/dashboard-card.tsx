import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { ComponentProps } from "react";
import { Text, TouchableOpacity } from "react-native";
import { main } from "../../styles/style";

interface DashboardCardProps {
  title: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  value?: string;
  hexColor: string;
  onPress: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  value,
  hexColor,
  onPress,
}) => (
  <TouchableOpacity
    style={[
      main.card,
      {
        borderColor: `${hexColor}80`,
        backgroundColor: `${hexColor}15`,
      },
    ]}
    onPress={onPress}
  >
    <MaterialCommunityIcons
      name={icon}
      size={28}
      color={hexColor}
      style={{
        textShadowColor: hexColor,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
      }}
    />
    <Text style={main.cardTitle}>{title}</Text>
    {value ? <Text style={main.statsValue}>{value}</Text> : null}
  </TouchableOpacity>
);

export default DashboardCard;

import { colors } from "@/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FoodItemProps {
  item: {
    id: string;
    name: string;
    description: string;
    calories: string;
  };
  onUpdate: (
    updates: Partial<{ name: string; description: string; calories: string }>,
  ) => void;
  onDelete: () => void;
}

export const FoodItem: React.FC<FoodItemProps> = ({
  item,
  onUpdate,
  onDelete,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <TextInput
          style={styles.nameInput}
          placeholder="Item Name"
          placeholderTextColor="#444"
          value={item.name}
          onChangeText={(v) => onUpdate({ name: v })}
        />
        <TouchableOpacity onPress={onDelete}>
          <MaterialCommunityIcons
            name="delete-outline"
            size={22}
            color={colors.red}
          />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.descInput}
        placeholder="Quantity/Portion Size"
        placeholderTextColor="#444"
        value={item.description}
        onChangeText={(v) => onUpdate({ description: v })}
      />

      <View style={styles.calorieRow}>
        <View
          style={[
            styles.inputWrapper,
            {
              borderColor: `${colors.green}80`,
              backgroundColor: `${colors.black}80`,
            },
          ]}
        >
          <TextInput
            style={styles.calInput}
            placeholder="0"
            placeholderTextColor="#444"
            keyboardType="numeric"
            value={item.calories}
            onChangeText={(v) => onUpdate({ calories: v })}
          />
          <Text style={styles.calLabel}>kcal</Text>
        </View>

        <TouchableOpacity
          style={styles.aiButton}
          onPress={() => console.log("AI Logic here")}
        >
          <MaterialCommunityIcons name="robot" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: `${colors.green}15`,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${colors.green}80`,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  nameInput: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  descInput: {
    color: colors.textDark,
    fontSize: 14,
    marginBottom: 12,
  },
  calorieRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.black,
    borderRadius: 8,
    paddingHorizontal: 12,
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  calInput: {
    color: colors.white,
    fontSize: 16,
    flex: 1,
    textAlign: "right",
    paddingRight: 5,
  },
  calLabel: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: "bold",
  },
  aiButton: {
    backgroundColor: `${colors.blue}35`,
    borderColor: `${colors.blue}80`,
    borderWidth: 1,
    width: 45,
    height: 45,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

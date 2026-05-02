import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BackButton } from "../../../components/ui/back-button";
import { HistoryCard } from "../../../components/ui/history-card";
import { colors } from "../../../styles/colors";
import { logger, main } from "../../../styles/style";

export default function WaterLog() {
  const [ml, setMl] = useState(2250);
  const [savedMl, setSavedMl] = useState(2250);

  const [history] = useState([
    {
      id: 2,
      date: "Yesterday",
      total: "3250ml",
      title: "Goal Reached",
      color: colors.green,
    },
    {
      id: 3,
      date: "Oct 29",
      total: "2000ml",
      title: "Under Goal",
      color: colors.orange,
    },
    {
      id: 4,
      date: "Oct 28",
      total: "3500ml",
      title: "Goal Reached",
      color: colors.red,
    },
  ]);

  const adjustWater = (amount: number) => {
    setMl((prev) => Math.max(0, prev + amount));
  };

  const handleSave = () => {
    setSavedMl(ml);
    console.log("Saved intake:", ml);
  };

  const isAtZero = ml <= 0;

  return (
    <View style={main.container}>
      <BackButton color={colors.cyan} />
      <ScrollView>
        <View style={styles.controlPanel}>
          <Text style={logger.sectionTitle}>QUICK ADJUST</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              disabled={isAtZero}
              style={[
                styles.adjustBtn,
                { borderColor: isAtZero ? colors.divider : colors.red },
                isAtZero && { opacity: 0.3 },
              ]}
              onPress={() => adjustWater(-250)}
            >
              <MaterialCommunityIcons
                name="minus"
                size={24}
                color={isAtZero ? colors.textDark : colors.red}
              />
              <Text
                style={{
                  color: isAtZero ? colors.textDark : colors.red,
                  fontWeight: "900",
                }}
              >
                GLASS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adjustBtn, { borderColor: colors.cyan }]}
              onPress={() => adjustWater(250)}
            >
              <MaterialCommunityIcons
                name="plus"
                size={24}
                color={colors.cyan}
              />
              <Text style={{ color: colors.cyan, fontWeight: "900" }}>
                GLASS
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[logger.centerWrapper, { marginVertical: 40 }]}>
          <MaterialCommunityIcons name="water" size={100} color={colors.cyan} />
          <Text style={logger.largeValue}>
            {ml}
            <Text style={logger.unitText}> ml</Text>
          </Text>
          <Text style={logger.macroLabel}>
            {ml !== savedMl ? "UNSAVED INTAKE" : "Goal: 3000ml"}
          </Text>
        </View>
        <Text style={[logger.sectionTitle, { marginBottom: 15 }]}>HISTORY</Text>
        <HistoryCard
          date="Today"
          title={`${savedMl}ml`}
          subtitle={ml !== savedMl ? "Pending changes..." : "Keep Drinking!"}
          color={colors.cyan}
        />

        {history.map((item) => (
          <HistoryCard
            key={item.id}
            date={item.date}
            title={item.total}
            subtitle={item.title}
            color={item.color}
          />
        ))}
      </ScrollView>

      <View style={{ paddingVertical: 10 }}>
        <TouchableOpacity
          style={[
            logger.submitBtn,
            { backgroundColor: ml === savedMl ? colors.divider : colors.cyan },
          ]}
          onPress={handleSave}
          disabled={ml === savedMl}
        >
          <Text style={[logger.submitBtnText, { color: colors.black }]}>
            {ml === savedMl ? "SAVED" : "SAVE SESSION"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controlPanel: {
    marginTop: 10,
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
  adjustBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: colors.black,
  },
});

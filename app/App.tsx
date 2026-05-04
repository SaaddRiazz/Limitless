import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { ComponentProps } from "react";

import ChatScreen from "./screens/chat-screen";
import CommunityScreen from "./screens/community-screen";
import HomeScreen from "./screens/home-screen";
import LoggerScreen from "./screens/logger-screen";
import ProfileScreen from "./screens/profile-screen";
import WorkoutScreen from "./screens/workout-screen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#00000a",
          borderTopColor: "#2e2e2e",
          height: 65,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "#808080",
        tabBarIcon: ({ color, size }) => {
          let iconName: ComponentProps<typeof MaterialCommunityIcons>["name"];

          if (route.name === "Home") {
            iconName = "home-variant";
          } else if (route.name === "Workout") {
            iconName = "dumbbell";
          } else if (route.name === "Logger") {
            iconName = "clipboard-text";
          } else if (route.name === "Community") {
            iconName = "chat";
          } else if (route.name === "Chat") {
            iconName = "robot";
          } else {
            iconName = "account";
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Workout" component={WorkoutScreen} />
      <Tab.Screen name="Logger" component={LoggerScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

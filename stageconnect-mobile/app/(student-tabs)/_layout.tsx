import React from "react";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Platform } from "react-native";
import { theme } from "../../constants/theme";

export default function StudentTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.faint,
        tabBarLabelStyle: {
          fontSize: 11.5,
          fontWeight: "700",
          marginTop: Platform.OS === "ios" ? 0 : -2,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.stroke,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 86 : 66,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 26 : 12,
        },
      }}
    >
      <Tabs.Screen
        name="jobs"
        options={{
          title: "Offres",
          tabBarIcon: ({ color, size }) => (
            <Feather name="briefcase" color={color} size={size ?? 20} />
          ),
        }}
      />

      <Tabs.Screen
        name="applications"
        options={{
          title: "Candidatures",
          tabBarIcon: ({ color, size }) => (
            <Feather name="file-text" color={color} size={size ?? 20} />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifs",
          tabBarIcon: ({ color, size }) => (
            <Feather name="bell" color={color} size={size ?? 20} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" color={color} size={size ?? 20} />
          ),
        }}
      />
    </Tabs>
  );
}
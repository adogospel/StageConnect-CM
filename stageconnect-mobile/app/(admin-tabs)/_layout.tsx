import React from "react";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Admin",
          tabBarIcon: ({ color, size }) => (
            <Feather name="layout" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="companies"
        options={{
          title: "Entreprises",
          tabBarIcon: ({ color, size }) => (
            <Feather name="shield" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
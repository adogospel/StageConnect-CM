import React from "react";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Platform, View } from "react-native";
import { theme } from "../../constants/theme";

function OffersTabIcon({
  color,
  size,
  focused,
}: {
  color: string;
  size?: number;
  focused: boolean;
}) {
  const s = size ?? 20;

  return (
    <View
      style={{
        width: 30,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <Feather name="briefcase" color={color} size={s} />
      <View
        style={{
          position: "absolute",
          top: -1,
          right: -1,
          width: 11,
          height: 11,
          borderRadius: 999,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name="plus" color="#fff" size={8} />
      </View>

      <View
        style={{
          position: "absolute",
          bottom: 1,
          right: 2,
          width: 0,
          height: 0,
          borderLeftWidth: 4,
          borderRightWidth: 4,
          borderBottomWidth: 0,
          borderTopWidth: 6,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: focused ? color : `${color}CC`,
        }}
      />
    </View>
  );
}

export default function CompanyTabsLayout() {
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
        name="home"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" color={color} size={size ?? 20} />
          ),
        }}
      />

      <Tabs.Screen
        name="publications"
        options={{
          title: "Mes offres",
          tabBarIcon: ({ color, size, focused }) => (
            <OffersTabIcon color={color} size={size} focused={focused} />
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
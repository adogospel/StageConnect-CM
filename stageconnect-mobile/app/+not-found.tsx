import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function NotFound() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: "900" }}>Page introuvable</Text>
      <Text style={{ marginTop: 8, opacity: 0.7, textAlign: "center" }}>
        Cette route n’existe pas dans l’application.
      </Text>

      <Pressable
        onPress={() => router.replace("/")}
        style={{
          marginTop: 16,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: 12,
          borderWidth: 1,
          opacity: 0.9,
        }}
      >
        <Text style={{ fontWeight: "900" }}>Revenir</Text>
      </Pressable>
    </View>
  );
}
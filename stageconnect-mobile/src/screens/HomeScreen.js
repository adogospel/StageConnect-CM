import React, { useContext } from "react";
import { View, Text, Button } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function HomeScreen() {
  const { logout } = useContext(AuthContext);

  return (
    <View style={{ padding: 20 }}>
      <Text>Bienvenue sur StageConnect 🚀</Text>
      <Button title="Se déconnecter" onPress={logout} />
    </View>
  );
}
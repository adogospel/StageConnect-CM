import React, { useState, useContext } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);

  return (
    <View style={{ padding: 20 }}>
      <Text>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <Button title="Se connecter" onPress={() => login(email, password)} />
      <Text onPress={() => navigation.navigate("Register")}>
        Pas de compte ? S&apos;inscrire
      </Text>
    </View>
  );
}
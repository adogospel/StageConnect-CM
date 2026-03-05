import React, { useState, useContext } from "react";
import { View, TextInput, Button } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useContext(AuthContext);

  return (
    <View style={{ padding: 20 }}>
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
      <Button
        title="Créer compte étudiant"
        onPress={() => register(email, password, "student")}
      />
      <Button
        title="Créer compte entreprise"
        onPress={() => register(email, password, "company")}
      />
    </View>
  );
}
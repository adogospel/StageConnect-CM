import React, { useState } from "react";
import { View, TextInput, Button } from "react-native";
import API from "../services/api";

export default function CreateStudentProfileScreen({ refresh }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    university: "",
    fieldOfStudy: "",
    level: "",
    city: "",
  });

  const handleCreate = async () => {
    await API.post("/students/profile", form);
    refresh();
  };

  return (
    <View style={{ padding: 20 }}>
      {Object.keys(form).map((key) => (
        <TextInput
          key={key}
          placeholder={key}
          value={form[key]}
          onChangeText={(text) =>
            setForm({ ...form, [key]: text })
          }
          style={{ borderWidth: 1, marginBottom: 10 }}
        />
      ))}
      <Button title="Créer Profil" onPress={handleCreate} />
    </View>
  );
}
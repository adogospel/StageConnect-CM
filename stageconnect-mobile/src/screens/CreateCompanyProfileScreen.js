import React, { useState } from "react";
import { View, TextInput, Button } from "react-native";
import API from "../services/api";

export default function CreateCompanyProfileScreen({ refresh }) {
  const [form, setForm] = useState({
    companyName: "",
    sector: "",
    city: "",
    address: "",
    phone: "",
  });

  const handleCreate = async () => {
    await API.post("/companies/profile", form);
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
      <Button title="Créer Profil Entreprise" onPress={handleCreate} />
    </View>
  );
}
import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import API from "../services/api";

export default function InternshipDetailScreen({ route }) {
  const { id } = route.params;
  const [internship, setInternship] = useState(null);

  useEffect(() => {
    const fetchInternship = async () => {
      const res = await API.get(`/internships/${id}`);
      setInternship(res.data);
    };

    fetchInternship();
  }, []);

  const handleApply = async () => {
    await API.post(`/applications/${id}/apply`);
    alert("Candidature envoyée !");
  };

  if (!internship) return <Text>Chargement...</Text>;

  return (
    <View style={{ padding: 20 }}>
      <Text>{internship.title}</Text>
      <Text>{internship.description}</Text>
      <Text>{internship.location}</Text>

      <Button title="Postuler" onPress={handleApply} />
    </View>
  );
}
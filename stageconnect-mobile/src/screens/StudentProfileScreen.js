import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import API from "../services/api";
import CreateStudentProfileScreen from "./CreateStudentProfileScreen";

export default function StudentProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/students/profile/me");
      setProfile(res.data);
    } catch (error) {
      setProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <Text>Chargement...</Text>;

  if (!profile) return <CreateStudentProfileScreen refresh={fetchProfile} />;

  return (
    <View style={{ padding: 20 }}>
      <Text>{profile.firstName} {profile.lastName}</Text>
      <Text>{profile.university}</Text>
      <Text>{profile.fieldOfStudy}</Text>
      <Text>{profile.city}</Text>
    </View>
  );
}
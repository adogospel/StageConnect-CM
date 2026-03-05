import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import API from "../services/api";
import CreateCompanyProfileScreen from "./CreateCompanyProfileScreen";

export default function CompanyProfileScreen() {
  const [profile, setProfile] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/companies/profile/me");
      setProfile(res.data);
    } catch (error) {
      setProfile(null);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!profile)
    return <CreateCompanyProfileScreen refresh={fetchProfile} />;

  return (
    <View style={{ padding: 20 }}>
      <Text>{profile.companyName}</Text>
      <Text>{profile.sector}</Text>
      <Text>{profile.city}</Text>
    </View>
  );
}
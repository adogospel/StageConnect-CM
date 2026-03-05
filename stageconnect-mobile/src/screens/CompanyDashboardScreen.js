import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, Button, RefreshControl } from "react-native";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function CompanyDashboardScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyJobs = async () => {
    try {
      const res = await API.get("/jobs/company/me");
      setJobs(res.data);
    } catch (e) {
      setJobs([]);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyJobs();
    setRefreshing(false);
  };

  return (
    <View style={{ padding: 16, flex: 1 }}>
      <View style={{ gap: 10, marginBottom: 12 }}>
        <Button title="Mon profil entreprise" onPress={() => navigation.navigate("CompanyProfile")} />
        <Button title="Se déconnecter" onPress={logout} />
      </View>

      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>
        Mes offres
      </Text>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text>Aucune offre pour le moment.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              padding: 12,
              borderWidth: 1,
              borderRadius: 10,
              marginBottom: 10,
            }}
            onPress={() =>
              navigation.navigate("JobApplications", {
                jobId: item._id,
                jobTitle: item.title,
              })
            }
          >
            <Text style={{ fontWeight: "700" }}>{item.title}</Text>
            <Text>{item.city} • {item.domain}</Text>
            <Text>{item.contractType}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Button, Alert, RefreshControl } from "react-native";
import API from "../services/api";

export default function JobApplicationsScreen({ route, navigation }) {
  const { jobId, jobTitle } = route.params;
  const [applications, setApplications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApps = async () => {
    try {
      const res = await API.get(`/applications/job/${jobId}`);
      // Ton backend renvoie soit un tableau direct, soit {applications: []}
      const list = Array.isArray(res.data) ? res.data : res.data.applications;
      setApplications(list || []);
    } catch (e) {
      setApplications([]);
    }
  };

  useEffect(() => {
    navigation.setOptions({ title: jobTitle || "Candidatures" });
    fetchApps();
  }, []);

  const updateStatus = async (applicationId, status) => {
    try {
      await API.put(`/applications/${applicationId}/status`, { status });
      await fetchApps();
      Alert.alert("OK", `Candidature ${status}`);
    } catch (e) {
      Alert.alert("Erreur", "Impossible de mettre à jour le statut");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApps();
    setRefreshing(false);
  };

  return (
    <View style={{ padding: 16, flex: 1 }}>
      <FlatList
        data={applications}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text>Aucune candidature pour cette offre.</Text>}
        renderItem={({ item }) => {
          const student = item.student; // populate("student")
          return (
            <View
              style={{
                padding: 12,
                borderWidth: 1,
                borderRadius: 10,
                marginBottom: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate("StudentPreview", { student })}
              >
                <Text style={{ fontWeight: "800" }}>
                  {student?.firstName || "Étudiant"} {student?.lastName || ""}
                </Text>
                <Text>
                  {student?.university || ""} • {student?.fieldOfStudy || ""}
                </Text>
              </TouchableOpacity>

              {item.message ? (
                <Text style={{ marginTop: 6 }}>Message: {item.message}</Text>
              ) : null}

              <Text style={{ marginTop: 6, fontWeight: "700" }}>
                Statut: {item.status}
              </Text>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <Button
                  title="Accepter"
                  onPress={() =>
                    Alert.alert(
                      "Confirmer",
                      "Accepter cette candidature ?",
                      [
                        { text: "Annuler", style: "cancel" },
                        { text: "Oui", onPress: () => updateStatus(item._id, "accepted") },
                      ]
                    )
                  }
                />
                <Button
                  title="Refuser"
                  onPress={() =>
                    Alert.alert(
                      "Confirmer",
                      "Refuser cette candidature ?",
                      [
                        { text: "Annuler", style: "cancel" },
                        { text: "Oui", onPress: () => updateStatus(item._id, "rejected") },
                      ]
                    )
                  }
                />
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
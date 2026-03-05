import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import API from "../services/api";

export default function InternshipListScreen({ navigation }) {
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    const fetchInternships = async () => {
      const res = await API.get("/internships");
      setInternships(res.data);
    };

    fetchInternships();
  }, []);

  return (
    <FlatList
      data={internships}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("InternshipDetail", { id: item._id })
          }
        >
          <View style={{ padding: 15, borderBottomWidth: 1 }}>
            <Text>{item.title}</Text>
            <Text>{item.location}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}
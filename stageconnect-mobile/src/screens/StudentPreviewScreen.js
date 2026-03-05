import React from "react";
import { View, Text } from "react-native";

export default function StudentPreviewScreen({ route }) {
  const { student } = route.params;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "800" }}>
        {student?.firstName || ""} {student?.lastName || ""}
      </Text>

      <Text style={{ marginTop: 8 }}>
        Université : {student?.university || "-"}
      </Text>
      <Text style={{ marginTop: 6 }}>
        Filière : {student?.fieldOfStudy || "-"}
      </Text>
      <Text style={{ marginTop: 6 }}>
        Niveau : {student?.level || "-"}
      </Text>
      <Text style={{ marginTop: 6 }}>
        Ville : {student?.city || "-"}
      </Text>

      {Array.isArray(student?.skills) && student.skills.length > 0 ? (
        <Text style={{ marginTop: 10 }}>
          Compétences : {student.skills.join(", ")}
        </Text>
      ) : (
        <Text style={{ marginTop: 10 }}>Compétences : -</Text>
      )}
    </View>
  );
}
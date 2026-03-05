import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CompanyDashboardScreen from "../screens/CompanyDashboardScreen";
import JobApplicationsScreen from "../screens/JobApplicationsScreen";
import StudentPreviewScreen from "../screens/StudentPreviewScreen";
import CompanyProfileScreen from "../screens/CompanyProfileScreen";

const Stack = createNativeStackNavigator();

export default function CompanyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CompanyDashboard"
        component={CompanyDashboardScreen}
        options={{ title: "Dashboard Entreprise" }}
      />
      <Stack.Screen
        name="CompanyProfile"
        component={CompanyProfileScreen}
        options={{ title: "Profil Entreprise" }}
      />
      <Stack.Screen
        name="JobApplications"
        component={JobApplicationsScreen}
        options={{ title: "Candidatures" }}
      />
      <Stack.Screen
        name="StudentPreview"
        component={StudentPreviewScreen}
        options={{ title: "Profil Étudiant" }}
      />
    </Stack.Navigator>
  );
}
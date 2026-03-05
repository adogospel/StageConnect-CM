import React, { useContext ,useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/AuthContext";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import StudentProfileScreen from "../screens/StudentProfileScreen";
import CompanyStack from "./CompanyStack";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { userToken } = useContext(AuthContext);
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  // 🔥 1. Charger le rôle après login
  useEffect(() => {
    const loadRole = async () => {
      const r = await AsyncStorage.getItem("role");
      setRole(r);
      setLoadingRole(false);
    };

    loadRole();
  }, [userToken]); 
  // ⚠️ important : se relance quand userToken change

  if (loadingRole) return null; // on attend que le rôle soit chargé

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          role === "student" ? (
            <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
          ) : (
            <Stack.Screen name="CompanyArea" component={CompanyStack} />
          )
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
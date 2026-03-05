import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    const token = await AsyncStorage.getItem("token");
    if (token) setUserToken(token);
    setLoading(false);
  };

  const login = async (email, password) => {
  const res = await API.post("/auth/login", { email, password });

  await AsyncStorage.setItem("token", res.data.token);
  await AsyncStorage.setItem("role", res.data.role);

  setUserToken(res.data.token);
};

const register = async (email, password, role) => {
  const res = await API.post("/auth/register", {
    email,
    password,
    role,
  });

  await AsyncStorage.setItem("token", res.data.token);
  await AsyncStorage.setItem("role", res.data.role);

  setUserToken(res.data.token);
};

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("role");
    setUserToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ userToken, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
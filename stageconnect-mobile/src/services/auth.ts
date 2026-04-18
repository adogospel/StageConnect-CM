import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../lib/apiClient";

export type AuthResponse = {
  _id: string;
  email: string;
  role: "student" | "company" | "admin"; // ✅ AJOUT ADMIN
  token?: string;
  accessToken?: string;
};

export async function login(email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/api/auth/login", {
    email,
    password,
  });

  const token = data.token || data.accessToken;
  if (!token) throw new Error("Token manquant");

  await AsyncStorage.setItem("sc_token", token);
  await AsyncStorage.setItem(
    "sc_user",
    JSON.stringify({
      _id: data._id,
      email: data.email,
      role: data.role,
    })
  );

  return data;
}

export async function register(payload: any) {
  const { data } = await api.post<AuthResponse>("/api/auth/register", payload);

  const token = data.token || data.accessToken;
  if (!token) throw new Error("Token manquant");

  await AsyncStorage.setItem("sc_token", token);
  await AsyncStorage.setItem(
    "sc_user",
    JSON.stringify({
      _id: data._id,
      email: data.email,
      role: data.role,
    })
  );

  return data;
}

export async function logout() {
  await AsyncStorage.multiRemove(["sc_token", "sc_user"]);
}

export async function getCurrentUser() {
  const raw = await AsyncStorage.getItem("sc_user");
  return raw ? JSON.parse(raw) : null;
}

export async function getToken() {
  return AsyncStorage.getItem("sc_token");
}

export async function getMe() {
  const { data } = await api.get("/api/auth/me");
  return data;
}
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../lib/apiClient";

export type Role = "student" | "company";

export type AuthResponse = {
  _id: string;
  email: string;
  role: Role;
  token: string;
};

export async function login(email: string, password: string) {
  const { data } = await api.post("/api/auth/login", { email, password });

  const token = data.token || data.accessToken;
  if (!token) throw new Error("Token manquant");

  await AsyncStorage.setItem("sc_token", token);

  // ✅ on stocke aussi le rôle pour le routing au démarrage
  if (data?.role) {
    await AsyncStorage.setItem("sc_role", String(data.role));
  }

  return data;
}

export async function register(payload: any) {
  const { data } = await api.post("/api/auth/register", payload);
  return data;
}

export async function logout() {
  await AsyncStorage.multiRemove(["sc_token", "sc_user"]);
}

export async function getCurrentUser() {
  const raw = await AsyncStorage.getItem("sc_user");
  return raw ? JSON.parse(raw) : null;
}
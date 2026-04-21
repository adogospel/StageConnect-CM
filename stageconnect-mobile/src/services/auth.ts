import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../lib/apiClient";

export type UserRole = "student" | "company" | "admin";
export type CandidateType = "student" | "worker";

export type AuthResponse = {
  _id: string;
  email: string;
  role: UserRole;
  token?: string;
  accessToken?: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  role: UserRole;

  // admin
  adminSecret?: string;

  // candidat
  fullName?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  phone?: string;
  skills?: string[];
  candidateType?: CandidateType;

  // étudiant
  university?: string;
  fieldOfStudy?: string;
  level?: string;

  // travailleur
  activitySector?: string;
  yearsOfExperience?: number;
  highestEducation?: string;
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

export async function register(payload: RegisterPayload) {
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
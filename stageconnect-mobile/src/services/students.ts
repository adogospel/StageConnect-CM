import { api } from "../lib/apiClient";

export async function getMyStudentProfile() {
  const { data } = await api.get("/api/students/profile/me");
  return data;
}

export async function updateMyStudentProfile(payload: any) {
  const { data } = await api.put("/api/students/profile", payload);
  return data;
}
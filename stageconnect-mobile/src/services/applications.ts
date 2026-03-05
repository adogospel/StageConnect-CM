import { api } from "../lib/apiClient";

export async function applyToJob(jobId: string, message?: string) {
  const { data } = await api.post("/api/applications", { jobId, message });
  return data; // { success: true, application }
}

export async function getMyApplications() {
  const { data } = await api.get("/api/applications/me");
  return data; // { success, count, applications }
}

// ✅ COMPANY: candidatures d'une offre
export async function getApplicationsByJob(jobId: string) {
  const { data } = await api.get(`/api/applications/job/${jobId}`);
  return data; // { success, count, applications }
}

// ✅ COMPANY: accepter/refuser
export async function updateApplicationStatus(
  id: string,
  status: "accepted" | "rejected"
) {
  const { data } = await api.put(`/api/applications/${id}/status`, { status });
  return data; // { success, application }
}
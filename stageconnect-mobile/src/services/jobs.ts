import { api } from "../lib/apiClient";

export type CreateJobPayload = {
  title: string;
  description: string;
  city: string;
  domain: string;
  contractType: "Stage académique" | "Stage pro" | "Job étudiant" | "Alternance";
  duration?: string;
  salary?: string;
  isPaid?: boolean;
  deadline?: string; // ISO
  isPremium?: boolean;
};

export async function getJobs(params?: any) {
  const { data } = await api.get("/api/jobs", { params });
  return data; // array
}

export async function getJobById(id: string) {
  const { data } = await api.get(`/api/jobs/${id}`);
  return data; // object
}

// ✅ COMPANY
export async function getMyCompanyJobs() {
  const { data } = await api.get("/api/jobs/company/me");
  return data; // array
}

export async function createJob(payload: CreateJobPayload) {
  const { data } = await api.post("/api/jobs", payload);
  return data; // created job
}

export async function updateJob(id: string, payload: Partial<CreateJobPayload>) {
  const { data } = await api.put(`/api/jobs/${id}`, payload);
  return data;
}

export async function deleteJob(id: string) {
  const { data } = await api.delete(`/api/jobs/${id}`);
  return data; // { message: "Offre désactivée" }
}
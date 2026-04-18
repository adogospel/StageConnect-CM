import { api } from "../lib/apiClient";

export type CreateJobPayload = {
  title: string;
  description: string;
  city: string;
  domain: string;
  contractType:
    | "Stage"
    | "CDD"
    | "CDI"
    | "Freelance"
    | "Alternance"
    | "Temps plein"
    | "Temps partiel";
  workMode?: "Présentiel" | "Hybride" | "Remote";
  duration?: string;
  experienceLevel?: "Junior" | "Intermédiaire" | "Senior" | "Sans expérience";
  salary?: string;
  isPaid?: boolean;
  deadline?: string;
  skills?: string[];
  isPremium?: boolean;
};

// ✅ garde getJobs pour compatibilité avec tes écrans existants
export async function getJobs(params?: any) {
  const { data } = await api.get("/api/jobs", { params });
  return data;
}

// ✅ alias moderne si plus tard tu veux uniformiser
export async function getAllJobs(params?: any) {
  return getJobs(params);
}

export async function getJobById(id: string) {
  const { data } = await api.get(`/api/jobs/${id}`);
  return data;
}

export async function getMyCompanyJobs() {
  const { data } = await api.get("/api/jobs/company/me");
  return data;
}

export async function createJob(payload: CreateJobPayload) {
  const { data } = await api.post("/api/jobs", payload);
  return data;
}

export async function updateJob(
  id: string,
  payload: Partial<CreateJobPayload>
) {
  const { data } = await api.put(`/api/jobs/${id}`, payload);
  return data;
}

export async function deleteJob(id: string) {
  const { data } = await api.delete(`/api/jobs/${id}`);
  return data;
}
import { api } from "../lib/apiClient";

export async function applyToJob(jobId: string, message?: string, cv?: any) {
  const formData = new FormData();

  formData.append("jobId", jobId);

  if (message?.trim()) {
    formData.append("message", message.trim());
  }

  if (cv) {
    formData.append("cv", {
      uri: cv.uri,
      name: cv.name || "cv.pdf",
      type: cv.mimeType || "application/pdf",
    } as any);
  }

  const { data } = await api.post("/api/applications", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}

export async function getMyApplications() {
  const { data } = await api.get("/api/applications/me");
  return data;
}

export async function getApplicationsByJob(jobId: string) {
  const { data } = await api.get(`/api/applications/job/${jobId}`);
  return data;
}

export async function getApplicationById(id: string) {
  const { data } = await api.get(`/api/applications/${id}`);
  return data;
}

export async function updateApplicationStatus(
  id: string,
  status: "accepted" | "rejected"
) {
  const { data } = await api.put(`/api/applications/${id}/status`, { status });
  return data;
}
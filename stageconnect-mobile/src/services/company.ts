import { api } from "../lib/apiClient";

export async function getMyCompanyProfile() {
  const { data } = await api.get("/api/companies/profile/me");
  return data;
}

export async function createCompanyProfile(payload: {
  companyName: string;
  sector: string;
  city: string;
  address?: string;
  phone: string;
  logoUrl?: string;
  description?: string;
}) {
  const { data } = await api.post("/api/companies/profile", payload);
  return data;
}

export async function updateCompanyProfile(payload: {
  companyName?: string;
  sector?: string;
  city?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
  description?: string;
}) {
  const { data } = await api.put("/api/companies/profile", payload);
  return data;
}

export async function uploadVerificationDocuments(params: {
  files: {
    uri: string;
    name: string;
    mimeType?: string;
  }[];
  documentType?: "rccm" | "niu" | "taxpayer_card" | "other";
}) {
  const formData = new FormData();

  formData.append("documentType", params.documentType || "other");

  params.files.forEach((file) => {
    formData.append("documents", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || "application/octet-stream",
    } as any);
  });

  const { data } = await api.post(
    "/api/companies/verification/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}
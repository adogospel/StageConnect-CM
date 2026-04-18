import { api } from "../lib/apiClient";

export type CompanyProfilePayload = {
  companyName: string;
  sector: string;
  city: string;
  phone: string;
  address?: string;
  description?: string;
  logoUrl?: string;
};

export async function getMyCompanyProfile() {
  const { data } = await api.get("/api/companies/profile/me");
  return data; // profile
}

export async function createCompanyProfile(payload: CompanyProfilePayload) {
  const { data } = await api.post("/api/companies/profile", payload);
  return data; // created profile
}

export async function updateCompanyProfile(payload: Partial<CompanyProfilePayload>) {
  const { data } = await api.put("/api/companies/profile", payload);
  return data; // updated profile
}
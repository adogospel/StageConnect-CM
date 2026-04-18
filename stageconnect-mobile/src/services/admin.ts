import { api } from "../lib/apiClient";

export async function getCompaniesForReview(status = "pending") {
  const { data } = await api.get(`/api/admin/companies?status=${status}`);
  return data;
}

export async function getCompanyReviewDetails(id: string) {
  const { data } = await api.get(`/api/admin/companies/${id}`);
  return data;
}

export async function approveCompany(id: string) {
  const { data } = await api.put(`/api/admin/companies/${id}/approve`);
  return data;
}

export async function rejectCompany(id: string, reason: string) {
  const { data } = await api.put(`/api/admin/companies/${id}/reject`, {
    reason,
  });
  return data;
}
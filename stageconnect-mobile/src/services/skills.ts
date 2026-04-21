import { api } from "../lib/apiClient";

export type SkillItem = {
  _id: string;
  name: string;
  slug: string;
  usageCount?: number;
};

export async function searchSkills(query: string): Promise<SkillItem[]> {
  const { data } = await api.get("/api/skills", {
    params: { q: query },
  });

  return Array.isArray(data) ? data : [];
}

export async function createSkill(name: string): Promise<SkillItem> {
  const { data } = await api.post("/api/skills", { name });
  return data;
}
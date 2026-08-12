import { api } from "../lib/apiClient";

export type ContractType =
  | "Stage"
  | "CDD"
  | "CDI"
  | "Freelance"
  | "Alternance"
  | "Temps partiel";

export type WorkMode =
  | "Présentiel"
  | "Hybride"
  | "Remote";

export type JobImageFile = {
  uri: string;
  name?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  type?: string | null;
  fileSize?: number | null;
};

export type CreateJobPayload = {
  title: string;
  description: string;
  city: string;
  country?: string;
  domain: string;

  contractType: ContractType;
  workMode?: WorkMode;
  duration?: string;

  salary?: string;
  isPaid?: boolean;

  deadline?: string;
  skills?: string[];

  requirements?: string;
  benefits?: string;

  image?: JobImageFile | null;
};

export type UpdateJobPayload = Partial<CreateJobPayload> & {
  removeImage?: boolean;
};

function inferImageMimeType(fileName = "") {
  const extension = fileName
    .split(".")
    .pop()
    ?.toLowerCase();

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";

    case "png":
      return "image/png";

    case "webp":
      return "image/webp";

    case "gif":
      return "image/gif";

    default:
      return "image/jpeg";
  }
}

function appendTextField(
  formData: FormData,
  key: string,
  value: unknown
) {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    formData.append(key, JSON.stringify(value));
    return;
  }

  if (typeof value === "boolean") {
    formData.append(key, value ? "true" : "false");
    return;
  }

  formData.append(key, String(value));
}

function buildJobFormData(
  payload: CreateJobPayload | UpdateJobPayload
) {
  const formData = new FormData();

  const {
    image,
    ...textPayload
  } = payload;

  Object.entries(textPayload).forEach(([key, value]) => {
    appendTextField(formData, key, value);
  });

  if (image?.uri) {
    const fileName =
      image.name ||
      image.fileName ||
      `flyer-${Date.now()}.jpg`;

    const mimeType =
      image.mimeType ||
      image.type ||
      inferImageMimeType(fileName);

    formData.append(
      "image",
      {
        uri: image.uri,
        name: fileName,
        type: mimeType,
      } as any
    );
  }

  return formData;
}

// Garde getJobs pour tes écrans existants.
export async function getJobs(params?: any) {
  const { data } = await api.get("/api/jobs", {
    params,
  });

  return data;
}

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
  const formData = buildJobFormData(payload);

  const { data } = await api.post(
    "/api/jobs",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}

export async function updateJob(
  id: string,
  payload: UpdateJobPayload
) {
  const formData = buildJobFormData(payload);

  const { data } = await api.put(
    `/api/jobs/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}

export async function deleteJob(id: string) {
  const { data } = await api.delete(`/api/jobs/${id}`);
  return data;
}

export function resolveJobImageUrl(imageUrl?: string | null) {
  if (!imageUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  const baseUrl = String(
    api.defaults.baseURL || ""
  ).replace(/\/+$/, "");

  const cleanPath = String(imageUrl).replace(/^\/+/, "");

  return `${baseUrl}/${cleanPath}`;
}

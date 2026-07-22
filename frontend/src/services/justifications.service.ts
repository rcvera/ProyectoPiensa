import { api } from "./auth.service";

export interface JustificationFilters {
  userId?: string | number;
  type?: string;
  status?: string;
  from?: string;
  to?: string;
}

export interface JustificationResponse {
  status: string;
  adminResponse: string;
}

const create = async (
  formData: FormData,
) => {

  const response =
    await api.post(
      "/justifications",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      },
    );

  return response.data;
};

const list = async (
  filters?: JustificationFilters,
) => {

  const response =
    await api.get(
      "/justifications",
      {
        params: filters,
      },
    );

  return response.data;
};

const listMine = async () => {

  const response =
    await api.get(
      "/justifications/mine",
    );

  return response.data;
};

const getById = async (
  id: string | number,
) => {

  const response =
    await api.get(
      `/justifications/${id}`,
    );

  return response.data;
};

const respond = async (
  id: string | number,
  payload: JustificationResponse,
) => {

  const response =
    await api.patch(
      `/justifications/${id}`,
      payload,
    );

  return response.data;
};

export const justificationsService = {
  create,
  list,
  listMine,
  getById,
  respond,
};

export default justificationsService;

import { api } from "./auth.service";

export interface IncidentFilters {
  userId?: string | number;
  type?: string;
  status?: string;
  from?: string;
  to?: string;
}

export interface IncidentResponse {
  status: string;
  adminResponse: string;
}

const create = async (
  formData: FormData,
) => {

  const response =
    await api.post(
      "/incidents",
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
  filters?: IncidentFilters,
) => {

  const response =
    await api.get(
      "/incidents",
      {
        params: filters,
      },
    );

  return response.data;
};

const listMine = async () => {

  const response =
    await api.get(
      "/incidents/mine",
    );

  return response.data;
};

const getById = async (
  id: string | number,
) => {

  const response =
    await api.get(
      `/incidents/${id}`,
    );

  return response.data;
};

const respond = async (
  id: string | number,
  payload: IncidentResponse,
) => {

  const response =
    await api.patch(
      `/incidents/${id}`,
      payload,
    );

  return response.data;
};

export const incidentsService = {
  create,
  list,
  listMine,
  getById,
  respond,
};

export default incidentsService;

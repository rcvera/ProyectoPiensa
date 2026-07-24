import { api } from "./auth.service";

export interface WorkloadSurveyFilters {
  month?: number;
  year?: number;
}

export interface WorkloadSurveyAnswer {
  hoursFeeling: number;
  physicalLoad: number;
  emotionalLoad: number;
  comments?: string;
}

const listAll = async (
  filters?: WorkloadSurveyFilters,
) => {

  const response =
    await api.get(
      "/workload-surveys",
      {
        params: filters,
      },
    );

  return response.data;
};

const listMine = async () => {

  const response =
    await api.get(
      "/workload-surveys/mine",
    );

  return response.data;
};

const answer = async (
  id: string,
  payload: WorkloadSurveyAnswer,
) => {

  const response =
    await api.patch(
      `/workload-surveys/${id}`,
      payload,
    );

  return response.data;
};

export const workloadSurveysService = {
  listAll,
  listMine,
  answer,
};

export default workloadSurveysService;

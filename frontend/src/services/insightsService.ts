import api from "./api";

export interface InsightsParams {
  start_date?: string;
  end_date?: string;
  classroom?: string;
  teacher?: string;
  child?: string;
}

export const getInsights = async (params: InsightsParams = {}) => {
  const response = await api.get("/insights/", {
    params,
  });

  return response.data;
};
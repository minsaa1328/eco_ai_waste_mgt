import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL + "/api/orchestrator";

export const runTextClassification = async (item) => {
  const payload = {
    task: "custom",
    need: ["classify"],
    payload: { item },
  };
  const response = await axios.post(`${API_BASE}/handle`, payload);
  return response.data;
};

export const runImageClassification = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const params = { needs: "classify" };
  const response = await axios.post(`${API_BASE}/handle/image`, formData, {
    params,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const checkBackendHealth = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/health`);
  return response.data;
};

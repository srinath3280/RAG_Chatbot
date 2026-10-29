import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 120000,
});

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    "/api/documents/upload",
    formData
  );

  return response.data;
};

export const getDocuments = async () => {
  const response = await api.get("/api/documents");

  return response.data;
};

export const deleteDocument = async (documentId) => {
  const response = await api.delete(
    `/api/documents/${encodeURIComponent(documentId)}`
  );

  return response.data;
};

export const askQuestion = async (question, documentIds) => {
  const response = await api.post("/api/chat/ask", {
    question,
    document_ids: documentIds,
  });

  return response.data;
};

export default api;
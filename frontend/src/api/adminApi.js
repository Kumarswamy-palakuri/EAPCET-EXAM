import api from "./http";

export const fetchQuestions = async () => {
  const { data } = await api.get("/admin/questions");
  return data;
};

export const createQuestion = async (payload) => {
  const { data } = await api.post("/admin/question", payload);
  return data;
};

export const updateQuestion = async (id, payload) => {
  const { data } = await api.put(`/admin/question/${id}`, payload);
  return data;
};

export const deleteQuestion = async (id) => {
  const { data } = await api.delete(`/admin/question/${id}`);
  return data;
};

export const bulkUploadQuestions = async (questions) => {
  const { data } = await api.post("/admin/questions/bulk", { questions });
  return data;
};

export const createExam = async (payload) => {
  const { data } = await api.post("/admin/exam", payload);
  return data;
};

export const fetchAllAttempts = async () => {
  const { data } = await api.get("/admin/attempts");
  return data;
};

export const fetchExams = async () => {
  const { data } = await api.get("/admin/exams");
  return data;
};

export const updateExam = async (id, payload) => {
  const { data } = await api.put(`/admin/exam/${id}`, payload);
  return data;
};

export const deleteExam = async (id) => {
  const { data } = await api.delete(`/admin/exam/${id}`);
  return data;
};

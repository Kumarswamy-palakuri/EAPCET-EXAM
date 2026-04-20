import api from "./http";

export const fetchExamList = async () => {
  const { data } = await api.get("/exam/list");
  return data;
};

export const fetchExamQuestions = async (params) => {
  const { data } = await api.get("/exam/questions", { params });
  return data;
};

export const submitExamAttempt = async (payload) => {
  const { data } = await api.post("/exam/submit", payload);
  return data;
};

export const fetchMyAttempts = async () => {
  const { data } = await api.get("/exam/attempts");
  return data;
};

export const fetchAttemptById = async (attemptId) => {
  const { data } = await api.get(`/exam/attempt/${attemptId}`);
  return data;
};

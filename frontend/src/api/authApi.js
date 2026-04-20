import api from "./http";

export const loginWithGoogle = async (credential) => {
  const { data } = await api.post("/auth/google", { credential });
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const logoutUser = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};

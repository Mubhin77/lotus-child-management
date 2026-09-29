import api from "./api";

interface LoginResponse {
  access: string;
  refresh: string;
}

export const login = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/token/", {
    username,
    password,
  });

  localStorage.setItem("access_token", response.data.access);
  localStorage.setItem("refresh_token", response.data.refresh);

  return response.data;
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const isAuthenticated = () => {
  return Boolean(localStorage.getItem("access_token"));
};

export interface CurrentUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: "admin" | "teacher" | "parent" | "unknown";
}

// export const getCurrentUser = async (): Promise<CurrentUser> => {
//   const response = await api.get<CurrentUser>("/me/");
//   return response.data;
// };

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const response = await api.get<CurrentUser>("/me/");

  localStorage.setItem("user_role", response.data.role);

  return response.data;
};

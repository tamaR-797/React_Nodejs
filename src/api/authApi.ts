import axiosInstance from './axiosInstance';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

interface LoginApiResponse {
  status: string;
  message: string;
  token: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface RegisterApiResponse {
  status: string;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginApiResponse>('/auth/login', payload);
  const { token, data } = response.data;

  return {
    token,
    user: {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
    },
  };
};

export const register = async (payload: RegisterRequest): Promise<AuthUser> => {
  const response = await axiosInstance.post<RegisterApiResponse>('/auth/register', payload);
  const { data } = response.data;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
  };
};

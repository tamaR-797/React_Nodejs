import { login as loginApi, register as registerApi } from '../../api/authApi';
import { LoginResponse } from './authSlice';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export const loginUser = async (payload: LoginRequest): Promise<LoginResponse> => {
  return loginApi(payload);
};

// פונקציה מדומה (Mock) להרשמה
export const registerUser = async (payload: RegisterRequest): Promise<void> => {
  await registerApi(payload);
};
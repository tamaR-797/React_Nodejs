import axiosInstance from './axiosInstance';

const apiOrigin = (() => {
  const url = import.meta.env.VITE_API_URL?.toString();
  if (!url) return 'http://localhost:5000';
  return url.replace(/\/api\/?$/, '').replace(/\/+$/, '');
})();

export const getAvatarUrl = (avatarUrl?: string | null): string | null => {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http') || avatarUrl.startsWith('blob:')) return avatarUrl;
  return `${apiOrigin}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role?: string;
  threadsCount?: number;
  commentsCount?: number;
  createdAt?: string;
  lastSeen?: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  lastSeen?: string;
  createdAt?: string;
  commentsCount?: number;
}

export const getCurrentUser = async (): Promise<UserProfile> => {
  const response = await axiosInstance.get<{ status: string; data: UserProfile }>('/users/me');
  return response.data.data;
};

export const uploadAvatar = async (file: File): Promise<UserProfile> => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await axiosInstance.post<{ status: string; data: UserProfile }>(
    '/users/me/avatar',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data.data;
};

export const getAllUsers = async (): Promise<AdminUser[]> => {
  const response = await axiosInstance.get<{ status: string; data: AdminUser[] }>('/users');
  return response.data.data;
};

export const getActiveUsers = async (): Promise<AdminUser[]> => {
  const response = await axiosInstance.get<{ status: string; data: AdminUser[] }>('/users/active');
  return response.data.data;
};

export const updateUserAdmin = async (
  id: string,
  data: { name?: string; email?: string; role?: string }
): Promise<AdminUser> => {
  const response = await axiosInstance.put<{ status: string; data: AdminUser }>(`/users/${id}`, data);
  return response.data.data;
};

export const deleteUserAdmin = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/users/${id}`);
};

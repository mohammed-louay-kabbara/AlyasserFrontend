import api from "./axiosInstance";

// Types
export interface Permission {
  id: number;
  name: string;
  label_ar: string;
  label_en: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name_en: string;
  name_ar: string;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
}

export interface CreateRoleData {
  name_en: string;
  name_ar: string;
  permissions: number[];
}

export interface UpdateRoleData {
  name_en?: string;
  name_ar?: string;
  permissions?: number[];
}

// Roles API
export const getRoles = async (): Promise<{ data: Role[] }> => {
  const response = await api.get("/admin/roles");
  return response.data;
};

export const getRoleById = async (id: number): Promise<{ data: Role }> => {
  const response = await api.get(`/admin/roles/${id}`);
  return response.data;
};

export const createRole = async (data: CreateRoleData): Promise<{ data: Role }> => {
  const response = await api.post("/admin/roles", data);
  return response.data;
};

export const updateRole = async (id: number, data: UpdateRoleData): Promise<{ data: Role }> => {
  const response = await api.put(`/admin/roles/${id}`, data);
  return response.data;
};

export const deleteRole = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/roles/${id}`);
  return response.data;
};

// Permissions API
export const getPermissions = async (): Promise<{ data: Permission[] }> => {
  const response = await api.get("/admin/permissions");
  return response.data;
};

// Seed default roles and permissions
export const seedRolesAndPermissions = async (): Promise<{ message: string }> => {
  const response = await api.post("/admin/roles/seed");
  return response.data;
};

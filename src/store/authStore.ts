import { create } from "zustand";
import { User, Permission } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  permissions: Permission[];
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const savedUser = JSON.parse(localStorage.getItem("auth_user") || "null");
  const savedToken = localStorage.getItem("auth_token");
  
  return {
    user: savedUser,
    token: savedToken,
    isAuthenticated: !!savedToken,
    permissions: savedUser?.permissions || [],
    setAuth: (user, token) => {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
      const permissions = user.permissions || [];
      set({ user, token, isAuthenticated: true, permissions });
    },
  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    set({ user: null, token: null, isAuthenticated: false, permissions: [] });
  },
  hasPermission: (permission: Permission) => {
    const { permissions } = get();
    return permissions.includes(permission);
  },
  hasAnyPermission: (permissions: Permission[]) => {
    const { permissions: userPermissions } = get();
    return permissions.some((perm) => userPermissions.includes(perm));
  },
  hasRole: (role: string) => {
    const { user } = get();
    return user?.role?.name_en === role;
  },
};
});

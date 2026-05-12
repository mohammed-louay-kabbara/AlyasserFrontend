import { create } from "zustand";
import { User, Permission } from "../types";
import { saveLoginTimestamp, checkSessionExpiration, clearAuthData } from "../utils/sessionUtils";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  permissions: Permission[];
  needsPasswordChange: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasRole: (role: string) => boolean;
  checkSession: () => boolean;
  clearPasswordChangeFlag: () => void;
  checkPasswordChangeFlag: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Check session expiration on initialization
  const isSessionValid = checkSessionExpiration();
  
  const savedUser = isSessionValid ? JSON.parse(localStorage.getItem("auth_user") || "null") : null;
  const savedToken = isSessionValid ? localStorage.getItem("auth_token") : null;
  
  // Check if user needs to change password (from user data, not localStorage)
  // Handle both boolean and string values from backend
  const needsPasswordChange = savedUser?.force_password_change === true || String(savedUser?.force_password_change) === "1";
  
  // Debug: Log initialization values
  console.log("AuthStore init - savedUser:", savedUser);
  console.log("AuthStore init - needsPasswordChange:", needsPasswordChange);
  console.log("AuthStore init - force_password_change field:", savedUser?.force_password_change);
  
  return {
    user: savedUser,
    token: savedToken,
    isAuthenticated: !!savedToken,
    permissions: savedUser?.permissions || [],
    needsPasswordChange: needsPasswordChange,
    setAuth: (user, token) => {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
      saveLoginTimestamp();
      const permissions = user.permissions || [];
      // Handle both boolean and string values from backend
      const forcePasswordChange = user.force_password_change === true || String(user.force_password_change) === "1";
      
      // Debug: Log setAuth values
      console.log("setAuth - user:", user);
      console.log("setAuth - forcePasswordChange:", forcePasswordChange);
      console.log("setAuth - force_password_change field:", user.force_password_change);
      
      set({ user, token, isAuthenticated: true, permissions, needsPasswordChange: forcePasswordChange });
    },
    logout: () => {
      clearAuthData();
      set({ user: null, token: null, isAuthenticated: false, permissions: [], needsPasswordChange: false });
    },
    hasPermission: (permission) => {
      const { permissions } = get();
      return permissions.includes(permission);
    },
    hasAnyPermission: (permissions) => {
      const { permissions: userPermissions } = get();
      return permissions.some((perm) => userPermissions.includes(perm));
    },
    hasRole: (role) => {
      const { user } = get();
      return user?.role?.name_en === role;
    },
    checkSession: () => {
      return checkSessionExpiration();
    },
    clearPasswordChangeFlag: () => {
      const { user } = get();
      if (user) {
        console.log("clearPasswordChangeFlag - updating user data");
        // Update user data to remove the flag
        const updatedUser = { ...user, force_password_change: false };
        localStorage.setItem("auth_user", JSON.stringify(updatedUser));
        set({ user: updatedUser, needsPasswordChange: false });
      }
    },
    checkPasswordChangeFlag: () => {
      const { user } = get();
      if (user) {
        // Handle both boolean and string values from backend
        const hasFlag = user.force_password_change === true || String(user.force_password_change) === "1";
        console.log("checkPasswordChangeFlag - user:", user.id, "hasFlag:", hasFlag);
        set({ needsPasswordChange: hasFlag });
        return hasFlag;
      }
      return false;
    },
  };
});

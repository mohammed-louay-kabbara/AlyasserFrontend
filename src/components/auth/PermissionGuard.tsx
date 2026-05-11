import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Permission } from '../../types';

interface PermissionGuardProps {
  children: React.ReactNode;
  permissions?: Permission | Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permissions,
  requireAll = false,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (!permissions) {
    return <>{children}</>;
  }

  const permissionArray = Array.isArray(permissions) ? permissions : [permissions];

  if (requireAll) {
    const hasAllPermissions = permissionArray.every(permission => hasPermission(permission));
    return hasAllPermissions ? <>{children}</> : <>{fallback}</>;
  } else {
    const hasAnyRequiredPermission = hasAnyPermission(permissionArray);
    return hasAnyRequiredPermission ? <>{children}</> : <>{fallback}</>;
  }
};

export default PermissionGuard;

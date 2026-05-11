import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Permission } from '../../types';

interface CanAccessProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  role?: string;
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export const CanAccess: React.FC<CanAccessProps> = ({
  children,
  permission,
  permissions,
  role,
  requireAll = false,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasRole, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // Check role first if specified
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  // Check permissions
  if (permission) {
    return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
  }

  if (permissions && permissions.length > 0) {
    if (requireAll) {
      const hasAllPermissions = permissions.every(perm => hasPermission(perm));
      return hasAllPermissions ? <>{children}</> : <>{fallback}</>;
    } else {
      const hasAnyRequiredPermission = hasAnyPermission(permissions);
      return hasAnyRequiredPermission ? <>{children}</> : <>{fallback}</>;
    }
  }

  // If no permissions or role specified, render children
  return <>{children}</>;
};

export default CanAccess;

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock } from "lucide-react";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showMessage?: boolean;
}

export function RoleGuard({ allowedRoles, children, fallback, showMessage = true }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return fallback || (showMessage ? (
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          Необходимо войти в систему для доступа к этому разделу.
        </AlertDescription>
      </Alert>
    ) : null);
  }

  if (!allowedRoles.includes(user.role)) {
    return fallback || (showMessage ? (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          У вас недостаточно прав для доступа к этому разделу. 
          Текущая роль: {getRoleDisplayName(user.role)}. 
          Обратитесь к администратору для получения дополнительных прав.
        </AlertDescription>
      </Alert>
    ) : null);
  }

  return <>{children}</>;
}

// Компонент для скрытия элементов интерфейса на основе ролей
interface RoleBasedProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export function RoleBased({ allowedRoles, children }: RoleBasedProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

// Хук для проверки прав доступа
export function usePermissions() {
  const { user } = useAuth();

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]) => {
    return user && roles.includes(user.role);
  };

  const canView = () => {
    return hasAnyRole(['admin', 'operator', 'engineer', 'viewer']);
  };

  const canEdit = () => {
    return hasAnyRole(['admin', 'operator', 'engineer']);
  };

  const canCreate = () => {
    return hasAnyRole(['admin', 'operator', 'engineer']);
  };

  const canDelete = () => {
    return hasAnyRole(['admin', 'operator']);
  };

  const canManageUsers = () => {
    return hasRole('admin');
  };

  const canManageSystem = () => {
    return hasRole('admin');
  };

  return {
    hasRole,
    hasAnyRole,
    canView,
    canEdit,
    canCreate,
    canDelete,
    canManageUsers,
    canManageSystem,
    currentRole: user?.role || 'guest'
  };
}

export function getRoleDisplayName(role: string): string {
  switch (role) {
    case 'admin':
      return 'Администратор';
    case 'operator':
      return 'Оператор';
    case 'engineer':
      return 'Инженер';
    case 'viewer':
      return 'Просмотр';
    default:
      return 'Неизвестная роль';
  }
}

export function getRoleDescription(role: string): string {
  switch (role) {
    case 'admin':
      return 'Полный доступ ко всем функциям системы';
    case 'operator':
      return 'Может выполнять осмотры, создавать отчеты, управлять оборудованием';
    case 'engineer':
      return 'Может просматривать данные, выполнять ежедневные осмотры';
    case 'viewer':
      return 'Только просмотр данных без возможности изменений';
    default:
      return 'Описание роли недоступно';
  }
}
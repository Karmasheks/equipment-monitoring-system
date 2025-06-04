import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './use-auth';

interface UserWithStatus {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  position: string;
  avatar?: string;
  status: string;
  lastSeen: string;
}

interface UserStatusContextType {
  users: UserWithStatus[];
  updateUserStatus: (userId: number, status: string) => void;
  getCurrentUserStatus: () => string;
  setCurrentUserStatus: (status: string) => void;
}

const UserStatusContext = createContext<UserStatusContextType | undefined>(undefined);

export function UserStatusProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentUserStatus, setCurrentUserStatus] = useState<string>('online');

  // Загружаем пользователей из API
  const { data: apiUsers = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  // Преобразуем данные API в формат с локальными статусами
  const [users, setUsers] = useState<UserWithStatus[]>([]);

  useEffect(() => {
    if (apiUsers.length > 0) {
      const usersWithStatus = apiUsers.map((apiUser: any) => ({
        ...apiUser,
        status: 'online', // По умолчанию онлайн
        lastSeen: new Date().toISOString(),
        department: apiUser.department || 'Производство',
        position: apiUser.position || 'Оператор',
      }));
      setUsers(usersWithStatus);
    }
  }, [apiUsers]);

  // Обновляем статус текущего пользователя в списке при изменении
  useEffect(() => {
    if (user) {
      setUsers(prev => prev.map(u => 
        u.id === user.id 
          ? { ...u, status: currentUserStatus, lastSeen: new Date().toISOString() }
          : u
      ));
    }
  }, [currentUserStatus, user]);

  const updateUserStatus = (userId: number, status: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status, lastSeen: new Date().toISOString() }
        : user
    ));
  };

  const getCurrentUserStatus = () => currentUserStatus;

  const handleSetCurrentUserStatus = (status: string) => {
    setCurrentUserStatus(status);
  };

  return (
    <UserStatusContext.Provider value={{
      users,
      updateUserStatus,
      getCurrentUserStatus,
      setCurrentUserStatus: handleSetCurrentUserStatus
    }}>
      {children}
    </UserStatusContext.Provider>
  );
}

export function useUserStatus() {
  const context = useContext(UserStatusContext);
  if (context === undefined) {
    throw new Error('useUserStatus must be used within a UserStatusProvider');
  }
  return context;
}
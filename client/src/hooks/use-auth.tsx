import { createContext, useContext, useEffect, useState } from "react";
import { getToken, logout } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: async () => {},
  isAuthenticated: () => false,
  refreshAuth: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [token, setToken] = useState<string | null>(getToken());

  const { 
    data: user, 
    isLoading: isLoadingUser,
    refetch,
    error
  } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  // Убираем все автоматические проверки - только при изменении storage
  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = getToken();
      if (newToken !== token) {
        setToken(newToken);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [token]);

  // Handle authentication errors
  useEffect(() => {
    if (error && token) {
      // Если ошибка аутентификации, очищаем токен
      localStorage.removeItem('token');
      setToken(null);
      window.location.href = '/login';
    }
  }, [error, token]);

  // Initial auth check on page load
  useEffect(() => {
    if (token) {
      refetch();
    }
    setIsInitializing(false);
  }, [token, refetch]);

  const isLoading = isInitializing || isLoadingUser;

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const checkIsAuthenticated = () => {
    return !!token && !!user;
  };

  const refreshAuth = () => {
    const newToken = getToken();
    setToken(newToken);
    if (newToken) {
      refetch();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        logout: handleLogout,
        isAuthenticated: checkIsAuthenticated,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

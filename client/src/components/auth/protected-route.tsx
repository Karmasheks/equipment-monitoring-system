import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { getToken } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const token = getToken();

  useEffect(() => {
    // Простая проверка - есть токен или нет
    if (!token) {
      setLocation("/login");
    }
  }, [token, setLocation]);

  // Если нет токена, перенаправляем
  if (!token) {
    return null;
  }

  // Показываем загрузку только при первоначальной загрузке пользователя
  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Рендерим контент если есть токен
  return <>{children}</>;
}
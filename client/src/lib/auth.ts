import { apiRequest } from "./queryClient";
import { User } from "@shared/schema";

export interface AuthResponse {
  user: User;
  token: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    // Делаем прямой fetch запрос без apiRequest для обработки ошибок входа
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Неверные учетные данные");
    }
    
    if (!data.token || !data.user) {
      throw new Error("Получен неполный ответ от сервера");
    }
    
    // Store token in localStorage
    localStorage.setItem("token", data.token);
    
    return data;
  } catch (error: any) {
    throw new Error(error.message || "Ошибка входа в систему");
  }
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/register", { name, email, password, role: "user" });
  const data = await response.json();
  
  // Store token in localStorage
  localStorage.setItem("token", data.token);
  
  return data;
}

export async function logout(): Promise<void> {
  // Remove token from localStorage
  localStorage.removeItem("token");
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function isAuthenticated(): boolean {
  const token = getToken();
  return !!token;
}

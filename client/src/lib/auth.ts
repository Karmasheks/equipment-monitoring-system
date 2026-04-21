import { apiRequest } from "./queryClient";
import { User } from "@shared/schema";

export interface AuthResponse {
  user: User;
  token: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
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

    localStorage.setItem("token", data.token);

    return data;
  } catch (error: any) {
    throw new Error(error.message || "Ошибка входа в систему");
  }
}

export async function register(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
  position?: string
): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/register", {
    name,
    email,
    password,
    confirmPassword,
    position,
  });

  const data = await response.json();
  localStorage.setItem("token", data.token);

  return data;
}

export async function logout(): Promise<void> {
  localStorage.removeItem("token");
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function isAuthenticated(): boolean {
  const token = getToken();
  return !!token;
}
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, UserPlus, User, BarChart2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    position: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);



  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Введите полное имя";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Имя должно содержать минимум 2 символа";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Введите email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Введите корректный email";
    }

    if (!formData.password) {
      newErrors.password = "Введите пароль";
    } else if (formData.password.length < 6) {
      newErrors.password = "Пароль должен содержать минимум 6 символов";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Подтвердите пароль";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          position: formData.position
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ошибка регистрации");
      }

      toast({
        title: "Регистрация успешна!",
        description: "Ваш аккаунт создан с правами просмотра. Обратитесь к администратору для получения дополнительных прав.",
      });

      // Автоматический вход после регистрации
      localStorage.setItem("token", data.token);
      setLocation("/dashboard");

    } catch (error: any) {
      toast({
        title: "Ошибка регистрации",
        description: error.message || "Произошла ошибка при создании аккаунта",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
      <Helmet>
        <title>Регистрация | StarLine</title>
        <meta name="description" content="Создайте новый аккаунт в системе мониторинга оборудования StarLine" />
      </Helmet>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-md bg-primary-600 flex items-center justify-center">
            <BarChart2 className="text-white text-lg" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">StarLine</h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Создайте аккаунт для доступа к системе мониторинга оборудования
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Регистрация
            </CardTitle>
            <CardDescription>
              Новые пользователи получают права просмотра. Для расширения прав обратитесь к администратору.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Основная информация */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Полное имя *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Иванов Иван Иванович"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="ivan@company.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Должность</Label>
                  <Input
                    id="position"
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                    placeholder="Инженер"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Пароль *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Минимум 6 символов"
                      className={errors.password ? "border-red-500" : ""}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Подтверждение пароля *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="Повторите пароль"
                      className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  Новые пользователи автоматически получают права просмотра. Для получения дополнительных прав (редактирование, создание отчетов) обратитесь к администратору системы.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Создание аккаунта..." : "Создать аккаунт"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Уже есть аккаунт?{" "}
                  <Link href="/login">
                    <a className="font-medium text-primary-600 hover:text-primary-500">
                      Войти
                    </a>
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

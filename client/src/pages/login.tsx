import { Helmet } from "react-helmet";
import { LoginForm } from "@/components/auth/login-form";
import { BarChart2 } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
      <Helmet>
        <title>Вход - StarLine</title>
        <meta name="description" content="Войдите в свой аккаунт StarLine для доступа к системе мониторинга оборудования." />
      </Helmet>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-md bg-primary-600 flex items-center justify-center">
            <BarChart2 className="text-white text-lg" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">StarLine</h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Мониторинг оборудования предприятия
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}

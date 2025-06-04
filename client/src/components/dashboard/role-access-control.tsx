import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, XCircle, Edit, PlusCircle } from "lucide-react";

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

export function RoleAccessControl() {
  const { data: roles } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  // Mock roles if API data not available yet
  const mockRoles = [
    {
      id: 1,
      name: "Администратор",
      description: "Полный доступ ко всем функциям",
      permissions: ["dashboard", "tasks", "team", "reports", "settings"],
    },
    {
      id: 2,
      name: "Маркетинг-менеджер",
      description: "Может управлять кампаниями и просматривать отчеты",
      permissions: ["dashboard", "tasks", "team", "reports"],
    },
    {
      id: 3,
      name: "Контент-создатель",
      description: "Создает и редактирует контент для кампаний",
      permissions: ["dashboard", "tasks"],
    },
  ];

  const displayRoles = roles || mockRoles;
  const allPermissions = ["dashboard", "tasks", "team", "reports", "settings"];

  return (
    <Card className="mb-6">
      <CardHeader className="p-5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Управление доступом на основе ролей</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
              <Edit className="w-4 h-4 mr-1.5" />
              Редактировать роли
            </Button>
            <Button variant="outline" className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center dark:bg-primary-900/30 dark:hover:bg-primary-900/50 dark:text-primary-300 dark:border-primary-800">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Добавить роль
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:bg-gray-800 dark:text-gray-400">Роль</th>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:bg-gray-800 dark:text-gray-400">Описание</th>
                {allPermissions.map((permission) => (
                  <th key={permission} className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:bg-gray-800 dark:text-gray-400">
                    {permission === "dashboard" ? "Панель" : 
                     permission === "tasks" ? "Задачи" : 
                     permission === "team" ? "Команда" : 
                     permission === "reports" ? "Отчеты" : 
                     permission === "settings" ? "Настройки" : 
                     permission}
                  </th>
                ))}
                <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {displayRoles.map((role) => (
                <tr key={role.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">{role.name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{role.description}</td>
                  {allPermissions.map((permission) => (
                    <td key={permission} className="px-4 py-3 text-sm text-center">
                      {role.permissions.includes(permission) ? (
                        <CheckCircle className="mx-auto text-success-500 dark:text-success-400 w-5 h-5" />
                      ) : (
                        <XCircle className="mx-auto text-gray-300 dark:text-gray-600 w-5 h-5" />
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right text-sm">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                      </svg>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

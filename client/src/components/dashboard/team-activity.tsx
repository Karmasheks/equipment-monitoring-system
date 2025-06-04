import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

interface TeamMember {
  id: number;
  name: string;
  avatar: string;
}

interface Activity {
  id: number;
  userId: number;
  action: string;
  timestamp: string;
  user?: TeamMember;
}

export function TeamActivity() {
  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  // Generate initial for avatar display
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Get background color based on initials
  const getAvatarColor = (initials: string) => {
    const colors = {
      JD: "bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300",
      MS: "bg-secondary-100 text-secondary-500 dark:bg-secondary-900 dark:text-secondary-300",
      AR: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300",
      AM: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
    };
    return initials in colors 
      ? colors[initials as keyof typeof colors] 
      : "bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300";
  };

  // Mock data in case API isn't available yet
  const mockActivities = [
    {
      id: 1,
      user: { id: 1, name: "Елена Иванова", avatar: "ЕИ" },
      action: "Завершила настройку кампании \"Летняя акция\"",
      timestamp: "2023-08-30T12:30:00Z",
    },
    {
      id: 2,
      user: { id: 2, name: "Максим Петров", avatar: "МП" },
      action: "Добавил 3 новые задачи в кампанию \"Квартальная рассылка\"",
      timestamp: "2023-08-30T10:15:00Z",
    },
    {
      id: 3,
      user: { id: 3, name: "Анна Смирнова", avatar: "АС" },
      action: "Обновила стратегию социальных медиа",
      timestamp: "2023-08-29T15:45:00Z",
    },
    {
      id: 4,
      user: { id: 4, name: "Алексей Морозов", avatar: "АМ" },
      action: "Создал новый отчет о производительности за 3 квартал",
      timestamp: "2023-08-29T09:12:00Z",
    },
    {
      id: 5,
      user: { id: 1, name: "Елена Иванова", avatar: "ЕИ" },
      action: "Завершила 12 задач в кампании \"Запуск продукта\"",
      timestamp: "2023-08-28T14:20:00Z",
    },
  ];

  const displayActivities = activities || mockActivities;

  return (
    <Card>
      <CardHeader className="p-5 border-b border-gray-200 flex justify-between items-center dark:border-gray-700">
        <CardTitle className="font-semibold text-gray-800 dark:text-white">Активность команды</CardTitle>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
          </svg>
        </Button>
      </CardHeader>
      <div className="p-2 max-h-96 overflow-y-auto">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {displayActivities.map((activity) => (
            <li key={activity.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-9 h-9 rounded-full ${getAvatarColor(activity.user?.avatar || getInitials(activity.user?.name || ""))} flex items-center justify-center font-medium`}>
                    {activity.user?.avatar || getInitials(activity.user?.name || "")}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{activity.user?.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{activity.action}</div>
                  <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="p-3 text-center">
          <Button variant="link" className="text-sm text-primary-600 font-medium hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
            Просмотреть всю активность
          </Button>
        </div>
      </div>
    </Card>
  );
}

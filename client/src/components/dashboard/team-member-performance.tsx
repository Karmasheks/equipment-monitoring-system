import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Download, Filter } from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
  metrics: {
    tasksCompleted: number;
    tasksTotal: number;
    onTimeRate: number;
    productivityScore: number;
  };
}

export function TeamMemberPerformance() {
  const { data: teamMembers } = useQuery<TeamMember[]>({
    queryKey: ["/api/users"],
  });

  const getRatingLabel = (score: number) => {
    if (score >= 85) return { label: "Высокий", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" };
    if (score >= 70) return { label: "Средний", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" };
    return { label: "Низкий", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" };
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return "bg-success-500 dark:bg-success-600";
    if (score >= 70) return "bg-yellow-500 dark:bg-yellow-600";
    return "bg-red-500 dark:bg-red-600";
  };

  // Use mock data if API data not available yet
  const mockTeamMembers = [
    {
      id: 1,
      name: "Jane Doe",
      email: "jane.doe@example.com",
      role: "Marketing Manager",
      avatar: "JD",
      metrics: {
        tasksCompleted: 24,
        tasksTotal: 30,
        onTimeRate: 92,
        productivityScore: 90,
      },
    },
    {
      id: 2,
      name: "Mike Smith",
      email: "mike.smith@example.com",
      role: "Content Creator",
      avatar: "MS",
      metrics: {
        tasksCompleted: 18,
        tasksTotal: 25,
        onTimeRate: 78,
        productivityScore: 72,
      },
    },
    {
      id: 3,
      name: "Anna Roberts",
      email: "anna.roberts@example.com",
      role: "Social Media Specialist",
      avatar: "AR",
      metrics: {
        tasksCompleted: 32,
        tasksTotal: 35,
        onTimeRate: 94,
        productivityScore: 95,
      },
    },
  ];

  const displayTeamMembers = teamMembers || mockTeamMembers;

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="p-5 border-b border-gray-200 flex justify-between items-center dark:border-gray-700">
        <CardTitle className="font-semibold text-gray-800 dark:text-white">Эффективность сотрудников</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 p-1 dark:text-gray-400 dark:hover:text-gray-300">
            <Download className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 p-1 dark:text-gray-400 dark:hover:text-gray-300">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:bg-gray-800 dark:text-gray-400">Сотрудник</th>
              <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:bg-gray-800 dark:text-gray-400">Роль</th>
              <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:bg-gray-800 dark:text-gray-400">Выполнено задач</th>
              <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:bg-gray-800 dark:text-gray-400">Своевременность</th>
              <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:bg-gray-800 dark:text-gray-400">Продуктивность</th>
              <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {displayTeamMembers.map((member) => {
              const rating = getRatingLabel(member.metrics.onTimeRate);
              const progressColor = getProgressColor(member.metrics.productivityScore);
              
              return (
                <tr key={member.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium dark:bg-primary-900 dark:text-primary-300">
                        {member.avatar}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{member.role}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{member.metrics.tasksCompleted}/{member.metrics.tasksTotal}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900 mr-2 dark:text-white">{member.metrics.onTimeRate}%</div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${rating.className}`}>
                        {rating.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="w-24 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                      <div 
                        className={`${progressColor} h-1.5 rounded-full`} 
                        style={{ width: `${member.metrics.productivityScore}%` }}
                      ></div>
                    </div>
                    <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">{member.metrics.productivityScore}/100</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/team/${member.id}`}>
                      <a className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">View</a>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700">
        <Button variant="link" className="text-sm text-primary-600 font-medium hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
          Просмотреть всех сотрудников
        </Button>
      </div>
    </Card>
  );
}

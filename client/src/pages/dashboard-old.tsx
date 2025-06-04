import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TeamPerformanceChart } from "@/components/dashboard/team-performance-chart";
import { CampaignPerformance } from "@/components/dashboard/campaign-performance";
import { TeamActivity } from "@/components/dashboard/team-activity";
import { TeamMemberPerformance } from "@/components/dashboard/team-member-performance";

import { useQuery } from "@tanstack/react-query";
import { Briefcase, CheckSquare, TrendingUp, Users } from "lucide-react";

interface DashboardData {
  performanceData: {
    campaigns: number;
    campaignsChange: number;
    openTasks: number;
    openTasksChange: number;
    conversionRate: number;
    conversionRateChange: number;
    teamProductivity: number;
    teamProductivityChange: number;
    teamMembers: any[];
  };
}

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: dashboardData } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated()) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const metrics = [
    {
      title: "Всего оборудования",
      value: dashboardData?.performanceData.campaigns || 42,
      change: dashboardData?.performanceData.campaignsChange || 3,
      icon: "equipment",
    },
    {
      title: "Выполнено ТО",
      value: dashboardData?.performanceData.openTasks || 28,
      change: dashboardData?.performanceData.openTasksChange || 5,
      icon: "completed",
    },
    {
      title: "Просрочено ТО",
      value: dashboardData?.performanceData.conversionRate || 3,
      change: (dashboardData?.performanceData.conversionRateChange || 0) * -1 || -1,
      icon: "overdue",
    },
    {
      title: "Текущие ремонты",
      value: dashboardData?.performanceData.teamProductivity || 5,
      change: dashboardData?.performanceData.teamProductivityChange || 0,
      icon: "repairs",
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Главная панель - Победит 4</title>
        <meta name="description" content="Система мониторинга технического обслуживания оборудования, отображающая статус оборудования, плановые ТО и текущие ремонтные работы." />
      </Helmet>
      
      <Sidebar />
      <MobileSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6 dark:bg-gray-900">
          <div className="fade-in">
            {/* Performance metrics grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {metrics.map((metric, index) => (
                <MetricCard 
                  key={index}
                  title={metric.title}
                  value={metric.value}
                  change={metric.change}
                  icon={metric.icon}
                />
              ))}
            </div>
            
            {/* Оборудование и График ТО */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Список оборудования */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Оборудование</h2>
                  <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Добавить
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Название</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Тип</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Статус</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Последнее ТО</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">E001</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Станок фрезерный ВМ-127М</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Фрезерный</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                            Рабочий
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">15.04.2025</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">Просмотр</button>
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">ТО</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">E002</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Токарный станок ТВ-320</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Токарный</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                            Требует ТО
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">10.03.2025</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">Просмотр</button>
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">ТО</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">E003</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Сварочный аппарат ТИГ-200</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Сварочный</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                            В ремонте
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">05.05.2025</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">Просмотр</button>
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">ТО</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Календарь ТО */}
              <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">График ТО</h2>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Май 2025</h3>
                    <div className="flex space-x-2">
                      <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    <div className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">Пн</div>
                    <div className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">Вт</div>
                    <div className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">Ср</div>
                    <div className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">Чт</div>
                    <div className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">Пт</div>
                    <div className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">Сб</div>
                    <div className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">Вс</div>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    <div className="text-center py-2 text-sm text-gray-400 dark:text-gray-600">28</div>
                    <div className="text-center py-2 text-sm text-gray-400 dark:text-gray-600">29</div>
                    <div className="text-center py-2 text-sm text-gray-400 dark:text-gray-600">30</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">1</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">2</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">3</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">4</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 rounded">5</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">6</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">7</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">8</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">9</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">10</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">11</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">12</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">13</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">14</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-900/20 rounded">15</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">16</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">17</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">18</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">19</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 rounded font-medium">20</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">21</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">22</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">23</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">24</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">25</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">26</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">27</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">28</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">29</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">30</div>
                    <div className="text-center py-2 text-sm text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/20 rounded">31</div>
                    <div className="text-center py-2 text-sm text-gray-400 dark:text-gray-600">1</div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-800 mr-2"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Плановое ТО</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-800 mr-2"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Ремонт</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-800 mr-2"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Завершено</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-800 mr-2"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Просрочено</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Активность пользователей и Журнал событий */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Активность пользователей */}
              <TeamActivity />
              
              {/* Ближайшее техническое обслуживание */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Ближайшее техническое обслуживание</h2>
                  <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline text-sm">
                    Смотреть все
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Оборудование</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Тип ТО</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Дата</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Ответственный</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Статус</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Станок фрезерный ВМ-127М</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Ежемесячное</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">20.05.2025</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Иванов И.И.</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                            Запланировано
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Подробнее</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Токарный станок ТВ-320</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Ежемесячное</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">31.05.2025</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Петров П.П.</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                            Просрочено
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Подробнее</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Сварочный аппарат ТИГ-200</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Ремонт</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">15.05.2025</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Сидоров С.С.</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                            В процессе
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Подробнее</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

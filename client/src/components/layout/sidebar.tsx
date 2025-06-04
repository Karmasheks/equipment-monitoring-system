import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserStatus } from "@/hooks/use-user-status";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { UserStatusSelector, getStatusBadge } from "@/components/layout/user-status";
import { Button } from "@/components/ui/button";
import { BarChart2, Users, Calendar, Wrench, FileText, Settings, CheckSquare, Clipboard, ChartBar, ClipboardCheck, CheckCircle } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { users, getCurrentUserStatus, setCurrentUserStatus } = useUserStatus();
  const { isCollapsed, toggleCollapsed } = useSidebarState();



  const navigation = [
    {
      section: "Основное",
      items: [
        {
          name: "Панель управления",
          href: "/dashboard",
          icon: <BarChart2 className="w-5 h-5" />,
          active: location === "/dashboard" || location === "/",
        },
        {
          name: "График ТО",
          href: "/schedule",
          icon: <Calendar className="w-5 h-5" />,
          active: location === "/schedule",
        },
        {
          name: "Оборудование",
          href: "/equipment",
          icon: <Wrench className="w-5 h-5" />,
          active: location === "/equipment",
        },
        {
          name: "Ежедневные осмотры",
          href: "/daily-inspection",
          icon: <ClipboardCheck className="w-5 h-5" />,
          active: location === "/daily-inspection",
        },
        {
          name: "Техническое обслуживание",
          href: "/maintenance",
          icon: <Clipboard className="w-5 h-5" />,
          active: location === "/maintenance",
        },
        {
          name: "Задачи",
          href: "/tasks",
          icon: <CheckSquare className="w-5 h-5" />,
          active: location === "/tasks",
        }
      ]
    },
    {
      section: "Администрирование",
      items: [
        {
          name: "Пользователи",
          href: "/users",
          icon: <Users className="w-5 h-5" />,
          active: location === "/users",
        },
        {
          name: "Отчеты",
          href: "/reports",
          icon: <ChartBar className="w-5 h-5" />,
          active: location === "/reports",
        }
      ]
    }
  ];

  // Получаем только пользователей со статусом "на работе" для отображения в боковой панели
  const workingUsers = users.filter(user => user.status === 'working');
  const displayUsers = workingUsers.slice(0, 5);

  return (
    <aside className={`sidebar fixed left-0 top-0 z-40 hidden lg:flex flex-col h-full bg-gray-900 border-r border-gray-700 shadow-sm transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center">
              <BarChart2 className="text-white text-sm" />
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-white">StarLine</h1>
                <p className="text-sm text-gray-400">Победит 4</p>
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleCollapsed}
            className="text-gray-400 hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      </div>
      
      <nav className="flex-grow overflow-y-auto p-4">
        {navigation.map((section, idx) => (
          <div key={`section-${idx}`} className="mb-6">
            {!isCollapsed && (
              <p className="uppercase text-xs font-semibold text-white mb-2">{section.section}</p>
            )}
            <ul className="space-y-2">
              {section.items.map((item, itemIdx) => (
                <li key={`item-${idx}-${itemIdx}`}>
                  <Link href={item.href}>
                    <div className={`flex items-center px-4 py-3 rounded-md font-medium cursor-pointer
                      ${item.active 
                        ? "text-white bg-blue-900/20"
                        : "text-gray-300 hover:bg-gray-700/50 hover:text-white"}`}>
                      {item.icon}
                      {!isCollapsed && (
                        <>
                          <span className="ml-3">{item.name}</span>
                          {item.badge && item.badge > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {isCollapsed && item.badge && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        
        {!isCollapsed && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
              Сотрудники на работе
              <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded-full">
                {workingUsers.length}
              </span>
            </h3>
            <ul className="mt-3 space-y-2">
              {displayUsers.length > 0 ? (
                displayUsers.map((member) => (
                  <li key={member.id}>
                    <div className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md">
                      <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-white">
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {member.name.split(' ')[1]} {member.name.split(' ')[2]?.[0]}.
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(member.status, true)}
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  Нет сотрудников на работе
                </li>
              )}
            </ul>
          </div>
        )}
        
        {isCollapsed && displayUsers.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center space-y-2 px-2">
              {displayUsers.slice(0, 3).map((member) => (
                <div 
                  key={member.id}
                  className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium"
                  title={member.name}
                >
                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              ))}
              {workingUsers.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 flex items-center justify-center text-xs font-bold">
                  +{workingUsers.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      
      {/* User profile with status */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {!isCollapsed ? (
          <UserStatusSelector
            currentStatus={getCurrentUserStatus()}
            onStatusChange={setCurrentUserStatus}
            userName={user?.name || "Алекс Морган"}
          />
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center relative">
              <span className="text-xs font-medium text-white">
                {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || "АМ"}
              </span>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${
                getCurrentUserStatus() === 'working' ? 'bg-blue-500' :
                getCurrentUserStatus() === 'online' ? 'bg-green-500' :
                getCurrentUserStatus() === 'break' ? 'bg-yellow-500' :
                getCurrentUserStatus() === 'vacation' ? 'bg-purple-500' :
                getCurrentUserStatus() === 'busy' ? 'bg-orange-500' :
                'bg-red-500'
              }`}></div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

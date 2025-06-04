import React from "react";
import { Link, useLocation } from "wouter";
import { useMobileSidebar } from "@/hooks/use-mobile-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useUserStatus } from "@/hooks/use-user-status";
import { UserStatusSelector } from "@/components/layout/user-status";
import { BarChart2, Users, ChartBar, Wrench, Clipboard, Calendar, X, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileSidebar() {
  const { open, setOpen } = useMobileSidebar();
  const [location] = useLocation();
  const { user } = useAuth();
  const { getCurrentUserStatus, setCurrentUserStatus } = useUserStatus();

  const navigation = [
    {
      section: "Основное",
      items: [
        {
          name: "Панель управления",
          href: "/dashboard",
          icon: <BarChart2 className="h-6 w-6" />,
          active: location === "/dashboard" || location === "/",
        },
        {
          name: "График ТО",
          href: "/schedule",
          icon: <Calendar className="h-6 w-6" />,
          active: location === "/schedule",
          badge: 3
        },
        {
          name: "Оборудование",
          href: "/equipment",
          icon: <Wrench className="h-6 w-6" />,
          active: location === "/equipment",
        },
        {
          name: "Ежедневные осмотры",
          href: "/daily-inspection",
          icon: <ClipboardCheck className="h-6 w-6" />,
          active: location === "/daily-inspection",
        },
        {
          name: "Техническое обслуживание",
          href: "/maintenance",
          icon: <Clipboard className="h-6 w-6" />,
          active: location === "/maintenance",
        }
      ]
    },
    {
      section: "Администрирование",
      items: [
        {
          name: "Пользователи",
          href: "/users",
          icon: <Users className="h-6 w-6" />,
          active: location === "/users",
        },
        {
          name: "Отчеты",
          href: "/reports",
          icon: <ChartBar className="h-6 w-6" />,
          active: location === "/reports",
        }
      ]
    }
  ];

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 flex z-40 lg:hidden"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80" 
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />
      
      {/* Sidebar */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <Button
            variant="ghost"
            size="icon"
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6 text-white" />
          </Button>
        </div>
        
        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div className="flex-shrink-0 flex items-center px-4">
            <div className="w-8 h-8 rounded-md bg-primary-600 flex items-center justify-center">
              <BarChart2 className="text-white text-sm" />
            </div>
            <h1 className="ml-3 text-xl font-semibold text-gray-800 dark:text-white">Победит 4</h1>
          </div>
          <nav className="mt-5 px-2">
            {navigation.map((section, idx) => (
              <div key={`mobile-section-${idx}`} className="mb-4">
                <p className="uppercase text-xs font-semibold text-gray-500 px-2 mb-2 dark:text-gray-400">{section.section}</p>
                <div className="space-y-1">
                  {section.items.map((item, itemIdx) => (
                    <Link key={`mobile-item-${idx}-${itemIdx}`} href={item.href}>
                      <a 
                        className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                          item.active 
                            ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400" 
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700/50"
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                        {item.badge && (
                          <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
        
        <div className="flex-shrink-0 border-t border-gray-200 p-4 dark:border-gray-700">
          <UserStatusSelector
            currentStatus={getCurrentUserStatus()}
            onStatusChange={setCurrentUserStatus}
            userName={user?.name || "Алекс Морган"}
          />
        </div>
      </div>
      <div className="flex-shrink-0 w-14" aria-hidden="true">
        {/* Spacer */}
      </div>
    </div>
  );
}
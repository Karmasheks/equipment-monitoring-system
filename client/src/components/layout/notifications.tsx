import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Wrench, AlertTriangle, FileText, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useEquipmentData } from '@/hooks/use-equipment-data';
import { useRemarksData } from '@/hooks/use-remarks-data';
import { useMaintenanceData } from '@/hooks/use-maintenance-data';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

interface Notification {
  id: string;
  type: 'maintenance' | 'remark' | 'task' | 'warning' | 'info';
  title: string;
  description: string;
  link?: string;
  equipmentId?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
}

export function NotificationsDropdown() {
  const { equipment } = useEquipmentData();
  const { remarks } = useRemarksData();
  const { maintenanceRecords, refreshData } = useMaintenanceData();
  const [refreshKey, setRefreshKey] = useState(0);

  // Загрузка задач
  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks']
  });

  // Слушаем события изменения данных ТО и замечаний
  useEffect(() => {
    const handleDataChange = () => {
      refreshData();
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('maintenanceDataChanged', handleDataChange);
    window.addEventListener('remarksUpdated', handleDataChange);
    window.addEventListener('remarkStatusChanged', handleDataChange);
    
    return () => {
      window.removeEventListener('maintenanceDataChanged', handleDataChange);
      window.removeEventListener('remarksUpdated', handleDataChange);
      window.removeEventListener('remarkStatusChanged', handleDataChange);
    };
  }, [refreshData]);

  const generateNotifications = (): Notification[] => {
    const notifications: Notification[] = [];
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Уведомления о запланированных ТО из записей обслуживания
    maintenanceRecords.forEach(record => {
      if (record.status !== 'scheduled') return;
      
      const scheduledDate = new Date(record.scheduledDate);
      const daysUntil = Math.ceil((scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Проверяем, что оборудование существует в системе
      const equipmentItem = equipment.find(eq => eq.id === record.equipmentId);
      if (!equipmentItem) return; // Пропускаем записи для несуществующего оборудования
      
      const equipmentName = equipmentItem.name;
      
      if (scheduledDate <= nextWeek && scheduledDate >= today) {
        notifications.push({
          id: `maintenance-${record.id}`,
          type: 'maintenance',
          title: 'Требуется ТО',
          description: `${equipmentName} - ${record.maintenanceType} через ${daysUntil} дн.`,
          link: '/maintenance',
          equipmentId: record.equipmentId,
          priority: daysUntil <= 3 ? 'high' : 'medium',
          createdAt: today
        });
      } else if (scheduledDate < today) {
        notifications.push({
          id: `maintenance-overdue-${record.id}`,
          type: 'warning',
          title: 'Просрочено ТО',
          description: `${equipmentName} - ${record.maintenanceType} просрочено на ${Math.abs(daysUntil)} дн.`,
          link: '/maintenance',
          equipmentId: record.equipmentId,
          priority: 'high',
          createdAt: today
        });
      }
    });

    // Уведомления о замечаниях (только открытые и в работе)
    remarks.forEach(remark => {
      if (remark.status === 'open' || remark.status === 'in_progress') {
        const priority = remark.priority === 'critical' ? 'high' : 
                        remark.priority === 'high' ? 'medium' : 'low';
        
        notifications.push({
          id: `remark-${remark.id}`,
          type: 'remark',
          title: remark.status === 'in_progress' ? 'Замечание в работе' : 'Открытое замечание',
          description: `${remark.equipmentName} - ${remark.description.substring(0, 50)}...`,
          link: '/tasks',
          equipmentId: remark.equipmentId,
          priority,
          createdAt: new Date(remark.createdAt)
        });
      }
    });

    // Уведомления о задачах (только ожидающие и в работе)
    tasks.forEach((task: any) => {
      if (task.status === 'pending' || task.status === 'in_progress') {
        const priority = task.priority === 'critical' ? 'high' : 
                        task.priority === 'high' ? 'medium' : 'low';
        
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate && dueDate < today;
        const daysDue = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
        
        notifications.push({
          id: `task-${task.id}`,
          type: 'task',
          title: task.status === 'in_progress' ? 'Задача в работе' : isOverdue ? 'Просроченная задача' : 'Новая задача',
          description: daysDue !== null ? 
            (isOverdue ? `${task.title} - просрочена на ${Math.abs(daysDue)} дн.` : 
             daysDue <= 3 ? `${task.title} - до ${daysDue} дн.` : task.title) : 
            task.title,
          link: '/tasks',
          equipmentId: task.equipmentId,
          priority: isOverdue ? 'high' : priority,
          createdAt: new Date(task.createdAt)
        });
      }
    });

    // Оборудование требующее внимания (статус maintenance)
    equipment.forEach(item => {
      if (item.status === 'maintenance') {
        notifications.push({
          id: `equipment-maintenance-${item.id}`,
          type: 'warning',
          title: 'Оборудование на ТО',
          description: `${item.name} - находится на техобслуживании`,
          link: '/equipment',
          equipmentId: item.id,
          priority: 'medium',
          createdAt: today
        });
      } else if (item.status === 'inactive') {
        notifications.push({
          id: `equipment-inactive-${item.id}`,
          type: 'warning',
          title: 'Оборудование не активно',
          description: `${item.name} - требует проверки`,
          link: '/equipment',
          equipmentId: item.id,
          priority: 'high',
          createdAt: today
        });
      }
    });

    // Сортировка по приоритету и дате
    return notifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  };

  const notifications = generateNotifications();
  const highPriorityCount = notifications.filter(n => n.priority === 'high').length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'remark':
        return <FileText className="w-4 h-4 text-yellow-500" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Wrench className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-300 hover:text-white">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <Badge 
              variant={highPriorityCount > 0 ? "destructive" : "secondary"}
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {notifications.length > 99 ? '99+' : notifications.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Уведомления</span>
          {notifications.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {notifications.length}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Нет уведомлений</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="p-0">
              <Link 
                href={notification.link || '#'} 
                className="w-full p-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${getPriorityColor(notification.priority)}`}>
                      {notification.title}
                    </p>
                    <Badge 
                      variant={notification.priority === 'high' ? 'destructive' : 
                              notification.priority === 'medium' ? 'default' : 'secondary'} 
                      className="ml-2 text-xs"
                    >
                      {notification.priority === 'high' ? 'Срочно' : 
                       notification.priority === 'medium' ? 'Важно' : 'Обычное'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 truncate">
                    {notification.description}
                  </p>
                  {notification.equipmentId && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ID: {notification.equipmentId}
                    </p>
                  )}
                </div>
              </Link>
            </DropdownMenuItem>
          ))
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/maintenance" className="w-full text-center p-3 text-sm text-blue-600 dark:text-blue-400">
                Все уведомления →
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
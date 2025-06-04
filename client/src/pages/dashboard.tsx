import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRemarksData } from "@/hooks/use-remarks-data";
import { useMaintenanceData } from "@/hooks/use-maintenance-data";
import { useDailyInspections } from "@/hooks/use-daily-inspections";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useSidebarState } from "@/hooks/use-sidebar-state";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Settings, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Wrench,
  Eye,
  TrendingUp,
  Activity,
  BarChart3,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  // Загрузка оборудования из API
  const { data: equipment = [] } = useQuery({
    queryKey: ['/api/equipment'],
  });
  
  // Фильтруем только активное оборудование (исключаем выведенное из эксплуатации)
  const getActiveEquipment = () => equipment.filter((eq: any) => eq.status !== 'decommissioned');
  const { getOpenRemarksCount, getCriticalRemarksCount, remarks } = useRemarksData();
  const { maintenanceRecords, getMaintenanceByStatus, refreshData } = useMaintenanceData();
  const { getTodayStats, refetch: refetchInspections } = useDailyInspections();
  const { isCollapsed } = useSidebarState();
  const [, setLocation] = useLocation();

  // Загрузка статистики задач
  const { data: taskStats = { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 }, refetch: refetchTaskStats } = useQuery({
    queryKey: ["/api/tasks/stats"],
  });

  // Загрузка всех задач
  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Функция для получения задач в ближайшие 3 дня
  const getUpcomingTasks = () => {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    return tasks.filter((task: any) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && dueDate <= threeDaysFromNow && task.status !== 'completed';
    }).sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const upcomingTasks = getUpcomingTasks();

  // Слушаем события изменения данных ТО для синхронизации
  useEffect(() => {
    const handleMaintenanceChange = () => {
      refreshData();
    };

    const handleTaskChange = () => {
      refetchTaskStats();
    };

    const handleInspectionChange = () => {
      refetchInspections();
    };

    window.addEventListener('maintenanceDataChanged', handleMaintenanceChange);
    window.addEventListener('taskUpdated', handleTaskChange);
    window.addEventListener('taskCreated', handleTaskChange);
    window.addEventListener('taskDeleted', handleTaskChange);
    window.addEventListener('dailyInspectionsUpdated', handleInspectionChange);
    
    return () => {
      window.removeEventListener('maintenanceDataChanged', handleMaintenanceChange);
      window.removeEventListener('taskUpdated', handleTaskChange);
      window.removeEventListener('taskCreated', handleTaskChange);
      window.removeEventListener('taskDeleted', handleTaskChange);
      window.removeEventListener('dailyInspectionsUpdated', handleInspectionChange);
    };
  }, [refreshData, refetchTaskStats, refetchInspections]);

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

  // Расчет реальных данных оборудования из централизованного хранилища (исключая выведенное из эксплуатации)
  const activeEquipment = getActiveEquipment();
  const equipmentData = {
    total: activeEquipment.length,
    active: activeEquipment.filter(eq => eq.status === 'active').length,
    maintenance: activeEquipment.filter(eq => eq.status === 'maintenance').length,
    inactive: activeEquipment.filter(eq => eq.status === 'inactive').length,
    categories: {
      "Фрезерные станки": activeEquipment.filter(eq => eq.type === 'Фрезерный станок').length,
      "Шлифовальные станки": activeEquipment.filter(eq => eq.type === 'Шлифовальный станок').length,
      "Токарные станки": activeEquipment.filter(eq => eq.type === 'Токарный станок').length,
      "Электроэрозия": 5,
      "Измерительное": 2,
      "Автоматизация": 1,
      "Вспомогательное": 3,
      "Складское": 1,
      "Заточные станки": 1,
      "Отрезные станки": 1
    }
  };

  // Реальные данные ТО из централизованного хранилища
  const maintenanceData = {
    scheduled: getMaintenanceByStatus('scheduled').length,
    completed: getMaintenanceByStatus('completed').length,
    overdue: maintenanceRecords.filter(record => {
      if (record.status !== 'scheduled') return false;
      const scheduledDate = new Date(record.scheduledDate);
      return scheduledDate < new Date();
    }).length,
    inProgress: getMaintenanceByStatus('in_progress').length,
    types: {
      "1М - ТО": maintenanceRecords.filter(r => r.maintenanceType === '1М - ТО').length,
      "3М - ТО": maintenanceRecords.filter(r => r.maintenanceType === '3М - ТО').length,
      "6М - ТО": maintenanceRecords.filter(r => r.maintenanceType === '6М - ТО').length,
      "1Г - ТО": maintenanceRecords.filter(r => r.maintenanceType === '1Г - ТО').length
    }
  };

  // Данные ежедневных осмотров из реальной базы данных daily_inspections
  const todayInspectionStats = getTodayStats();
  
  const dailyInspectionData = {
    total: equipmentData.total,
    inspected: todayInspectionStats.totalInspected,
    notWorking: todayInspectionStats.notWorking,
    onMaintenance: todayInspectionStats.onMaintenance,
    working: todayInspectionStats.working,
    issues: todayInspectionStats.totalIssues,
    progress: equipmentData.total > 0 ? Math.round((todayInspectionStats.totalInspected / equipmentData.total) * 100) : 0
  };

  // Данные пользователей
  const usersData = {
    total: 3, // admin, user, editor
    active: 3,
    roles: {
      admin: 1,
      editor: 1,
      user: 1
    },
    onlineToday: 1 // текущий пользователь
  };

  // Последние важные события
  const recentActivities = [
    {
      id: 1,
      type: 'maintenance',
      message: 'Запланировано ТО для Nmill 1400 на 15 мая',
      time: '2 часа назад',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'inspection',
      message: `Проведено осмотров: ${dailyInspectionData.inspected}/${dailyInspectionData.total}`,
      time: 'Сегодня',
      icon: Eye,
      color: 'text-green-600'
    },
    {
      id: 3,
      type: 'equipment',
      message: 'LH87 переведен в режим ТО',
      time: '1 день назад',
      icon: Settings,
      color: 'text-yellow-600'
    },
    {
      id: 4,
      type: 'alert',
      message: 'Darex XT-3000 помечен как неработающий',
      time: '2 дня назад',
      icon: AlertTriangle,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        <Sidebar />
        <div className={`flex-1 flex flex-col overflow-hidden ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Header />
          <div className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="p-6">
              <Helmet>
                <title>Панель управления - Система управления оборудованием</title>
                <meta name="description" content="Общий обзор состояния оборудования, технического обслуживания и ежедневных осмотров" />
              </Helmet>
              
              {/* Заголовок и приветствие */}
              <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Панель управления
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Добро пожаловать, {user.name}! Сегодня {format(new Date(), 'd MMMM yyyy', { locale: ru })}
        </p>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Общее оборудование */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Settings className="h-10 w-10 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Всего оборудования</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{equipmentData.total}</p>
                        <p className="text-sm text-green-600">
                          {equipmentData.active} активно, {equipmentData.maintenance} на ТО
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ТО на месяц */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Wrench className="h-10 w-10 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ТО в мае</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{maintenanceData.scheduled}</p>
                        <p className="text-sm text-blue-600">
                          {maintenanceData.completed} выполнено, {maintenanceData.inProgress} в процессе
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ежедневные осмотры */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Eye className="h-10 w-10 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Осмотры сегодня</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                          {dailyInspectionData.inspected}/{dailyInspectionData.total}
                        </p>
                        <p className="text-sm text-purple-600">
                          {dailyInspectionData.progress}% завершено
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Пользователи */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Users className="h-10 w-10 text-orange-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Пользователи</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{usersData.total}</p>
                        <p className="text-sm text-orange-600">
                          {usersData.onlineToday} активен сегодня
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Прогресс ежедневных осмотров */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Ежедневные осмотры - {format(new Date(), 'd MMMM', { locale: ru })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Общий прогресс</span>
                        <span className="text-sm text-gray-600">{dailyInspectionData.inspected} из {dailyInspectionData.total}</span>
                      </div>
                      <Progress value={dailyInspectionData.progress} className="w-full" />
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-2">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dailyInspectionData.inspected}</p>
                          <p className="text-sm text-gray-600">Осмотрено</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-2">
                            <Settings className="h-6 w-6 text-blue-600" />
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dailyInspectionData.working}</p>
                          <p className="text-sm text-gray-600">Работает</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-2">
                            <Clock className="h-6 w-6 text-yellow-600" />
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dailyInspectionData.onMaintenance}</p>
                          <p className="text-sm text-gray-600">На ТО</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-2">
                            <XCircle className="h-6 w-6 text-red-600" />
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dailyInspectionData.notWorking}</p>
                          <p className="text-sm text-gray-600">Не работает</p>
                        </div>
                      </div>

                      {dailyInspectionData.issues > 0 && (
                        <div 
                          className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          onClick={() => {
                            setLocation("/tasks");
                            // Устанавливаем активную вкладку замечаний
                            setTimeout(() => {
                              window.dispatchEvent(new CustomEvent('navigateToRemarks'));
                            }, 100);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <span className="font-medium text-red-800 dark:text-red-200">
                              Обнаружено проблем: {dailyInspectionData.issues}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Статистика задач */}
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/tasks")}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Статистика задач
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{taskStats.total}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Всего задач</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Выполнено</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>В ожидании: {taskStats.pending}</span>
                          <span>В работе: {taskStats.inProgress}</span>
                        </div>
                        {taskStats.overdue > 0 && (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">Просрочено: {taskStats.overdue}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-2">
                        <Progress 
                          value={taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0} 
                          className="h-2"
                        />
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}% завершено
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ближайшие задачи */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Ближайшие задачи (3 дня)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcomingTasks.length === 0 ? (
                        <div className="text-center py-4">
                          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Нет задач на ближайшие 3 дня</p>
                        </div>
                      ) : (
                        upcomingTasks.slice(0, 5).map((task: any) => (
                          <div
                            key={task.id}
                            className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                            onClick={() => setLocation("/tasks")}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                  {task.title}
                                </h4>
                                {task.equipmentId && (
                                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <Wrench className="h-3 w-3" />
                                    Оборудование: {(() => {
                                      const eq = equipment.find((e: any) => e.id === task.equipmentId);
                                      return eq ? eq.name : task.equipmentId;
                                    })()}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge 
                                    variant={
                                      task.priority === 'urgent' ? 'destructive' :
                                      task.priority === 'high' ? 'default' :
                                      'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {task.priority === 'urgent' ? 'Срочно' :
                                     task.priority === 'high' ? 'Высокий' :
                                     task.priority === 'medium' ? 'Средний' : 'Низкий'}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(task.dueDate), 'dd.MM.yyyy', { locale: ru })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      
                      {upcomingTasks.length > 5 && (
                        <div className="text-center pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setLocation("/tasks")}
                          >
                            Показать все ({upcomingTasks.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Статистика ТО */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      ТО по типам (май 2025)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(maintenanceData.types).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{type}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Статистика оборудования по категориям */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Оборудование по типам
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {Object.entries(equipmentData.categories)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 6)
                        .map(([category, count]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{category}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Последние события */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Последние события
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <activity.icon className={`h-5 w-5 mt-0.5 ${activity.color}`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {activity.message}
                            </p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Статусы и предупреждения */}
              {(maintenanceData.overdue > 0 || dailyInspectionData.issues > 0 || dailyInspectionData.notWorking > 0) && (
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Требует внимания
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {maintenanceData.overdue > 0 && (
                        <div 
                          className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          onClick={() => setLocation("/maintenance")}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-5 w-5 text-red-600" />
                            <span className="font-medium text-red-800 dark:text-red-200">Просроченные ТО</span>
                          </div>
                          <p className="text-2xl font-bold text-red-600">{maintenanceData.overdue}</p>
                          <p className="text-sm text-red-600">требуют выполнения</p>
                        </div>
                      )}
                      
                      {dailyInspectionData.notWorking > 0 && (
                        <div 
                          className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          onClick={() => setLocation("/daily-inspection")}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <span className="font-medium text-red-800 dark:text-red-200">Неработающее оборудование</span>
                          </div>
                          <p className="text-2xl font-bold text-red-600">{dailyInspectionData.notWorking}</p>
                          <p className="text-sm text-red-600">ед. оборудования</p>
                        </div>
                      )}

                      {getOpenRemarksCount() > 0 && (
                        <div 
                          className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                          onClick={() => setLocation("/remarks")}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            <span className="font-medium text-yellow-800 dark:text-yellow-200">Открытые замечания</span>
                          </div>
                          <p className="text-2xl font-bold text-yellow-600">{getOpenRemarksCount()}</p>
                          <p className="text-sm text-yellow-600">
                            требуют решения
                            {getCriticalRemarksCount() > 0 && (
                              <span className="text-red-600 font-semibold ml-2">
                                ({getCriticalRemarksCount()} критичных)
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
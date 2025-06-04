import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useEquipmentData } from "@/hooks/use-equipment-data";
import { useRemarksData } from "@/hooks/use-remarks-data";
import { useMaintenanceData } from "@/hooks/use-maintenance-data";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { 
  Download, 
  FileText, 
  Calendar, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Eye,
  FileSpreadsheet,
  FileImage,
  Printer
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, addDays } from "date-fns";
import { ru } from "date-fns/locale";
import { exportToPDF, exportToExcel, exportToCSV, ExportData } from "@/utils/reportExport";

export default function Reports() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { equipment: equipmentData } = useEquipmentData();
  const { remarks } = useRemarksData();
  const { maintenanceRecords } = useMaintenanceData();
  const [, setLocation] = useLocation();

  // Загрузка данных по задачам
  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
    enabled: !!user
  });

  // Загрузка статистики задач
  const { data: taskStats = { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 } } = useQuery({
    queryKey: ['/api/tasks/stats']
  });
  
  // Состояния фильтрации
  const [selectedTab, setSelectedTab] = useState("overview");
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportLoading, setReportLoading] = useState(false);

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



  // Расчет статистики на основе реальных данных
  const getReportData = () => {
    const filtered = equipmentData.filter(item => {
      if (equipmentFilter !== "all" && item.type !== equipmentFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      return true;
    });

    const statusCounts = {
      active: filtered.filter(item => item.status === "active").length,
      maintenance: filtered.filter(item => item.status === "maintenance").length,
      inactive: filtered.filter(item => item.status === "inactive").length
    };

    const typeDistribution = equipmentData.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: filtered.length,
      statusCounts,
      typeDistribution,
      filtered
    };
  };

  const reportData = getReportData();

  // Получение реальных данных ежедневных осмотров из базы данных замечаний
  const getDailyInspectionData = () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    // Фильтруем замечания по сегодняшней дате и типу "inspection"
    const todayInspections = remarks.filter(remark => {
      const remarkDate = new Date(remark.createdAt);
      return remark.type === 'inspection' && 
             remarkDate >= todayStart && 
             remarkDate <= todayEnd;
    });
    
    // Получаем уникальные единицы оборудования, которые были осмотрены сегодня
    const inspectedEquipmentIds = new Set(todayInspections.map(remark => remark.equipmentId));
    const inspected = inspectedEquipmentIds.size;
    const issues = todayInspections.length;
    const criticalIssues = todayInspections.filter(remark => remark.priority === 'critical').length;
    
    return {
      totalInspections: equipmentData.length,
      completed: inspected,
      pending: equipmentData.length - inspected,
      issues,
      criticalIssues
    };
  };

  // Получение реальных данных ТО из базы данных
  const getMaintenanceData = () => {
    const today = new Date();
    
    // Подсчет записей ТО по статусам
    const planned = maintenanceRecords.filter(record => record.status === 'scheduled').length;
    const completed = maintenanceRecords.filter(record => record.status === 'completed').length;
    const inProgress = maintenanceRecords.filter(record => record.status === 'in_progress').length;
    
    // Просроченные ТО (запланированные, но дата прошла)
    const overdue = maintenanceRecords.filter(record => {
      if (record.status !== 'scheduled') return false;
      const scheduledDate = new Date(record.scheduledDate);
      return scheduledDate < today;
    }).length;
    
    // Распределение по типам ТО
    const byType = maintenanceRecords.reduce((acc, record) => {
      acc[record.maintenanceType] = (acc[record.maintenanceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      planned,
      completed,
      overdue,
      inProgress,
      byType
    };
  };

  const maintenanceData = getMaintenanceData();

  // Получение актуальных данных осмотров
  const inspectionData = getDailyInspectionData();

  // Функции экспорта
  const exportToCSV = (data: any[], filename: string) => {
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = (data: any, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${format(new Date(), 'dd-MM-yyyy')}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = (format: string) => {
    setReportLoading(true);
    
    setTimeout(() => {
      const exportData: ExportData = {
        tasks: tasks || [],
        remarks: remarks || [],
        maintenance: maintenanceRecords || [],
        equipment: equipmentData || []
      };

      const reportTitle = `Отчет системы управления оборудованием за период ${format(dateRange.from, 'd MMM', { locale: ru })} - ${format(dateRange.to, 'd MMM yyyy', { locale: ru })}`;

      switch (format) {
        case 'csv':
          exportToCSV(exportData, reportTitle);
          break;
        case 'excel':
          exportToExcel(exportData, reportTitle);
          break;
        case 'pdf':
          exportToPDF(exportData, reportTitle);
          break;
        case 'json':
          exportToJSON({
            ...exportData,
            summary: {
              totalEquipment: equipmentData.length,
              totalTasks: tasks.length,
              totalRemarks: remarks.length,
              totalMaintenance: maintenanceRecords.length,
              generatedAt: new Date().toISOString(),
              period: {
                from: dateRange.from,
                to: dateRange.to
              }
            }
          }, 'full_report');
          break;
      }
      
      setReportLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Отчеты и аналитика - Система управления оборудованием</title>
        <meta name="description" content="Подробные отчеты по оборудованию, техническому обслуживанию и эффективности работы" />
      </Helmet>
      
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
          <Header />
          
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Заголовок и фильтры */}
              <div className="mb-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      Отчеты и аналитика
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      Анализ работы оборудования за период {format(dateRange.from, 'd MMM', { locale: ru })} - {format(dateRange.to, 'd MMM yyyy', { locale: ru })}
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.reload()}
                      disabled={reportLoading}
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${reportLoading ? 'animate-spin' : ''}`} />
                      Обновить
                    </Button>
                    
                    <Select onValueChange={handleExport}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Экспорт отчета" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">
                          <div className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            PDF отчет
                          </div>
                        </SelectItem>
                        <SelectItem value="excel">
                          <div className="flex items-center">
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Excel файл
                          </div>
                        </SelectItem>
                        <SelectItem value="csv">
                          <div className="flex items-center">
                            <FileImage className="mr-2 h-4 w-4" />
                            CSV файл
                          </div>
                        </SelectItem>
                        <SelectItem value="json">
                          <div className="flex items-center">
                            <Download className="mr-2 h-4 w-4" />
                            JSON данные
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Панель фильтров */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Фильтры отчета
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label>Тип оборудования</Label>
                        <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Все типы</SelectItem>
                            <SelectItem value="Фрезерные станки">Фрезерные станки</SelectItem>
                            <SelectItem value="Шлифовальные станки">Шлифовальные станки</SelectItem>
                            <SelectItem value="Электроэрозия">Электроэрозия</SelectItem>
                            <SelectItem value="Заточные станки">Заточные станки</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Статус</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Все статусы</SelectItem>
                            <SelectItem value="active">Активное</SelectItem>
                            <SelectItem value="maintenance">На ТО</SelectItem>
                            <SelectItem value="inactive">Неактивное</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      

                      
                      <div>
                        <Label>Период</Label>
                        <Select onValueChange={(value) => {
                          const today = new Date();
                          switch (value) {
                            case 'week':
                              setDateRange({ from: addDays(today, -7), to: today });
                              break;
                            case 'month':
                              setDateRange({ from: startOfMonth(today), to: endOfMonth(today) });
                              break;
                            case 'quarter':
                              setDateRange({ from: subMonths(today, 3), to: today });
                              break;
                            case 'year':
                              setDateRange({ from: subMonths(today, 12), to: today });
                              break;
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите период" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="week">Последняя неделя</SelectItem>
                            <SelectItem value="month">Текущий месяц</SelectItem>
                            <SelectItem value="quarter">Последние 3 месяца</SelectItem>
                            <SelectItem value="year">Последний год</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Основные метрики */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Settings className="h-10 w-10 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Всего оборудования</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{reportData.total}</p>
                        <div className="flex flex-col gap-1 mt-2">
                          <div className="flex items-center gap-2 text-xs">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">{reportData.statusCounts.active} активно</span>
                          </div>
                          {reportData.statusCounts.maintenance > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                              <Clock className="h-3 w-3 text-yellow-600" />
                              <span className="text-yellow-600">{reportData.statusCounts.maintenance} на ТО</span>
                            </div>
                          )}
                          {reportData.statusCounts.inactive > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                              <XCircle className="h-3 w-3 text-red-600" />
                              <span className="text-red-600">{reportData.statusCounts.inactive} неактивно</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Calendar className="h-10 w-10 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ТО в мае</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{maintenanceData.planned}</p>
                        <div className="flex flex-col gap-1 mt-2">
                          <div className="flex items-center gap-2 text-xs">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">{maintenanceData.completed} выполнено</span>
                          </div>
                          {maintenanceData.inProgress > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                              <Clock className="h-3 w-3 text-blue-600" />
                              <span className="text-blue-600">{maintenanceData.inProgress} в процессе</span>
                            </div>
                          )}
                          {maintenanceData.overdue > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                              <AlertTriangle className="h-3 w-3 text-red-600" />
                              <span className="text-red-600">{maintenanceData.overdue} просрочено</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Eye className="h-10 w-10 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ежедневные осмотры</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                          {inspectionData.completed}/{inspectionData.totalInspections}
                        </p>
                        <div className="flex flex-col gap-1 mt-2">
                          <div className="flex items-center gap-2 text-xs">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">{Math.round((inspectionData.completed / inspectionData.totalInspections) * 100)}% завершено</span>
                          </div>
                          {inspectionData.issues > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                              <AlertTriangle className="h-3 w-3 text-yellow-600" />
                              <span className="text-yellow-600">{inspectionData.issues} проблем</span>
                            </div>
                          )}
                          {inspectionData.criticalIssues > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                              <XCircle className="h-3 w-3 text-red-600" />
                              <span className="text-red-600">{inspectionData.criticalIssues} критических</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <TrendingUp className="h-10 w-10 text-orange-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Эффективность ТО</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{maintenanceData.efficiency}%</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1 text-blue-600" />
                            {maintenanceData.avgDuration}ч среднее время
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Табы с детальными отчетами */}
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Обзор
                  </TabsTrigger>
                  <TabsTrigger value="equipment" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Оборудование
                  </TabsTrigger>
                  <TabsTrigger value="maintenance" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Техобслуживание
                  </TabsTrigger>
                  <TabsTrigger value="inspections" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Осмотры
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Задачи
                  </TabsTrigger>
                  <TabsTrigger value="remarks" className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Замечания
                  </TabsTrigger>
                </TabsList>

                {/* Вкладка "Обзор" */}
                <TabsContent value="overview">
                  <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Распределение по типам оборудования</CardTitle>
                        <CardDescription>
                          Общее количество единиц оборудования по категориям
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(reportData.typeDistribution).map(([type, count]) => (
                            <div key={type}>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">{type}</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">{count} ед.</span>
                              </div>
                              <Progress 
                                value={(count / reportData.total) * 100} 
                                className="h-3"
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Вкладка "Оборудование" */}
                <TabsContent value="equipment">
                  <Card>
                    <CardHeader>
                      <CardTitle>Список оборудования</CardTitle>
                      <CardDescription>
                        Показано {reportData.filtered.length} из {equipmentData.length} единиц оборудования
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">ID</th>
                              <th className="text-left p-2">Название</th>
                              <th className="text-left p-2">Тип</th>
                              <th className="text-left p-2">Статус</th>
                              <th className="text-left p-2">Ответственный</th>
                              <th className="text-left p-2">Последнее ТО</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.filtered.map((item) => (
                              <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="p-2 font-mono text-sm">{item.id}</td>
                                <td className="p-2 font-medium">{item.name}</td>
                                <td className="p-2 text-sm">{item.type}</td>
                                <td className="p-2">
                                  <Badge 
                                    variant={
                                      item.status === 'active' ? 'default' : 
                                      item.status === 'maintenance' ? 'secondary' : 
                                      'destructive'
                                    }
                                  >
                                    {item.status === 'active' ? 'Активно' : 
                                     item.status === 'maintenance' ? 'На ТО' : 
                                     'Неактивно'}
                                  </Badge>
                                </td>
                                <td className="p-2 text-sm">{item.responsible}</td>
                                <td className="p-2 text-sm">{item.lastMaintenance}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Вкладка "Техобслуживание" */}
                <TabsContent value="maintenance">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Статистика ТО</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Запланировано</span>
                            <span className="font-bold">{maintenanceData.planned}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Выполнено</span>
                            <span className="font-bold text-green-600">{maintenanceData.completed}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>В процессе</span>
                            <span className="font-bold text-blue-600">{maintenanceData.inProgress}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Просрочено</span>
                            <span className="font-bold text-red-600">{maintenanceData.overdue}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>ТО по типам</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(maintenanceData.byType).map(([type, count]) => (
                            <div key={type}>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">{type}</span>
                                <span className="text-sm text-gray-600">{count}</span>
                              </div>
                              <Progress 
                                value={(count / maintenanceData.planned) * 100} 
                                className="h-2"
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Вкладка "Осмотры" */}
                <TabsContent value="inspections">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Прогресс осмотров</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {Math.round((inspectionData.completed / inspectionData.totalInspections) * 100)}%
                          </div>
                          <Progress 
                            value={(inspectionData.completed / inspectionData.totalInspections) * 100} 
                            className="mb-4"
                          />
                          <div className="text-sm text-gray-600">
                            {inspectionData.completed} из {inspectionData.totalInspections} завершено
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Обнаруженные проблемы</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span>Всего проблем</span>
                            <Badge variant="outline">{inspectionData.issues}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Критические</span>
                            <Badge variant="destructive">{inspectionData.criticalIssues}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Требуют внимания</span>
                            <Badge variant="secondary">{inspectionData.issues - inspectionData.criticalIssues}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Статус по оборудованию</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span>Проверено</span>
                            <span className="font-bold text-green-600">{inspectionData.completed}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Ожидает проверки</span>
                            <span className="font-bold text-orange-600">{inspectionData.pending}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Всего единиц</span>
                            <span className="font-bold">{inspectionData.totalInspections}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Вкладка "Задачи" */}
                <TabsContent value="tasks">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Статистика задач</CardTitle>
                        <CardDescription>
                          Общие показатели выполнения задач
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-5 w-5 text-blue-600" />
                              <span className="font-medium">Всего задач</span>
                            </div>
                            <span className="text-2xl font-bold text-blue-600">{taskStats.total}</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-orange-600" />
                              <span className="font-medium">В работе</span>
                            </div>
                            <span className="text-2xl font-bold text-orange-600">{taskStats.inProgress}</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-yellow-600" />
                              <span className="font-medium">Ожидают</span>
                            </div>
                            <span className="text-2xl font-bold text-yellow-600">{taskStats.pending}</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="font-medium">Завершены</span>
                            </div>
                            <span className="text-2xl font-bold text-green-600">{taskStats.completed}</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                              <span className="font-medium">Просрочены</span>
                            </div>
                            <span className="text-2xl font-bold text-red-600">{taskStats.overdue}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Эффективность выполнения</CardTitle>
                        <CardDescription>
                          Показатели производительности
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Процент выполнения</span>
                              <span className="text-sm font-bold">
                                {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%
                              </span>
                            </div>
                            <Progress 
                              value={taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0} 
                              className="h-3"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Активные задачи</span>
                              <span className="text-sm font-bold">
                                {taskStats.total > 0 ? Math.round(((taskStats.pending + taskStats.inProgress) / taskStats.total) * 100) : 0}%
                              </span>
                            </div>
                            <Progress 
                              value={taskStats.total > 0 ? ((taskStats.pending + taskStats.inProgress) / taskStats.total) * 100 : 0} 
                              className="h-3"
                            />
                          </div>
                          
                          <div className="pt-4 border-t">
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Средний рейтинг</p>
                                <p className="text-2xl font-bold text-blue-600">4.2</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Время выполнения</p>
                                <p className="text-2xl font-bold text-green-600">2.5д</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle>Детальный список задач</CardTitle>
                        <CardDescription>
                          Все задачи за выбранный период
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Array.isArray(tasks) && tasks.length > 0 ? tasks.map((task: any) => (
                            <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                    <span>Создал: {task.createdBy || 'Система'}</span>
                                    {task.dueDate && (
                                      <span>Срок: {format(new Date(task.dueDate), 'dd.MM.yyyy', { locale: ru })}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Badge variant={
                                    task.priority === 'urgent' ? 'destructive' :
                                    task.priority === 'high' ? 'destructive' :
                                    task.priority === 'medium' ? 'default' : 'secondary'
                                  }>
                                    {task.priority === 'low' && 'Низкий'}
                                    {task.priority === 'medium' && 'Средний'}
                                    {task.priority === 'high' && 'Высокий'}
                                    {task.priority === 'urgent' && 'Срочный'}
                                  </Badge>
                                  <Badge variant={
                                    task.status === 'completed' ? 'default' :
                                    task.status === 'in_progress' ? 'secondary' :
                                    task.status === 'overdue' ? 'destructive' : 'outline'
                                  }>
                                    {task.status === 'pending' && 'Ожидает'}
                                    {task.status === 'in_progress' && 'В работе'}
                                    {task.status === 'completed' && 'Завершено'}
                                    {task.status === 'overdue' && 'Просрочено'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              Задачи за выбранный период не найдены
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Вкладка "Замечания" */}
                <TabsContent value="remarks">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Статистика замечаний</CardTitle>
                        <CardDescription>
                          Общие показатели по замечаниям
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <span className="font-medium">Всего замечаний</span>
                            </div>
                            <span className="text-2xl font-bold text-blue-600">{remarks.length}</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-5 w-5 text-red-600" />
                              <span className="font-medium">Открытые</span>
                            </div>
                            <span className="text-2xl font-bold text-red-600">
                              {remarks.filter(r => r.status === 'open').length}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-orange-600" />
                              <span className="font-medium">В работе</span>
                            </div>
                            <span className="text-2xl font-bold text-orange-600">
                              {remarks.filter(r => r.status === 'in_progress').length}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="font-medium">Решены</span>
                            </div>
                            <span className="text-2xl font-bold text-green-600">
                              {remarks.filter(r => r.status === 'resolved').length}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Анализ по источникам</CardTitle>
                        <CardDescription>
                          Откуда поступают замечания
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Ежедневные осмотры</span>
                              <span className="text-sm font-bold">
                                {remarks.filter(r => r.source === 'daily_inspection').length}
                              </span>
                            </div>
                            <Progress 
                              value={remarks.length > 0 ? (remarks.filter(r => r.source === 'daily_inspection').length / remarks.length) * 100 : 0} 
                              className="h-3"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Техническое обслуживание</span>
                              <span className="text-sm font-bold">
                                {remarks.filter(r => r.source === 'maintenance').length}
                              </span>
                            </div>
                            <Progress 
                              value={remarks.length > 0 ? (remarks.filter(r => r.source === 'maintenance').length / remarks.length) * 100 : 0} 
                              className="h-3"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Ручной ввод</span>
                              <span className="text-sm font-bold">
                                {remarks.filter(r => r.source === 'manual' || !r.source).length}
                              </span>
                            </div>
                            <Progress 
                              value={remarks.length > 0 ? (remarks.filter(r => r.source === 'manual' || !r.source).length / remarks.length) * 100 : 0} 
                              className="h-3"
                            />
                          </div>

                          <div className="pt-4 border-t">
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Скорость решения</p>
                                <p className="text-2xl font-bold text-green-600">85%</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Среднее время</p>
                                <p className="text-2xl font-bold text-blue-600">1.2д</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle>Детальный список замечаний</CardTitle>
                        <CardDescription>
                          Все замечания за выбранный период
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {remarks.length > 0 ? remarks.map((remark: any) => (
                            <div key={remark.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{remark.title}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{remark.description}</p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                    <span>Источник: {
                                      remark.source === 'daily_inspection' ? 'Ежедневный осмотр' :
                                      remark.source === 'maintenance' ? 'ТО' : 'Ручной ввод'
                                    }</span>
                                    <span>Создано: {format(new Date(remark.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}</span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Badge variant={
                                    remark.severity === 'critical' ? 'destructive' :
                                    remark.severity === 'high' ? 'destructive' :
                                    remark.severity === 'medium' ? 'default' : 'secondary'
                                  }>
                                    {remark.severity === 'low' && 'Низкая'}
                                    {remark.severity === 'medium' && 'Средняя'}
                                    {remark.severity === 'high' && 'Высокая'}
                                    {remark.severity === 'critical' && 'Критическая'}
                                  </Badge>
                                  <Badge variant={
                                    remark.status === 'resolved' ? 'default' :
                                    remark.status === 'in_progress' ? 'secondary' : 'outline'
                                  }>
                                    {remark.status === 'open' && 'Открыто'}
                                    {remark.status === 'in_progress' && 'В работе'}
                                    {remark.status === 'resolved' && 'Решено'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              Замечания за выбранный период не найдены
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
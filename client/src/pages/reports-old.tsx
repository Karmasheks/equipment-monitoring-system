import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Button } from "@/components/ui/button";
import { 
  BarChart4, 
  PieChart, 
  LineChart, 
  Download, 
  FileText, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Settings 
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function Reports() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [period, setPeriod] = useState("month");
  const [reportType, setReportType] = useState("overview");

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

  // Симуляция данных для общего отчета
  const overviewData = {
    totalEquipment: 87,
    activeEquipment: 76,
    inRepair: 5,
    requiresMaintenance: 6,
    completedMaintenances: {
      current: {
        total: 32,
        onTime: 28,
        delayed: 4
      },
      previous: {
        total: 28,
        onTime: 24,
        delayed: 4
      }
    },
    uptime: {
      current: 97.3,
      previous: 96.1
    },
    equipmentByType: [
      { type: "Фрезерные", count: 22 },
      { type: "Токарные", count: 18 },
      { type: "Сварочные", count: 15 },
      { type: "Шлифовальные", count: 12 },
      { type: "Прочие", count: 20 }
    ],
    maintenanceByMonth: [
      { month: "Янв", count: 22 },
      { month: "Фев", count: 24 },
      { month: "Мар", count: 26 },
      { month: "Апр", count: 25 },
      { month: "Май", count: 32 },
      { month: "Июн", count: 0 },
      { month: "Июл", count: 0 },
      { month: "Авг", count: 0 },
      { month: "Сен", count: 0 },
      { month: "Окт", count: 0 },
      { month: "Ноя", count: 0 },
      { month: "Дек", count: 0 }
    ]
  };

  // Симуляция данных для отчета о неисправностях
  const repairsData = {
    totalRepairs: {
      current: 18,
      previous: 23
    },
    avgRepairTime: {
      current: 3.2,
      previous: 4.1
    },
    mostCommonIssues: [
      { issue: "Износ подшипников", count: 7 },
      { issue: "Поломка приводного вала", count: 5 },
      { issue: "Проблемы с электроникой", count: 4 },
      { issue: "Утечка смазочных материалов", count: 2 }
    ],
    equipmentWithMostIssues: [
      { name: "Токарный станок ТВ-320", count: 4 },
      { name: "Фрезерный станок ВМ-127М", count: 3 },
      { name: "Сварочный аппарат ТИГ-200", count: 3 }
    ],
    repairsByMonth: [
      { month: "Янв", count: 6 },
      { month: "Фев", count: 5 },
      { month: "Мар", count: 4 },
      { month: "Апр", count: 3 },
      { month: "Май", count: 0 },
      { month: "Июн", count: 0 },
      { month: "Июл", count: 0 },
      { month: "Авг", count: 0 },
      { month: "Сен", count: 0 },
      { month: "Окт", count: 0 },
      { month: "Ноя", count: 0 },
      { month: "Дек", count: 0 }
    ]
  };

  // Симуляция данных для отчета по затратам
  const costsData = {
    totalCosts: {
      current: 875000,
      previous: 920000
    },
    costBreakdown: [
      { category: "Запчасти", amount: 520000 },
      { category: "Обслуживание", amount: 230000 },
      { category: "Аварийный ремонт", amount: 125000 }
    ],
    costByEquipmentType: [
      { type: "Фрезерные", amount: 280000 },
      { type: "Токарные", amount: 320000 },
      { type: "Сварочные", amount: 150000 },
      { type: "Шлифовальные", amount: 125000 }
    ],
    costsByMonth: [
      { month: "Янв", amount: 190000 },
      { month: "Фев", amount: 210000 },
      { month: "Мар", amount: 180000 },
      { month: "Апр", amount: 175000 },
      { month: "Май", amount: 120000 },
      { month: "Июн", amount: 0 },
      { month: "Июл", amount: 0 },
      { month: "Авг", amount: 0 },
      { month: "Сен", amount: 0 },
      { month: "Окт", amount: 0 },
      { month: "Ноя", amount: 0 },
      { month: "Дек", amount: 0 }
    ]
  };

  // Функция для форматирования числа в формат рублей
  const formatRub = (value: number) => {
    return value.toLocaleString("ru-RU") + " ₽";
  };

  // Функция расчета процента изменения
  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return 100;
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  // Функция для определения класса для процента изменения (положительный/отрицательный)
  const getChangeClass = (current: number, previous: number, isPositiveGood = true) => {
    const change = current - previous;
    if (change === 0) return "text-gray-500";
    if ((change > 0 && isPositiveGood) || (change < 0 && !isPositiveGood)) {
      return "text-success-500 dark:text-success-400";
    }
    return "text-error-500 dark:text-error-400";
  };

  return (
    <div className="min-h-screen flex dark:bg-gray-900">
      <Helmet>
        <title>Отчеты | Система мониторинга</title>
      </Helmet>
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6 dark:bg-gray-900">
          <div className="fade-in">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Отчеты</h1>
              <div className="flex space-x-2">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Выберите период" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Неделя</SelectItem>
                    <SelectItem value="month">Месяц</SelectItem>
                    <SelectItem value="quarter">Квартал</SelectItem>
                    <SelectItem value="year">Год</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-primary-600 hover:bg-primary-700">
                  <Download className="mr-2 h-4 w-4" />
                  Экспорт
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="overview" className="space-y-4" value={reportType} onValueChange={setReportType}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview" className="flex items-center">
                  <BarChart4 className="mr-2 h-4 w-4" />
                  Общий отчет
                </TabsTrigger>
                <TabsTrigger value="repairs" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Неисправности
                </TabsTrigger>
                <TabsTrigger value="costs" className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Затраты
                </TabsTrigger>
              </TabsList>
              
              {/* Общий отчет */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Всего оборудования</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{overviewData.totalEquipment}</div>
                      <div className="flex items-center mt-2 text-xs">
                        <div className="flex space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="text-green-500 dark:text-green-400 flex items-center">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> {overviewData.activeEquipment} рабочих
                          </span>
                          <span className="text-yellow-500 dark:text-yellow-400 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" /> {overviewData.requiresMaintenance} требует ТО
                          </span>
                          <span className="text-red-500 dark:text-red-400 flex items-center">
                            <Settings className="h-3 w-3 mr-1" /> {overviewData.inRepair} в ремонте
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Завершено ТО</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{overviewData.completedMaintenances.current.total}</div>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className={getChangeClass(
                          overviewData.completedMaintenances.current.total, 
                          overviewData.completedMaintenances.previous.total
                        )}>
                          {overviewData.completedMaintenances.current.total > overviewData.completedMaintenances.previous.total ? "+" : ""}
                          {getChangePercentage(
                            overviewData.completedMaintenances.current.total, 
                            overviewData.completedMaintenances.previous.total
                          )}%
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">по сравнению с прошлым периодом</span>
                      </div>
                      <div className="flex space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <span className="text-green-500 dark:text-green-400">
                          {overviewData.completedMaintenances.current.onTime} в срок
                        </span>
                        <span className="text-red-500 dark:text-red-400">
                          {overviewData.completedMaintenances.current.delayed} с задержкой
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Время работы оборудования</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{overviewData.uptime.current}%</div>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className={getChangeClass(
                          overviewData.uptime.current, 
                          overviewData.uptime.previous
                        )}>
                          {overviewData.uptime.current > overviewData.uptime.previous ? "+" : ""}
                          {getChangePercentage(
                            overviewData.uptime.current, 
                            overviewData.uptime.previous
                          )}%
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">по сравнению с прошлым периодом</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 dark:bg-gray-700">
                        <div 
                          className="bg-primary-600 h-1.5 rounded-full dark:bg-primary-500" 
                          style={{ width: `${overviewData.uptime.current}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Оборудование по типам</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {overviewData.equipmentByType.map((item, index) => (
                          <div key={index}>
                            <div className="flex justify-between text-xs">
                              <span>{item.type}</span>
                              <span>{item.count}</span>
                            </div>
                            <Progress value={(item.count / overviewData.totalEquipment) * 100} className="h-1" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>ТО по месяцам</CardTitle>
                      <CardDescription>Количество выполненных обслуживаний</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 flex items-end space-x-2">
                        {overviewData.maintenanceByMonth.map((item, index) => (
                          <div key={index} className="flex flex-col items-center flex-1">
                            <div className="w-full bg-primary-100 dark:bg-primary-900/30 rounded-t" 
                                 style={{ 
                                   height: `${Math.max((item.count / Math.max(...overviewData.maintenanceByMonth.map(m => m.count))) * 220, 4)}px`,
                                 }}>
                              <div className="w-full h-full bg-primary-500 dark:bg-primary-600 rounded-t opacity-80"></div>
                            </div>
                            <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">{item.month}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Состояние оборудования</CardTitle>
                      <CardDescription>Распределение по статусам</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <div className="w-72 h-72 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-5xl font-bold text-gray-900 dark:text-white">{overviewData.totalEquipment}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Всего оборудования</div>
                          </div>
                        </div>
                        <svg width="100%" height="100%" viewBox="0 0 42 42" className="transform rotate-[-90deg]">
                          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#edf2f7" strokeWidth="3" className="dark:stroke-gray-700"></circle>
                          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#10b981" strokeWidth="3" 
                                  strokeDasharray={`${(overviewData.activeEquipment / overviewData.totalEquipment) * 100} 100`} className="dark:stroke-green-600"></circle>
                          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#eab308" strokeWidth="3" 
                                  strokeDasharray={`${(overviewData.requiresMaintenance / overviewData.totalEquipment) * 100} 100`} 
                                  strokeDashoffset={`${-1 * (overviewData.activeEquipment / overviewData.totalEquipment) * 100}`} className="dark:stroke-yellow-600"></circle>
                          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#ef4444" strokeWidth="3" 
                                  strokeDasharray={`${(overviewData.inRepair / overviewData.totalEquipment) * 100} 100`} 
                                  strokeDashoffset={`${-1 * ((overviewData.activeEquipment + overviewData.requiresMaintenance) / overviewData.totalEquipment) * 100}`} className="dark:stroke-red-600"></circle>
                        </svg>
                      </div>
                    </CardContent>
                    <div className="px-6 pb-6 flex justify-center space-x-6">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2 dark:bg-green-600"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Рабочие</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2 dark:bg-yellow-600"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Требуют ТО</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2 dark:bg-red-600"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">В ремонте</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Отчет о неисправностях */}
              <TabsContent value="repairs" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Всего ремонтов</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{repairsData.totalRepairs.current}</div>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className={getChangeClass(
                          repairsData.totalRepairs.current, 
                          repairsData.totalRepairs.previous,
                          false
                        )}>
                          {repairsData.totalRepairs.current < repairsData.totalRepairs.previous ? "" : "+"}
                          {getChangePercentage(
                            repairsData.totalRepairs.current, 
                            repairsData.totalRepairs.previous
                          )}%
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">по сравнению с прошлым периодом</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Среднее время ремонта</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{repairsData.avgRepairTime.current} дн.</div>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className={getChangeClass(
                          repairsData.avgRepairTime.current, 
                          repairsData.avgRepairTime.previous,
                          false
                        )}>
                          {repairsData.avgRepairTime.current < repairsData.avgRepairTime.previous ? "" : "+"}
                          {getChangePercentage(
                            repairsData.avgRepairTime.current, 
                            repairsData.avgRepairTime.previous
                          )}%
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">по сравнению с прошлым периодом</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="lg:col-span-1 md:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Оборудование с частыми поломками</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {repairsData.equipmentWithMostIssues.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm text-gray-800 dark:text-gray-200">{item.name}</span>
                            <div>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                                {item.count} {item.count === 1 ? 'поломка' : item.count < 5 ? 'поломки' : 'поломок'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ремонты по месяцам</CardTitle>
                      <CardDescription>Количество проведенных ремонтов</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 flex items-end space-x-2">
                        {repairsData.repairsByMonth.map((item, index) => (
                          <div key={index} className="flex flex-col items-center flex-1">
                            <div className="w-full bg-red-100 dark:bg-red-900/30 rounded-t" 
                                 style={{ 
                                   height: `${Math.max((item.count / Math.max(...repairsData.repairsByMonth.map(m => m.count))) * 220, 4)}px`,
                                 }}>
                              <div className="w-full h-full bg-red-500 dark:bg-red-600 rounded-t opacity-80"></div>
                            </div>
                            <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">{item.month}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Типичные неисправности</CardTitle>
                      <CardDescription>Распространенные причины поломок</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {repairsData.mostCommonIssues.map((item, index) => (
                          <div key={index}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-700 dark:text-gray-300">{item.issue}</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div 
                                className="bg-red-500 h-2 rounded-full" 
                                style={{ width: `${(item.count / Math.max(...repairsData.mostCommonIssues.map(i => i.count))) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Отчет по затратам */}
              <TabsContent value="costs" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Общие затраты</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatRub(costsData.totalCosts.current)}</div>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className={getChangeClass(
                          costsData.totalCosts.current, 
                          costsData.totalCosts.previous,
                          false
                        )}>
                          {costsData.totalCosts.current < costsData.totalCosts.previous ? "" : "+"}
                          {getChangePercentage(
                            costsData.totalCosts.current, 
                            costsData.totalCosts.previous
                          )}%
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">по сравнению с прошлым периодом</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="lg:col-span-2 md:col-span-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Распределение затрат</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {costsData.costBreakdown.map((item, index) => (
                          <div key={index}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-700 dark:text-gray-300">{item.category}</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatRub(item.amount)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div 
                                className={`h-2 rounded-full ${
                                  index === 0 ? "bg-blue-500" : 
                                  index === 1 ? "bg-green-500" : 
                                  "bg-red-500"
                                }`}
                                style={{ width: `${(item.amount / costsData.totalCosts.current) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Затраты по месяцам</CardTitle>
                      <CardDescription>Динамика расходов</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 flex items-end space-x-2">
                        {costsData.costsByMonth.map((item, index) => (
                          <div key={index} className="flex flex-col items-center flex-1">
                            <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t" 
                                 style={{ 
                                   height: `${Math.max((item.amount / Math.max(...costsData.costsByMonth.map(m => m.amount))) * 220, 4)}px`,
                                 }}>
                              <div className="w-full h-full bg-blue-500 dark:bg-blue-600 rounded-t opacity-80"></div>
                            </div>
                            <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">{item.month}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Затраты по типам оборудования</CardTitle>
                      <CardDescription>Распределение расходов</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {costsData.costByEquipmentType.map((item, index) => (
                          <div key={index}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-700 dark:text-gray-300">{item.type}</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatRub(item.amount)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div 
                                className={`bg-indigo-500 h-2 rounded-full`}
                                style={{ width: `${(item.amount / costsData.totalCosts.current) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      <MobileSidebar />
    </div>
  );
}
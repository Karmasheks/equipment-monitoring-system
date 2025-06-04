import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useEquipmentData } from "@/hooks/use-equipment-data";
import { useRemarksData } from "@/hooks/use-remarks-data";
import { useMaintenanceApi } from "@/hooks/use-maintenance-api";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar, Filter, Search, CheckCircle, Clock, AlertTriangle, Eye, Edit, Trash2, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

export default function Maintenance() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  // Загрузка данных оборудования из API
  const { data: equipment = [] } = useQuery({
    queryKey: ['/api/equipment'],
  });
  
  // Фильтруем только активное оборудование (исключаем выведенное из эксплуатации)
  const getActiveEquipment = () => equipment.filter((eq: any) => eq.status !== 'decommissioned');
  
  const { addRemark } = useRemarksData();
  const { maintenanceRecords, addMaintenance, updateMaintenance, deleteMaintenance } = useMaintenanceApi();

  // Данные автоматически синхронизируются через React Query

  // Состояния для фильтров
  const [selectedMonth, setSelectedMonth] = useState(new Date(2025, 5, 1)); // Июнь 2025 - где есть записи ТО
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Состояния для диалогов
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  
  // Состояние формы
  const [formData, setFormData] = useState({
    equipmentName: '',
    type: '1M-TO',
    date: format(new Date(), 'yyyy-MM-dd'),
    duration: '2 часа',
    responsible: 'Купцов Денис',
    status: 'scheduled',
    priority: 'medium'
  });

  // Состояние для замечаний ТО
  const [maintenanceNotes, setMaintenanceNotes] = useState<{[key: number]: string}>({});

  // Функция получения данных расписания из localStorage
  const getScheduleData = () => {
    try {
      const savedSchedule = localStorage.getItem('maintenance-schedule');
      if (savedSchedule) {
        const parsed = JSON.parse(savedSchedule);
        return parsed.map((item: any) => ({
          ...item,
          date: new Date(item.date)
        }));
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных расписания:', error);
    }
    return [];
  };

  // Функция удалена - записи ТО создаются через календарь "График ТО"

  // Проверка авторизации
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

  // Функция для добавления замечания из ТО
  const addMaintenanceRemark = (maintenanceId: number, equipmentName: string, notes: string) => {
    if (notes.trim()) {
      const equipmentItem = equipment.find(eq => eq.name === equipmentName);
      if (equipmentItem) {
        addRemark({
          title: `Замечание по ТО: ${maintenanceId}`,
          description: notes,
          equipmentName: equipmentName,
          equipmentId: equipmentItem.id,
          type: 'maintenance',
          priority: 'medium',
          status: 'open',
          reportedBy: user?.name || 'Система',
          assignedTo: 'Купцов Денис',
          notes: []
        });
        
        // Очистить поле заметок после добавления
        setMaintenanceNotes(prev => ({
          ...prev,
          [maintenanceId]: ''
        }));
      }
    }
  };

  // Функции для работы с данными
  const handleAddMaintenance = () => {
    // Найти соответствующее оборудование по названию
    const equipmentItem = equipment.find(eq => eq.name === formData.equipmentName);
    
    const now = new Date();
    const newMaintenance = {
      equipmentId: equipmentItem?.id || '',
      equipmentName: formData.equipmentName,
      maintenanceType: formData.type,
      scheduledDate: new Date(formData.date),
      duration: formData.duration,
      responsible: formData.responsible,
      status: formData.status as 'scheduled' | 'in_progress' | 'completed' | 'postponed',
      priority: formData.priority as 'low' | 'medium' | 'high' | 'critical',
      createdAt: now,
      updatedAt: now
    };

    addMaintenance(newMaintenance);
    setIsAddDialogOpen(false);
    setFormData({
      equipmentName: '',
      type: '1M-TO',
      date: format(new Date(), 'yyyy-MM-dd'),
      duration: '2 часа',
      responsible: 'Купцов Денис',
      status: 'scheduled',
      priority: 'medium'
    });
  };

  const handleEditMaintenance = () => {
    if (selectedMaintenance) {
      const equipmentItem = equipment.find(eq => eq.name === formData.equipmentName);
      
      const updates = {
        equipmentId: equipmentItem?.id || selectedMaintenance.equipmentId,
        equipmentName: formData.equipmentName,
        maintenanceType: formData.type,
        scheduledDate: new Date(formData.date),
        duration: formData.duration,
        responsible: formData.responsible,
        status: formData.status as 'scheduled' | 'in_progress' | 'completed' | 'postponed',
        priority: formData.priority as 'low' | 'medium' | 'high' | 'critical'
      };

      updateMaintenance({ id: selectedMaintenance.id, updates });
      setIsEditDialogOpen(false);
      setSelectedMaintenance(null);
    }
  };

  // Функция завершения ТО
  const handleCompleteMaintenance = (record: any) => {
    updateMaintenance({ id: record.id, updates: {
      status: 'completed' as const,
      completedDate: new Date()
    }});
  };

  // Функция удаления записи ТО
  const handleDeleteMaintenance = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить эту запись ТО?')) {
      deleteMaintenance(id);
    }
  };

  // Фильтрация записей ТО
  const filteredRecords = maintenanceRecords.filter(record => {
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesType = typeFilter === 'all' || record.maintenanceType === typeFilter;
    const matchesEquipment = equipmentFilter === 'all' || record.equipmentName === equipmentFilter;
    const matchesSearch = searchQuery === '' || 
      record.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.responsible.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Проверяем, что запись ТО относится к выбранному месяцу (только если выбран конкретный месяц)
    const recordDate = new Date(record.scheduledDate);
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const matchesMonth = recordDate >= monthStart && recordDate <= monthEnd;
    
    return matchesStatus && matchesType && matchesEquipment && matchesSearch && matchesMonth;
  });

  // Получение календарных дней
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Функции для работы с диалогами
  const openEditDialog = (maintenance: any) => {
    setSelectedMaintenance(maintenance);
    const scheduledDate = maintenance.scheduledDate ? new Date(maintenance.scheduledDate) : new Date();
    setFormData({
      equipmentName: maintenance.equipmentName,
      type: maintenance.maintenanceType,
      date: format(scheduledDate, 'yyyy-MM-dd'),
      duration: maintenance.duration,
      responsible: maintenance.responsible,
      status: maintenance.status,
      priority: maintenance.priority
    });
    setIsEditDialogOpen(true);
  };

  // Получение уникальных типов оборудования для фильтра
  const uniqueEquipment = [...new Set(equipment.map(eq => eq.name))];
  const uniqueTypes = ['1M-TO', '3M-TO', '6M-TO', '1G-TO'];

  // Получение статуса с цветом
  const getStatusBadge = (status: string) => {
    const statusMap = {
      'scheduled': { label: 'Запланировано', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
      'in_progress': { label: 'Выполняется', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
      'completed': { label: 'Завершено', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
      'postponed': { label: 'Отложено', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.scheduled;
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  // Получение приоритета с цветом
  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      'low': { label: 'Низкий', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },
      'medium': { label: 'Средний', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
      'high': { label: 'Высокий', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
      'critical': { label: 'Критический', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
    };
    
    const priorityInfo = priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
    return <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Техническое обслуживание - StarLine</title>
        <meta name="description" content="Система управления техническим обслуживанием оборудования предприятия" />
      </Helmet>
      
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Заголовок и кнопка добавления */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Техническое обслуживание
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Управление планами ТО оборудования предприятия
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 self-center">
                    Записи ТО создаются на странице "График ТО"
                  </p>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить ТО
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Добавить техническое обслуживание</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="equipmentName">Оборудование</Label>
                          <Select value={formData.equipmentName} onValueChange={(value) => setFormData(prev => ({ ...prev, equipmentName: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите оборудование" />
                            </SelectTrigger>
                            <SelectContent>
                              {equipment.map(eq => (
                                <SelectItem key={eq.id} value={eq.name}>{eq.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="type">Тип ТО</Label>
                          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите тип ТО" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1M-TO">1М - ТО</SelectItem>
                              <SelectItem value="3M-TO">3М - ТО</SelectItem>
                              <SelectItem value="6M-TO">6М - ТО</SelectItem>
                              <SelectItem value="1G-TO">1Г - ТО</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="date">Дата</Label>
                          <Input 
                            type="date" 
                            value={formData.date} 
                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="duration">Длительность</Label>
                          <Input 
                            value={formData.duration} 
                            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                            placeholder="Например: 2 часа"
                          />
                        </div>
                        <div>
                          <Label htmlFor="responsible">Ответственный</Label>
                          <Input 
                            value={formData.responsible} 
                            onChange={(e) => setFormData(prev => ({ ...prev, responsible: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="status">Статус</Label>
                          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите статус" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">Запланировано</SelectItem>
                              <SelectItem value="in_progress">Выполняется</SelectItem>
                              <SelectItem value="completed">Завершено</SelectItem>
                              <SelectItem value="postponed">Отложено</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="priority">Приоритет</Label>
                          <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите приоритет" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Низкий</SelectItem>
                              <SelectItem value="medium">Средний</SelectItem>
                              <SelectItem value="high">Высокий</SelectItem>
                              <SelectItem value="critical">Критический</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Отмена
                          </Button>
                          <Button onClick={handleAddMaintenance}>
                            Добавить
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Фильтры */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Фильтры
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <Label>Статус</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все статусы</SelectItem>
                          <SelectItem value="scheduled">Запланировано</SelectItem>
                          <SelectItem value="in_progress">Выполняется</SelectItem>
                          <SelectItem value="completed">Завершено</SelectItem>
                          <SelectItem value="postponed">Отложено</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Тип ТО</Label>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все типы</SelectItem>
                          {uniqueTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Оборудование</Label>
                      <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все оборудование</SelectItem>
                          {uniqueEquipment.map(eq => (
                            <SelectItem key={eq} value={eq}>{eq}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Поиск</Label>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Поиск по оборудованию..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Месяц</Label>
                      <Input
                        type="month"
                        value={format(selectedMonth, 'yyyy-MM')}
                        onChange={(e) => setSelectedMonth(new Date(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Список записей ТО */}
              <Card>
                <CardHeader>
                  <CardTitle>Записи технического обслуживания</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredRecords.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Записи ТО не найдены. Добавьте новое техническое обслуживание.
                      </div>
                    ) : (
                      filteredRecords.map((record) => (
                        <div
                          key={record.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                  {record.equipmentName}
                                </h3>
                                <Badge variant="outline">{record.maintenanceType}</Badge>
                                {getStatusBadge(record.status)}
                                {getPriorityBadge(record.priority)}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <p><strong>Дата:</strong> {format(new Date(record.scheduledDate), 'dd.MM.yyyy', { locale: ru })}</p>
                                <p><strong>Длительность:</strong> {record.duration}</p>
                                <p><strong>Ответственный:</strong> {record.responsible}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {record.status !== 'completed' && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleCompleteMaintenance(record)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Завершить
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(record)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Редактировать
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteMaintenance(record.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Удалить
                              </Button>
                            </div>
                          </div>
                          
                          {/* Поле для добавления замечания */}
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Добавить замечание по ТО..."
                                value={maintenanceNotes[record.id] || ''}
                                onChange={(e) => setMaintenanceNotes(prev => ({
                                  ...prev,
                                  [record.id]: e.target.value
                                }))}
                                className="flex-1"
                              />
                              <Button
                                onClick={() => addMaintenanceRemark(record.id, record.equipmentName, maintenanceNotes[record.id] || '')}
                                disabled={!maintenanceNotes[record.id]?.trim()}
                              >
                                Добавить замечание
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Диалог редактирования */}
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Редактировать техническое обслуживание</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="equipmentName">Оборудование</Label>
                      <Select value={formData.equipmentName} onValueChange={(value) => setFormData(prev => ({ ...prev, equipmentName: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите оборудование" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipment.map(eq => (
                            <SelectItem key={eq.id} value={eq.name}>{eq.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="type">Тип ТО</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тип ТО" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1M-TO">1М - ТО</SelectItem>
                          <SelectItem value="3M-TO">3М - ТО</SelectItem>
                          <SelectItem value="6M-TO">6М - ТО</SelectItem>
                          <SelectItem value="1G-TO">1Г - ТО</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date">Дата</Label>
                      <Input 
                        type="date" 
                        value={formData.date} 
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Длительность</Label>
                      <Input 
                        value={formData.duration} 
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="Например: 2 часа"
                      />
                    </div>
                    <div>
                      <Label htmlFor="responsible">Ответственный</Label>
                      <Input 
                        value={formData.responsible} 
                        onChange={(e) => setFormData(prev => ({ ...prev, responsible: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Статус</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите статус" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Запланировано</SelectItem>
                          <SelectItem value="in_progress">Выполняется</SelectItem>
                          <SelectItem value="completed">Завершено</SelectItem>
                          <SelectItem value="postponed">Отложено</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Приоритет</Label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите приоритет" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Низкий</SelectItem>
                          <SelectItem value="medium">Средний</SelectItem>
                          <SelectItem value="high">Высокий</SelectItem>
                          <SelectItem value="critical">Критический</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                        Отмена
                      </Button>
                      <Button onClick={handleEditMaintenance}>
                        Сохранить
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
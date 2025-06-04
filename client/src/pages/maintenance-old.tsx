import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useEquipmentData } from "@/hooks/use-equipment-data";
import { useRemarksData } from "@/hooks/use-remarks-data";
import { useMaintenanceData } from "@/hooks/use-maintenance-data";
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

// Данные технического обслуживания теперь берутся из централизованной системы
  // ФЕВРАЛЬ 2025
  {
    id: 3,
    equipmentName: "PreSet 2D+C",
    type: "1М - ТО",
    date: new Date(2025, 1, 10), // 10 февраля
    duration: "2 часа",
    responsible: "Купцов Денис",
    status: "completed",
    priority: "medium"
  },
  {
    id: 4,
    equipmentName: "Mikron VCE 800",
    type: "6М - ТО",
    date: new Date(2025, 1, 25), // 25 февраля
    duration: "6 часов",
    responsible: "Купцов Денис",
    status: "completed",
    priority: "high"
  },
  // МАРТ 2025
  {
    id: 5,
    equipmentName: "Mikron VCE 1000",
    type: "1М - ТО",
    date: new Date(2025, 2, 5), // 5 марта
    duration: "2 часа",
    responsible: "Купцов Денис",
    status: "completed",
    priority: "medium"
  },
  {
    id: 6,
    equipmentName: "WFL M30",
    type: "3М - ТО",
    date: new Date(2025, 2, 12), // 12 марта
    duration: "4 часа",
    responsible: "Купцов Денис",
    status: "completed",
    priority: "high"
  },
  // АПРЕЛЬ 2025
  {
    id: 7,
    equipmentName: "Haas UMC 750",
    type: "1М - ТО",
    date: new Date(2025, 3, 8), // 8 апреля
    duration: "2 часа",
    responsible: "Купцов Денис",
    status: "completed",
    priority: "medium"
  },
  {
    id: 8,
    equipmentName: "Studer S40",
    type: "3М - ТО",
    date: new Date(2025, 3, 18), // 18 апреля
    duration: "3 часа",
    responsible: "Купцов Денис",
    status: "completed",
    priority: "medium"
  },
  // МАЙ 2025
  {
    id: 9,
    equipmentName: "Nmill 1400",
    type: "1М - ТО",
    date: new Date(2025, 4, 15), // 15 мая
    duration: "2 часа",
    responsible: "Купцов Денис",
    status: "scheduled",
    priority: "medium"
  },
  {
    id: 10,
    equipmentName: "PreSet 2D+C",
    type: "1М - ТО",
    date: new Date(2025, 4, 10), // 10 мая
    duration: "2 часа",
    responsible: "Купцов Денис",
    status: "scheduled",
    priority: "medium"
  },
  {
    id: 11,
    equipmentName: "Nmill 1400",
    type: "6М - ТО",
    date: new Date(2025, 4, 20), // 20 мая - полугодовой
    duration: "6 часов",
    responsible: "Купцов Денис",
    status: "scheduled",
    priority: "high"
  },
  {
    id: 12,
    equipmentName: "Mazak",
    type: "1М - ТО",
    date: new Date(2025, 4, 25), // 25 мая
    duration: "2 часа",
    responsible: "Купцов Денис",
    status: "overdue",
    priority: "medium"
  },
  {
    id: 13,
    equipmentName: "WoodPecker WP-35",
    type: "3М - ТО",
    date: new Date(2025, 4, 8), // 8 мая
    duration: "4 часа",
    responsible: "Купцов Денис",
    status: "in_progress",
    priority: "high"
  },
  {
    id: 14,
    equipmentName: "Foraplan",
    type: "1М - ТО",
    date: new Date(2025, 4, 12), // 12 мая
    duration: "2 часа",
    responsible: "Купцов Денис",
    status: "scheduled",
    priority: "medium"
  },
  {
    id: 15,
    equipmentName: "YILMAZ NP 52",
    type: "3М - ТО",
    date: new Date(2025, 4, 22), // 22 мая
    duration: "4 часа",
    responsible: "Купцов Денис",
    status: "scheduled",
    priority: "high"
  },
  {
    id: 16,
    equipmentName: "BULLERI 320",
    type: "1М - ТО",
    date: new Date(2025, 4, 18), // 18 мая
    duration: "2 часа",
    responsible: "Купцов Денис",
    status: "scheduled",
    priority: "medium"
  },
  {
    id: 17,
    equipmentName: "Darex XT-3000",
    type: "1М - ТО",
    date: new Date(2025, 4, 28), // 28 мая
    duration: "3 часа",
    responsible: "Купцов Денис",
    status: "scheduled",
    priority: "medium"
  },
  {
    id: 18,
    equipmentName: "Лица Optisaw",
    type: "3М - ТО",
    date: new Date(2025, 4, 30), // 30 мая
    duration: "5 часов",
    responsible: "Купцов Денис",
    status: "scheduled",
    priority: "high"
  },
  // ИЮНЬ 2025
  {
    id: 19,
    equipmentName: "Nmill 1400",
    type: "1М - ТО",
    date: new Date(2025, 5, 15), // 15 июня
    duration: "2 часа",
    responsible: "Купцов Денис",
    status: "scheduled",
    priority: "medium"
  },
  {
    id: 20,
    equipmentName: "PreSet 2D+C",
    type: "3М - ТО",
    date: new Date(2025, 5, 10), // 10 июня
    duration: "4 часа",
    responsible: "Купцов Денис",
    status: "scheduled",
    priority: "high"
  }
];

export default function Maintenance() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { equipment } = useEquipmentData();
  const { addRemark, getRemarksByEquipment } = useRemarksData();
  const { maintenanceRecords, addMaintenanceRecord, updateMaintenanceRecord, deleteMaintenanceRecord } = useMaintenanceData();
  const [, setLocation] = useLocation();
  
  // Состояния для фильтров
  const [selectedMonth, setSelectedMonth] = useState(new Date(2025, 4, 1)); // Май 2025 - текущий месяц
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Состояния для диалогов
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  
  // Используем данные из централизованного провайдера
  
  // Состояние формы
  const [formData, setFormData] = useState({
    equipmentName: '',
    type: '1М - ТО',
    date: format(new Date(), 'yyyy-MM-dd'),
    duration: '2 часа',
    responsible: 'Купцов Денис',
    status: 'scheduled',
    priority: 'medium'
  });

  // Состояние для замечаний ТО
  const [maintenanceNotes, setMaintenanceNotes] = useState<{[key: number]: string}>({});

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
    const newMaintenance = {
      equipmentName: formData.equipmentName,
      type: formData.type,
      date: new Date(formData.date),
      duration: formData.duration,
      responsible: formData.responsible,
      status: formData.status as 'scheduled' | 'in_progress' | 'completed' | 'postponed',
      priority: formData.priority as 'low' | 'medium' | 'high' | 'critical'
    };
    
    addMaintenanceRecord(newMaintenance);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditMaintenance = () => {
    const updates = {
      equipmentName: formData.equipmentName,
      type: formData.type,
      date: new Date(formData.date),
      duration: formData.duration,
      responsible: formData.responsible,
      status: formData.status as 'scheduled' | 'in_progress' | 'completed' | 'postponed',
      priority: formData.priority as 'low' | 'medium' | 'high' | 'critical'
    };
    
    updateMaintenanceRecord(selectedMaintenance.id, updates);
    setIsEditDialogOpen(false);
    setSelectedMaintenance(null);
    resetForm();
  };

  const handleDeleteMaintenance = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить это ТО?')) {
      deleteMaintenanceRecord(id);
    }
  };

  const resetForm = () => {
    setFormData({
      equipmentName: '',
      type: '1М - ТО',
      date: format(new Date(), 'yyyy-MM-dd'),
      duration: '2 часа',
      responsible: 'Купцов Денис',
      status: 'scheduled',
      priority: 'medium'
    });
  };

  const openEditDialog = (maintenance: any) => {
    setSelectedMaintenance(maintenance);
    setFormData({
      equipmentName: maintenance.equipmentName,
      type: maintenance.type,
      date: format(maintenance.date, 'yyyy-MM-dd'),
      duration: maintenance.duration,
      responsible: maintenance.responsible,
      status: maintenance.status,
      priority: maintenance.priority
    });
    setIsEditDialogOpen(true);
  };

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

  // Фильтрация данных
  const filteredData = maintenanceRecords.filter(item => {
    // Фильтр по месяцу
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const isInMonth = item.date >= monthStart && item.date <= monthEnd;
    
    // Фильтр по статусу
    const statusMatch = statusFilter === 'all' || item.status === statusFilter;
    
    // Фильтр по типу
    const typeMatch = typeFilter === 'all' || item.type === typeFilter;
    
    // Фильтр по оборудованию
    const equipmentMatch = equipmentFilter === 'all' || 
      item.equipmentName.toLowerCase().includes(equipmentFilter.toLowerCase());
    
    // Поиск
    const searchMatch = searchQuery === '' || 
      item.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.responsible.toLowerCase().includes(searchQuery.toLowerCase());
    
    return isInMonth && statusMatch && typeMatch && equipmentMatch && searchMatch;
  });

  // Статистика
  const stats = {
    total: filteredData.length,
    completed: filteredData.filter(item => item.status === 'completed').length,
    scheduled: filteredData.filter(item => item.status === 'scheduled').length,
    overdue: filteredData.filter(item => item.status === 'postponed').length,
    inProgress: filteredData.filter(item => item.status === 'in_progress').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'postponed':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'unplanned':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Запланировано';
      case 'overdue':
        return 'Просрочено';
      case 'completed':
        return 'Выполнено';
      case 'unplanned':
        return 'Внеплановое';
      case 'in_progress':
        return 'В процессе';
      default:
        return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '1М - ТО':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case '3М - ТО':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case '6М - ТО':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
      case '1Г - ТО':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  // Используем реальное оборудование из централизованной системы
  const equipmentList = equipment.map(eq => eq.name);

  const responsibleList = [
    'Купцов Денис',
    'Петров И.В.',
    'Сидоров А.П.',
    'Иванов К.С.',
    'Смирнов П.А.'
  ];

  // Компонент формы для добавления/редактирования
  const MaintenanceForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="equipmentName">Оборудование</Label>
        <Select value={formData.equipmentName} onValueChange={(value) => setFormData({ ...formData, equipmentName: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите оборудование" />
          </SelectTrigger>
          <SelectContent>
            {equipmentList.map((equipment) => (
              <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="type">Тип ТО</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1М - ТО">1М - ТО</SelectItem>
            <SelectItem value="3М - ТО">3М - ТО</SelectItem>
            <SelectItem value="6М - ТО">6М - ТО</SelectItem>
            <SelectItem value="1Г - ТО">1Г - ТО</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="date">Дата</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="duration">Продолжительность</Label>
        <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1 час">1 час</SelectItem>
            <SelectItem value="2 часа">2 часа</SelectItem>
            <SelectItem value="3 часа">3 часа</SelectItem>
            <SelectItem value="4 часа">4 часа</SelectItem>
            <SelectItem value="5 часов">5 часов</SelectItem>
            <SelectItem value="6 часов">6 часов</SelectItem>
            <SelectItem value="8 часов">8 часов</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="responsible">Ответственный</Label>
        <Select value={formData.responsible} onValueChange={(value) => setFormData({ ...formData, responsible: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {responsibleList.map((person) => (
              <SelectItem key={person} value={person}>{person}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="status">Статус</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Запланировано</SelectItem>
            <SelectItem value="in_progress">В процессе</SelectItem>
            <SelectItem value="completed">Выполнено</SelectItem>
            <SelectItem value="overdue">Просрочено</SelectItem>
            <SelectItem value="unplanned">Внеплановое</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="priority">Приоритет</Label>
        <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Низкий</SelectItem>
            <SelectItem value="medium">Средний</SelectItem>
            <SelectItem value="high">Высокий</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={isEdit ? handleEditMaintenance : handleAddMaintenance} className="flex-1">
          {isEdit ? 'Сохранить изменения' : 'Добавить ТО'}
        </Button>
        <Button variant="outline" onClick={() => {
          if (isEdit) {
            setIsEditDialogOpen(false);
            setSelectedMaintenance(null);
          } else {
            setIsAddDialogOpen(false);
          }
          resetForm();
        }}>
          Отмена
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Техническое обслуживание - Система управления оборудованием</title>
        <meta name="description" content="Управление техническим обслуживанием оборудования с возможностью планирования, мониторинга и отчетности." />
      </Helmet>
      
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Заголовок */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Техническое обслуживание
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Управление планами технического обслуживания оборудования
                  </p>
                </div>
                
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить ТО
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Добавить новое ТО</DialogTitle>
                    </DialogHeader>
                    <MaintenanceForm />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Статистика */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Всего ТО</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Выполнено</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Запланировано</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.scheduled}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Просрочено</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.overdue}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">В процессе</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.inProgress}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Фильтры */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Фильтры и поиск
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Месяц
                      </label>
                      <Select 
                        value={format(selectedMonth, 'yyyy-MM')} 
                        onValueChange={(value) => {
                          const [year, month] = value.split('-');
                          setSelectedMonth(new Date(parseInt(year), parseInt(month) - 1, 1));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2025-01">Январь 2025</SelectItem>
                          <SelectItem value="2025-02">Февраль 2025</SelectItem>
                          <SelectItem value="2025-03">Март 2025</SelectItem>
                          <SelectItem value="2025-04">Апрель 2025</SelectItem>
                          <SelectItem value="2025-05">Май 2025</SelectItem>
                          <SelectItem value="2025-06">Июнь 2025</SelectItem>
                          <SelectItem value="2025-07">Июль 2025</SelectItem>
                          <SelectItem value="2025-08">Август 2025</SelectItem>
                          <SelectItem value="2025-09">Сентябрь 2025</SelectItem>
                          <SelectItem value="2025-10">Октябрь 2025</SelectItem>
                          <SelectItem value="2025-11">Ноябрь 2025</SelectItem>
                          <SelectItem value="2025-12">Декабрь 2025</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Статус
                      </label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все статусы</SelectItem>
                          <SelectItem value="scheduled">Запланировано</SelectItem>
                          <SelectItem value="in_progress">В процессе</SelectItem>
                          <SelectItem value="completed">Выполнено</SelectItem>
                          <SelectItem value="overdue">Просрочено</SelectItem>
                          <SelectItem value="unplanned">Внеплановое</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Тип ТО
                      </label>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все типы</SelectItem>
                          <SelectItem value="1М - ТО">1М - ТО</SelectItem>
                          <SelectItem value="3М - ТО">3М - ТО</SelectItem>
                          <SelectItem value="6М - ТО">6М - ТО</SelectItem>
                          <SelectItem value="1Г - ТО">1Г - ТО</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Оборудование
                      </label>
                      <Input
                        placeholder="Поиск по оборудованию"
                        value={equipmentFilter === 'all' ? '' : equipmentFilter}
                        onChange={(e) => setEquipmentFilter(e.target.value || 'all')}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Поиск
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Поиск по оборудованию или ответственному"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Список ТО */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Список технического обслуживания ({filteredData.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredData.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Нет записей ТО для выбранного периода и фильтров
                      </div>
                    ) : (
                      filteredData.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {item.equipmentName}
                              </h3>
                              <Badge className={getTypeColor(item.type)}>
                                {item.type}
                              </Badge>
                              <Badge className={getStatusColor(item.status)}>
                                {getStatusText(item.status)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div>
                                <span className="font-medium">Дата:</span> {format(item.date, 'dd.MM.yyyy', { locale: ru })}
                              </div>
                              <div>
                                <span className="font-medium">Продолжительность:</span> {item.duration}
                              </div>
                              <div>
                                <span className="font-medium">Ответственный:</span> {item.responsible}
                              </div>
                              <div>
                                <span className="font-medium">Приоритет:</span> {item.priority === 'high' ? 'Высокий' : item.priority === 'medium' ? 'Средний' : 'Низкий'}
                              </div>
                            </div>
                            
                            {/* Блок замечаний */}
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Замечания:</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ({getRemarksByEquipment(equipment.find(eq => eq.name === item.equipmentName)?.id || '').filter(r => r.type === 'maintenance').length})
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Добавить замечание по ТО..."
                                  value={maintenanceNotes[item.id] || ''}
                                  onChange={(e) => setMaintenanceNotes(prev => ({
                                    ...prev,
                                    [item.id]: e.target.value
                                  }))}
                                  className="flex-1 text-sm"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => addMaintenanceRemark(item.id, item.equipmentName, maintenanceNotes[item.id] || '')}
                                  disabled={!maintenanceNotes[item.id]?.trim()}
                                >
                                  Добавить
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteMaintenance(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      {/* Диалог редактирования */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать ТО</DialogTitle>
          </DialogHeader>
          <MaintenanceForm isEdit />
        </DialogContent>
      </Dialog>
    </div>
  );
}
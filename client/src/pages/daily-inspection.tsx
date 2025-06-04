import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { 
  Calendar,
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Settings,
  FileText,
  Users,
  Shield,
  Save
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { useEquipmentData } from "@/hooks/use-equipment-data";
import { useRemarksData } from "@/hooks/use-remarks-data";
import { useInspectionChecklists } from "@/hooks/use-inspection-checklists";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Интерфейс для элемента чек-листа
interface ChecklistItem {
  category: string;
  item: string;
}

// Компонент панели администратора для настройки чек-листов
const ChecklistAdminPanel = ({ 
  equipmentTypes, 
  defaultItems, 
  onSave, 
  getChecklistByType 
}: {
  equipmentTypes: string[];
  defaultItems: ChecklistItem[];
  onSave: (equipmentType: string, selectedItems: ChecklistItem[]) => Promise<void>;
  getChecklistByType: (type: string) => any;
}) => {
  const [selectedType, setSelectedType] = useState("");
  const [selectedItems, setSelectedItems] = useState<ChecklistItem[]>([]);

  // Загружаем существующий чек-лист при выборе типа оборудования
  useEffect(() => {
    if (selectedType) {
      const existingChecklist = getChecklistByType(selectedType);
      if (existingChecklist && existingChecklist.checkItems) {
        // Парсим существующие элементы чек-листа
        const parsedItems = existingChecklist.checkItems.map((item: string) => {
          const [category, checkItem] = item.includes(':') ? item.split(':') : ['Общее', item];
          return {
            category: category.trim(),
            item: checkItem.trim()
          };
        });
        setSelectedItems(parsedItems);
      } else {
        // Если нет существующего чек-листа, показываем все базовые элементы как выбранные
        setSelectedItems([...defaultItems]);
      }
    } else {
      setSelectedItems([]);
    }
  }, [selectedType, getChecklistByType, defaultItems]);

  const toggleItem = (item: ChecklistItem) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.category === item.category && i.item === item.item);
      if (exists) {
        return prev.filter(i => !(i.category === item.category && i.item === item.item));
      } else {
        return [...prev, item];
      }
    });
  };

  const handleSave = () => {
    if (selectedType && selectedItems.length > 0) {
      onSave(selectedType, selectedItems);
    }
  };

  // Группируем элементы по категориям
  const groupedItems = defaultItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <div className="space-y-6">
      {/* Выбор типа оборудования */}
      <div>
        <Label htmlFor="equipment-type">Тип оборудования</Label>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип оборудования" />
          </SelectTrigger>
          <SelectContent>
            {equipmentTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedType && (
        <>
          {/* Информация */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Выберите пункты проверки для типа оборудования "{selectedType}". 
              Выбранные пункты будут использоваться при проведении ежедневных осмотров.
            </p>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {selectedItems.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Выбрано пунктов</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {defaultItems.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Всего доступно</div>
              </CardContent>
            </Card>
          </div>

          {/* Список пунктов проверки по категориям */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.map((item, index) => {
                    const isSelected = selectedItems.find(i => 
                      i.category === item.category && i.item === item.item
                    );
                    
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => toggleItem(item)}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={!!isSelected}
                            onChange={() => toggleItem(item)}
                          />
                          <span className="text-sm">{item.item}</span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Кнопки действий */}
          <div className="flex justify-between">
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setSelectedItems([...defaultItems])}
              >
                Выбрать все
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedItems([])}
              >
                Очистить выбор
              </Button>
            </div>
            
            <Button
              onClick={handleSave}
              disabled={selectedItems.length === 0}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Сохранить чек-лист
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

interface InspectionItem {
  id: string;
  category: string;
  item: string;
  checked: boolean;
  status: 'ok' | 'attention' | 'critical';
  notes?: string;
}

interface EquipmentInspection {
  equipmentId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  inspectedBy?: string;
  inspectionDate?: Date;
  issues: number;
  notes?: string;
  workingStatus: 'working' | 'not_working' | 'maintenance';
}

export default function DailyInspection() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { equipment } = useEquipmentData();
  const { addRemark } = useRemarksData();
  const { checklists, getChecklistByEquipmentType, createChecklist, updateChecklist, deleteChecklist } = useInspectionChecklists();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isInspectionDialogOpen, setIsInspectionDialogOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<string>("");
  const [editingChecklist, setEditingChecklist] = useState<any>(null);

  // Базовые пункты проверки для различных типов оборудования
  const defaultInspectionItems = [
    { category: "Визуальный осмотр", item: "Общее состояние корпуса" },
    { category: "Визуальный осмотр", item: "Отсутствие повреждений" },
    { category: "Визуальный осмотр", item: "Чистота оборудования" },
    { category: "Электрическая система", item: "Состояние проводки" },
    { category: "Электрическая система", item: "Заземление" },
    { category: "Электрическая система", item: "Контрольные лампы" },
    { category: "Механическая часть", item: "Крепежные элементы" },
    { category: "Механическая часть", item: "Подвижные части" },
    { category: "Механическая часть", item: "Смазка" },
    { category: "Безопасность", item: "Защитные устройства" },
    { category: "Безопасность", item: "Аварийная остановка" },
    { category: "Безопасность", item: "Предупреждающие знаки" },
    { category: "Функциональность", item: "Рабочие параметры" },
    { category: "Функциональность", item: "Точность работы" },
    { category: "Функциональность", item: "Шум и вибрация" }
  ];

  // Состояние осмотров оборудования с сохранением в localStorage
  const [equipmentInspections, setEquipmentInspections] = useState<Record<string, EquipmentInspection>>(() => {
    // Попытка загрузить данные из localStorage
    const today = format(new Date(), 'yyyy-MM-dd');
    const storageKey = `equipment-inspections-${today}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Конвертируем даты обратно из строк
        Object.keys(parsed).forEach(key => {
          if (parsed[key].inspectionDate) {
            parsed[key].inspectionDate = new Date(parsed[key].inspectionDate);
          }
        });
        return parsed;
      } catch (error) {
        console.error('Ошибка загрузки данных осмотров:', error);
      }
    }
    
    // Создаем начальное состояние на основе данных из централизованного провайдера
    const inspections: Record<string, EquipmentInspection> = {};
    equipment.forEach(eq => {
      inspections[eq.id] = {
        equipmentId: eq.id,
        status: 'not_started',
        issues: 0,
        workingStatus: eq.status === 'active' ? 'working' : eq.status === 'maintenance' ? 'maintenance' : 'not_working'
      };
    });
    return inspections;
  });

  // Элементы осмотра (динамические, основанные на чек-листах)
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([]);

  // Функция для получения чек-листа для выбранного оборудования
  const getInspectionItems = (equipmentId: string): InspectionItem[] => {
    const equipmentItem = equipment.find(e => e.id === equipmentId);
    if (!equipmentItem) return [];

    const checklist = getChecklistByEquipmentType(equipmentItem.type);
    
    if (checklist && checklist.checkItems) {
      return checklist.checkItems.map((item: string, index: number) => {
        // Парсим строку элемента проверки (например: "Безопасность: Ограждения в исправном состоянии")
        const [category, checkItem] = item.includes(':') ? item.split(':') : ['Общее', item];
        return {
          id: `${equipmentId}-${index}`,
          category: category.trim(),
          item: checkItem.trim(),
          checked: false,
          status: 'ok' as const
        };
      });
    }

    // Если нет настроенного чек-листа, используем базовые пункты
    return defaultInspectionItems.map((item, index) => ({
      id: `${equipmentId}-${index}`,
      category: item.category,
      item: item.item,
      checked: false,
      status: 'ok' as const
    }));
  };

  // Функция для сохранения чек-листа
  const handleSaveChecklist = async (equipmentType: string, selectedItems: any[]) => {
    try {
      const existingChecklist = getChecklistByEquipmentType(equipmentType);
      
      // Преобразуем выбранные элементы в массив строк формата "Категория: Элемент"
      const checkItems = selectedItems.map(item => `${item.category}: ${item.item}`);
      
      if (existingChecklist) {
        await updateChecklist(existingChecklist.id, {
          checkItems: checkItems
        });
      } else {
        await createChecklist({
          equipmentType,
          checkItems: checkItems,
          createdBy: user?.name || "Администратор"
        });
      }

      toast({
        title: "Чек-лист сохранен",
        description: `Настройки для типа "${equipmentType}" успешно сохранены.`
      });
      
      setIsAdminDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить чек-лист"
      });
    }
  };

  // Обновляем элементы осмотра при выборе оборудования
  useEffect(() => {
    if (selectedEquipment) {
      const newInspectionItems = getInspectionItems(selectedEquipment);
      setInspectionItems(newInspectionItems);
    }
  }, [selectedEquipment, checklists]);

  // Сохраняем состояние в localStorage при изменении
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const storageKey = `equipment-inspections-${today}`;
    localStorage.setItem(storageKey, JSON.stringify(equipmentInspections));
  }, [equipmentInspections]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Загрузка...</div>;
  }

  if (!user) {
    return null;
  }

  // Получаем уникальные типы оборудования для фильтрации
  const equipmentTypes = Array.from(new Set(equipment.map(e => e.type)));
  const categories = ["all", "Безопасность", "Механическая часть", "Гидравлика", "Электрика", "Смазка", "Чистота"];
  const equipmentCategories = ["all", ...equipmentTypes];

  // Фильтрация оборудования
  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = categoryFilter === "all" || eq.type === categoryFilter;
    const inspection = equipmentInspections[eq.id];
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "inspected" && inspection?.status === 'completed') ||
      (statusFilter === "not_inspected" && (!inspection || inspection.status !== 'completed')) ||
      (statusFilter === "working" && (!inspection || inspection.workingStatus === 'working')) ||
      (statusFilter === "not_working" && inspection?.workingStatus === 'not_working') ||
      (statusFilter === "maintenance" && inspection?.workingStatus === 'maintenance');
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ok': return 'В норме';
      case 'attention': return 'Требует внимания';
      case 'critical': return 'Критично';
      default: return 'Неизвестно';
    }
  };

  const getEquipmentStatusBadge = (equipmentId: string) => {
    const inspection = equipmentInspections[equipmentId];
    if (!inspection) {
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">Не осмотрено</Badge>;
    }
    if (inspection.status === 'completed') {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">Осмотрено</Badge>;
    }
    if (inspection.status === 'in_progress') {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">В процессе</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">Не осмотрено</Badge>;
  };

  const getEquipmentStatusIcon = (equipmentId: string) => {
    const inspection = equipmentInspections[equipmentId];
    
    if (!inspection) {
      return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
    
    if (inspection.workingStatus === 'not_working') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (inspection.workingStatus === 'maintenance') {
      return <Settings className="h-5 w-5 text-yellow-500" />;
    }
    if (inspection.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (inspection.status === 'in_progress') {
      return <Clock className="h-5 w-5 text-blue-500" />;
    }
    return <AlertCircle className="h-5 w-5 text-gray-400" />;
  };

  const handleStartInspection = (equipmentId: string) => {
    setSelectedEquipment(equipmentId);
    setInspectionItems(prev => prev.map(item => ({
      ...item,
      checked: false,
      status: 'ok' as const,
      notes: undefined
    })));
    setIsInspectionDialogOpen(true);
  };

  const handleSaveInspection = () => {
    if (!selectedEquipment) return;

    const criticalIssues = inspectionItems.filter(item => item.status === 'critical').length;
    const attentionIssues = inspectionItems.filter(item => item.status === 'attention').length;
    const totalIssues = criticalIssues + attentionIssues;

    // Добавляем замечания в централизованную систему
    const equipmentItem = equipment.find(eq => eq.id === selectedEquipment);
    if (equipmentItem) {
      // Добавляем замечания для каждого проблемного пункта
      inspectionItems.forEach(item => {
        if ((item.status === 'critical' || item.status === 'attention') && (item.notes?.trim() || item.status === 'critical')) {
          addRemark({
            title: `Осмотр: ${item.item}`,
            description: item.notes || `Статус: ${getStatusText(item.status)}`,
            equipmentName: equipmentItem.name,
            equipmentId: equipmentItem.id,
            type: 'inspection',
            priority: item.status === 'critical' ? 'critical' : 'medium',
            status: 'open',
            reportedBy: user?.name || 'Система',
            assignedTo: 'Купцов Денис',
            notes: []
          });
        }
      });

      // Определяем общий статус работоспособности оборудования
      let workingStatus: 'working' | 'not_working' | 'maintenance' = 'working';
      if (criticalIssues > 0) {
        workingStatus = 'not_working';
      } else if (attentionIssues > 2) {
        workingStatus = 'maintenance';
      }

      // Обновляем состояние осмотра
      setEquipmentInspections(prev => ({
        ...prev,
        [selectedEquipment]: {
          equipmentId: selectedEquipment,
          status: 'completed',
          inspectedBy: user?.name || 'Неизвестно',
          inspectionDate: new Date(),
          issues: totalIssues,
          workingStatus,
          notes: inspectionItems
            .filter(item => item.notes?.trim())
            .map(item => `${item.item}: ${item.notes}`)
            .join('; ')
        }
      }));

      toast({
        title: "Осмотр завершен",
        description: `Оборудование ${equipmentItem.name} осмотрено. Обнаружено проблем: ${totalIssues}`,
      });
    }

    setIsInspectionDialogOpen(false);
    setSelectedEquipment(null);
  };

  const handleCheckAllItems = () => {
    setInspectionItems(prev => prev.map(item => ({
      ...item,
      checked: true,
      status: 'ok' as const
    })));
    
    toast({
      title: "Все пункты отмечены",
      description: "Все элементы осмотра отмечены как 'В норме'",
    });
  };

  // Статистика
  const totalEquipment = equipment.length;
  const inspectedEquipment = Object.values(equipmentInspections).filter(i => i.status === 'completed').length;
  const workingEquipment = Object.values(equipmentInspections).filter(i => i.workingStatus === 'working').length;
  const issuesFound = Object.values(equipmentInspections).reduce((sum, i) => sum + i.issues, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Ежедневные осмотры - StarLine</title>
        <meta name="description" content="Система ежедневных осмотров оборудования предприятия" />
      </Helmet>
      
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Заголовок и статистика */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Ежедневные осмотры
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
            </p>
          </div>
          
          {/* Кнопка администратора для настройки чек-листов */}
          {user?.role === 'admin' && (
            <Button
              onClick={() => setIsAdminDialogOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Настроить чек-листы
            </Button>
          )}
        </div>
        
        {/* Статистика */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalEquipment}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Всего единиц</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{inspectedEquipment}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Осмотрено</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{workingEquipment}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Работает</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{issuesFound}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Проблем</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Фильтры */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск оборудования..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Тип оборудования" />
              </SelectTrigger>
              <SelectContent>
                {equipmentCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'Все типы' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Статус осмотра" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="inspected">Осмотрено</SelectItem>
                <SelectItem value="not_inspected">Не осмотрено</SelectItem>
                <SelectItem value="working">Работает</SelectItem>
                <SelectItem value="not_working">Не работает</SelectItem>
                <SelectItem value="maintenance">Требует ТО</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                setSearchFilter("");
                setCategoryFilter("all");
                setStatusFilter("all");
              }}
              variant="outline"
            >
              <Filter className="h-4 w-4 mr-2" />
              Сбросить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Список оборудования */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((equipment) => (
          <Card 
            key={equipment.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleStartInspection(equipment.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getEquipmentStatusIcon(equipment.id)}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {equipment.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {equipment.type}
                    </p>
                    <div className="mt-1">
                      {getEquipmentStatusBadge(equipment.id)}
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartInspection(equipment.id);
                  }}
                >
                  Осмотр
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {equipmentInspections[equipment.id] && (
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {equipmentInspections[equipment.id].inspectedBy && (
                    <div>Осмотрел: {equipmentInspections[equipment.id].inspectedBy}</div>
                  )}
                  {equipmentInspections[equipment.id].issues > 0 && (
                    <div className="text-red-600 dark:text-red-400">
                      Проблем: {equipmentInspections[equipment.id].issues}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Диалог осмотра */}
      <Dialog open={isInspectionDialogOpen} onOpenChange={setIsInspectionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Осмотр оборудования</DialogTitle>
            <DialogDescription>
              {selectedEquipment && equipment.find(eq => eq.id === selectedEquipment)?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Чек-лист осмотра</h3>
              <Button onClick={handleCheckAllItems} variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Все в норме
              </Button>
            </div>

            {categories.slice(1).map(category => (
              <div key={category} className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 border-b pb-2">
                  {category}
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {inspectionItems
                    .filter(item => item.category === category)
                    .map(item => (
                      <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={item.id}
                          checked={item.checked}
                          onCheckedChange={(checked) => {
                            setInspectionItems(prev => prev.map(i => 
                              i.id === item.id ? { ...i, checked: !!checked } : i
                            ));
                          }}
                        />
                        <div className="flex-1 space-y-2">
                          <label htmlFor={item.id} className="text-sm font-medium cursor-pointer">
                            {item.item}
                          </label>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={item.status === 'ok' ? 'default' : 'outline'}
                              onClick={() => setInspectionItems(prev => prev.map(i => 
                                i.id === item.id ? { ...i, status: 'ok' } : i
                              ))}
                            >
                              В норме
                            </Button>
                            <Button
                              size="sm"
                              variant={item.status === 'attention' ? 'default' : 'outline'}
                              onClick={() => setInspectionItems(prev => prev.map(i => 
                                i.id === item.id ? { ...i, status: 'attention' } : i
                              ))}
                            >
                              Внимание
                            </Button>
                            <Button
                              size="sm"
                              variant={item.status === 'critical' ? 'destructive' : 'outline'}
                              onClick={() => setInspectionItems(prev => prev.map(i => 
                                i.id === item.id ? { ...i, status: 'critical' } : i
                              ))}
                            >
                              Критично
                            </Button>
                          </div>
                          {(item.status === 'attention' || item.status === 'critical') && (
                            <Textarea
                              placeholder="Опишите проблему..."
                              value={item.notes || ''}
                              onChange={(e) => setInspectionItems(prev => prev.map(i => 
                                i.id === item.id ? { ...i, notes: e.target.value } : i
                              ))}
                              className="mt-2"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInspectionDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveInspection}>
              Завершить осмотр
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог настройки чек-листов (только для администраторов) */}
      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Настройка чек-листов осмотров</DialogTitle>
            <DialogDescription>
              Выберите тип оборудования и настройте пункты проверки для ежедневных осмотров.
            </DialogDescription>
          </DialogHeader>
          
          <ChecklistAdminPanel
            equipmentTypes={equipmentTypes}
            defaultItems={defaultInspectionItems}
            onSave={handleSaveChecklist}
            getChecklistByType={getChecklistByEquipmentType}
          />
        </DialogContent>
      </Dialog>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
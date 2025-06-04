import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileEdit, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Equipment() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Состояния для диалогов
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);

  // Состояние формы для добавления/редактирования
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    type: "",
    status: "active",
    lastMaintenance: "",
    nextMaintenance: "",
    responsible: "",
    maintenancePeriods: [] as string[] // Массив периодичностей ТО
  });

  // Реальные данные оборудования
  const [equipmentList, setEquipmentList] = useState([
    // Фрезерные станки
    {
      id: "FM001",
      name: "Nmill 1400",
      type: "Фрезерные станки",
      status: "active",
      lastMaintenance: "15.04.2025",
      nextMaintenance: "15.06.2025",
      responsible: "Купцов Денис",
      maintenancePeriods: ["1М - ТО", "3М - ТО", "6М - ТО", "1Г - ТО"]
    },
    {
      id: "FM002",
      name: "Versa 645",
      type: "Фрезерные станки",
      status: "active",
      lastMaintenance: "10.04.2025",
      nextMaintenance: "10.06.2025",
      responsible: "Купцов Денис"
    },
    {
      id: "FM003",
      name: "Versa 823",
      type: "Фрезерные станки",
      status: "maintenance",
      lastMaintenance: "05.04.2025",
      nextMaintenance: "05.06.2025",
      responsible: "Купцов Денис"
    },
    {
      id: "FM004",
      name: "Mikron",
      type: "Фрезерные станки",
      status: "active",
      lastMaintenance: "12.04.2025",
      nextMaintenance: "12.06.2025",
      responsible: "Купцов Денис"
    },
    // Токарные станки
    {
      id: "TK001",
      name: "Seiger",
      type: "Токарный",
      status: "active",
      lastMaintenance: "08.05.2025",
      nextMaintenance: "08.07.2025",
      responsible: "Петров А.И."
    },
    // Шлифовальные станки
    {
      id: "SH001",
      name: "Z24",
      type: "Шлифовальный",
      status: "active",
      lastMaintenance: "22.04.2025",
      nextMaintenance: "22.06.2025",
      responsible: "Сидоров В.П."
    },
    {
      id: "SH002",
      name: "Z612",
      type: "Шлифовальный",
      status: "active",
      lastMaintenance: "03.05.2025",
      nextMaintenance: "03.07.2025",
      responsible: "Сидоров В.П."
    },
    {
      id: "SH003",
      name: "ZR1000",
      type: "Шлифовальный",
      status: "maintenance",
      lastMaintenance: "15.05.2025",
      nextMaintenance: "15.07.2025",
      responsible: "Сидоров В.П."
    },
    {
      id: "SH004",
      name: "Okamoto",
      type: "Шлифовальный",
      status: "active",
      lastMaintenance: "29.04.2025",
      nextMaintenance: "29.06.2025",
      responsible: "Сидоров В.П."
    },
    // Электроэрозионные станки
    {
      id: "EE001",
      name: "EA12V (2016)",
      type: "Электроэрозионный",
      status: "active",
      lastMaintenance: "12.05.2025",
      nextMaintenance: "12.07.2025",
      responsible: "Иванов К.С."
    },
    {
      id: "EE002",
      name: "EA12V (2019)",
      type: "Электроэрозионный",
      status: "active",
      lastMaintenance: "26.04.2025",
      nextMaintenance: "26.06.2025",
      responsible: "Иванов К.С."
    },
    {
      id: "EE003",
      name: "MP2400",
      type: "Электроэрозионный",
      status: "active",
      lastMaintenance: "19.05.2025",
      nextMaintenance: "19.07.2025",
      responsible: "Иванов К.С."
    },
    {
      id: "EE004",
      name: "Erowa Robot",
      type: "Электроэрозионный",
      status: "repair",
      lastMaintenance: "01.05.2025",
      nextMaintenance: "01.07.2025",
      responsible: "Иванов К.С."
    },
    {
      id: "EE005",
      name: "Start 43C",
      type: "Электроэрозионный",
      status: "active",
      lastMaintenance: "17.04.2025",
      nextMaintenance: "17.06.2025",
      responsible: "Иванов К.С."
    },
    {
      id: "EE006",
      name: "PreSet 2D+C",
      type: "Электроэрозионный",
      status: "active",
      lastMaintenance: "24.05.2025",
      nextMaintenance: "24.07.2025",
      responsible: "Иванов К.С."
    },
    // Лазерные станки
    {
      id: "LZ001",
      name: "EVO Diodeline",
      type: "Лазер",
      status: "active",
      lastMaintenance: "07.05.2025",
      nextMaintenance: "07.07.2025",
      responsible: "Николаев Д.М."
    },
    // Заготовительные станки
    {
      id: "ZG001",
      name: "Pegas",
      type: "Заготовительный",
      status: "active",
      lastMaintenance: "14.05.2025",
      nextMaintenance: "14.07.2025",
      responsible: "Морозов С.А."
    },
    // КИМ
    {
      id: "KM001",
      name: "LH87",
      type: "КИМ",
      status: "active",
      lastMaintenance: "21.05.2025",
      nextMaintenance: "21.07.2025",
      responsible: "Федоров Е.В."
    },
    // Термопосадка
    {
      id: "TP001",
      name: "BILZ",
      type: "Термопосадка",
      status: "active",
      lastMaintenance: "28.04.2025",
      nextMaintenance: "28.06.2025",
      responsible: "Волков А.Н."
    },
    // Вертикальный лифт модуль
    {
      id: "VL001",
      name: "Jungheinrich",
      type: "Верт. лифт. модуль",
      status: "maintenance",
      lastMaintenance: "11.05.2025",
      nextMaintenance: "11.07.2025",
      responsible: "Козлов П.Р."
    },
    // Сверлильные станки
    {
      id: "SV001",
      name: "UNIMAX 3AV",
      type: "Сверлильный",
      status: "active",
      lastMaintenance: "16.05.2025",
      nextMaintenance: "16.07.2025",
      responsible: "Семенов И.Л."
    },
    // Заточные станки
    {
      id: "ZT001",
      name: "Darex XT-3000",
      type: "Заточной",
      status: "active",
      lastMaintenance: "23.05.2025",
      nextMaintenance: "23.07.2025",
      responsible: "Орлов В.К."
    },
    // Универсальные станки
    {
      id: "UN001",
      name: "Токар. TU2304V",
      type: "Универсальные станки",
      status: "active",
      lastMaintenance: "30.04.2025",
      nextMaintenance: "30.06.2025",
      responsible: "Новиков Т.Ж."
    },
    {
      id: "UN002",
      name: "Лица Optisaw",
      type: "Универсальные станки",
      status: "active",
      lastMaintenance: "06.05.2025",
      nextMaintenance: "06.07.2025",
      responsible: "Новиков Т.Ж."
    },
    {
      id: "UN003",
      name: "Фрез. BF20",
      type: "Универсальные станки",
      status: "repair",
      lastMaintenance: "13.05.2025",
      nextMaintenance: "13.07.2025",
      responsible: "Новиков Т.Ж."
    },
    {
      id: "UN004",
      name: "Фрез. BF30 CNC",
      type: "Универсальные станки",
      status: "active",
      lastMaintenance: "20.05.2025",
      nextMaintenance: "20.07.2025",
      responsible: "Новиков Т.Ж."
    }
  ]);

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

  // Обработчики для форм
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEquipment = () => {
    // Генерация нового ID
    const newId = `E${String(equipmentList.length + 1).padStart(3, '0')}`;
    
    const newEquipment = {
      ...formData,
      id: newId
    };
    
    setEquipmentList(prev => [...prev, newEquipment]);
    setAddDialogOpen(false);
    
    toast({
      title: "Оборудование добавлено",
      description: `${newEquipment.name} успешно добавлено в систему`,
    });
    
    // Сброс формы
    setFormData({
      id: "",
      name: "",
      type: "",
      status: "active",
      lastMaintenance: "",
      nextMaintenance: "",
      responsible: ""
    });
  };

  const handleEditEquipment = () => {
    const updatedList = equipmentList.map(item => 
      item.id === formData.id ? formData : item
    );
    
    setEquipmentList(updatedList);
    setEditDialogOpen(false);
    
    toast({
      title: "Оборудование обновлено",
      description: `Информация о ${formData.name} успешно обновлена`,
    });
  };

  const handleDeleteEquipment = () => {
    if (!selectedEquipment) return;
    
    const updatedList = equipmentList.filter(item => item.id !== selectedEquipment.id);
    setEquipmentList(updatedList);
    setDeleteDialogOpen(false);
    
    toast({
      title: "Оборудование удалено",
      description: `${selectedEquipment.name} успешно удалено из системы`,
      variant: "destructive"
    });
    
    setSelectedEquipment(null);
  };

  const openEditDialog = (equipment: any) => {
    setSelectedEquipment(equipment);
    setFormData(equipment);
    setEditDialogOpen(true);
  };

  const openViewDialog = (equipment: any) => {
    setSelectedEquipment(equipment);
    setViewDialogOpen(true);
  };

  const openDeleteDialog = (equipment: any) => {
    setSelectedEquipment(equipment);
    setDeleteDialogOpen(true);
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'active': return 'Рабочий';
      case 'maintenance': return 'Требует ТО';
      case 'repair': return 'В ремонте';
      default: return 'Неизвестно';
    }
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'repair': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  return (
    <div className="min-h-screen flex dark:bg-gray-900">
      <Helmet>
        <title>Управление оборудованием | Система мониторинга</title>
      </Helmet>
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6 dark:bg-gray-900">
          <div className="fade-in">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Управление оборудованием</h1>
              <Button onClick={() => setAddDialogOpen(true)} className="bg-primary-600 hover:bg-primary-700">
                <PlusCircle className="mr-2 h-4 w-4" />
                Добавить оборудование
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Название</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Тип</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Статус</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Последнее ТО</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Следующее ТО</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {equipmentList.map((equipment) => (
                      <tr key={equipment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{equipment.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{equipment.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{equipment.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(equipment.status)}`}>
                            {getStatusText(equipment.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{equipment.lastMaintenance}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{equipment.nextMaintenance}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => openViewDialog(equipment)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditDialog(equipment)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <FileEdit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openDeleteDialog(equipment)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <MobileSidebar />
      
      {/* Диалог добавления оборудования */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Добавить новое оборудование</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Название
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Тип
              </Label>
              <Input
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Статус
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Рабочий</SelectItem>
                  <SelectItem value="maintenance">Требует ТО</SelectItem>
                  <SelectItem value="repair">В ремонте</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastMaintenance" className="text-right">
                Последнее ТО
              </Label>
              <Input
                id="lastMaintenance"
                name="lastMaintenance"
                value={formData.lastMaintenance}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="ДД.ММ.ГГГГ"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nextMaintenance" className="text-right">
                Следующее ТО
              </Label>
              <Input
                id="nextMaintenance"
                name="nextMaintenance"
                value={formData.nextMaintenance}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="ДД.ММ.ГГГГ"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="responsible" className="text-right">
                Ответственный
              </Label>
              <Input
                id="responsible"
                name="responsible"
                value={formData.responsible}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleAddEquipment}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Диалог редактирования оборудования */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактировать оборудование</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id" className="text-right">
                ID
              </Label>
              <Input
                id="id"
                name="id"
                value={formData.id}
                readOnly
                className="col-span-3 bg-gray-100 dark:bg-gray-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Название
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Тип
              </Label>
              <Input
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Статус
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Рабочий</SelectItem>
                  <SelectItem value="maintenance">Требует ТО</SelectItem>
                  <SelectItem value="repair">В ремонте</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastMaintenance" className="text-right">
                Последнее ТО
              </Label>
              <Input
                id="lastMaintenance"
                name="lastMaintenance"
                value={formData.lastMaintenance}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nextMaintenance" className="text-right">
                Следующее ТО
              </Label>
              <Input
                id="nextMaintenance"
                name="nextMaintenance"
                value={formData.nextMaintenance}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="responsible" className="text-right">
                Ответственный
              </Label>
              <Input
                id="responsible"
                name="responsible"
                value={formData.responsible}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleEditEquipment}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Диалог просмотра оборудования */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Информация об оборудовании</DialogTitle>
          </DialogHeader>
          {selectedEquipment && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-500 dark:text-gray-400">ID:</span>
                <span className="text-gray-900 dark:text-white">{selectedEquipment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500 dark:text-gray-400">Название:</span>
                <span className="text-gray-900 dark:text-white">{selectedEquipment.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500 dark:text-gray-400">Тип:</span>
                <span className="text-gray-900 dark:text-white">{selectedEquipment.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500 dark:text-gray-400">Статус:</span>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(selectedEquipment.status)}`}>
                  {getStatusText(selectedEquipment.status)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500 dark:text-gray-400">Последнее ТО:</span>
                <span className="text-gray-900 dark:text-white">{selectedEquipment.lastMaintenance}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500 dark:text-gray-400">Следующее ТО:</span>
                <span className="text-gray-900 dark:text-white">{selectedEquipment.nextMaintenance}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500 dark:text-gray-400">Ответственный:</span>
                <span className="text-gray-900 dark:text-white">{selectedEquipment.responsible}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Диалог удаления оборудования */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
          </DialogHeader>
          {selectedEquipment && (
            <div className="py-4">
              <p className="text-gray-700 dark:text-gray-300">
                Вы уверены, что хотите удалить оборудование "{selectedEquipment.name}"?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Это действие нельзя будет отменить.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
            <Button variant="destructive" onClick={handleDeleteEquipment}>Удалить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
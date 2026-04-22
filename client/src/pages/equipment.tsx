import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, FileEdit, Trash2, Eye, Settings, Calendar, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import EquipmentForm from "@/components/equipment-form";
import EquipmentDialogForm from "@/components/equipment-dialog-form";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Equipment() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: equipment = [] } = useQuery<any[]>({
    queryKey: ["/api/equipment"],
  });

  const createEquipmentMutation = useMutation({
    mutationFn: async (newEquipment: any) => {
      const response = await apiRequest("POST", "/api/equipment", newEquipment);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      toast({
        title: "Успешно",
        description: "Оборудование добавлено",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить оборудование",
        variant: "destructive",
      });
    },
  });

  const updateEquipmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/equipment/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      toast({
        title: "Успешно",
        description: "Оборудование обновлено",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить оборудование",
        variant: "destructive",
      });
    },
  });

  const deleteEquipmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/equipment/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      toast({
        title: "Успешно",
        description: "Оборудование удалено",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить оборудование",
        variant: "destructive",
      });
    },
  });

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    type: "",
    description: "",
    status: "active",
    lastMaintenance: "",
    nextMaintenance: "",
    responsible: "",
    maintenancePeriods: [] as string[],
  });

  const [customType, setCustomType] = useState("");
  const [isCustomType, setIsCustomType] = useState(false);

  const maintenancePeriodOptions = [
    { value: "1М - ТО", label: "1М - ТО (ежемесячно)" },
    { value: "3М - ТО", label: "3М - ТО (раз в 3 месяца)" },
    { value: "6М - ТО", label: "6М - ТО (раз в 6 месяцев)" },
    { value: "1Г - ТО", label: "1Г - ТО (ежегодно)" },
  ];

  const equipmentTypes = [
    "Фрезерные станки",
    "Шлифовальные станки",
    "Токарные станки",
    "Электроэрозия",
    "Измерительное",
    "Автоматизация",
    "Вспомогательное",
    "Складское",
    "Заточные станки",
    "Отрезные станки",
  ];

  const responsibleOptions = ["Купцов Денис", "Калюжный Никита", "Пырихин Илья"];

  useEffect(() => {
    if (!isLoading && !isAuthenticated()) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  const resetForm = useCallback(() => {
    setFormData({
      id: "",
      name: "",
      type: "",
      description: "",
      status: "active",
      lastMaintenance: "",
      nextMaintenance: "",
      responsible: "",
      maintenancePeriods: [],
    });
    setCustomType("");
    setIsCustomType(false);
  }, []);

  const openAddDialog = useCallback(() => {
    resetForm();
    setAddDialogOpen(true);
  }, [resetForm]);

  const openEditDialog = useCallback(
    (equipmentItem: any) => {
      setSelectedEquipment(equipmentItem);

      const isCustomEquipmentType = !equipmentTypes.includes(equipmentItem.type);
      setIsCustomType(isCustomEquipmentType);
      setCustomType(isCustomEquipmentType ? equipmentItem.type : "");

      setFormData({
        id: equipmentItem.id,
        name: equipmentItem.name,
        type: equipmentItem.type,
        description: equipmentItem.description || "",
        status: equipmentItem.status,
        lastMaintenance: equipmentItem.lastMaintenance,
        nextMaintenance: equipmentItem.nextMaintenance,
        responsible: equipmentItem.responsible,
        maintenancePeriods: equipmentItem.maintenancePeriods || [],
      });

      setEditDialogOpen(true);
    },
    [equipmentTypes],
  );

  const openViewDialog = useCallback((equipmentItem: any) => {
    setSelectedEquipment(equipmentItem);
    setViewDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((equipmentItem: any) => {
    setSelectedEquipment(equipmentItem);
    setDeleteDialogOpen(true);
  }, []);

  const handleAddEquipment = useCallback(() => {
    if (!formData.name || !formData.type || !formData.responsible) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    const newId = `EQ${String(equipment.length + 1).padStart(3, "0")}`;
    const newEquipment = {
      ...formData,
      id: newId,
      department: "",
      status: formData.status as "active" | "maintenance" | "inactive",
    };

    createEquipmentMutation.mutate(newEquipment);
    setAddDialogOpen(false);
    resetForm();
  }, [createEquipmentMutation, equipment.length, formData, resetForm, toast]);

  const handleEditEquipment = useCallback(() => {
    if (!selectedEquipment) return;

    const updatedData = {
      ...formData,
      status: formData.status as "active" | "maintenance" | "inactive",
    };

    updateEquipmentMutation.mutate({ id: selectedEquipment.id, data: updatedData });
    setEditDialogOpen(false);
    setSelectedEquipment(null);
    resetForm();
  }, [formData, resetForm, selectedEquipment, updateEquipmentMutation]);

  const handleDeleteEquipment = useCallback(() => {
    if (!selectedEquipment) return;
    deleteEquipmentMutation.mutate(selectedEquipment.id);
    setDeleteDialogOpen(false);
    setSelectedEquipment(null);
  }, [deleteEquipmentMutation, selectedEquipment]);

  const handleMaintenancePeriodChange = useCallback((period: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      maintenancePeriods: checked
        ? [...prev.maintenancePeriods, period]
        : prev.maintenancePeriods.filter((p) => p !== period),
    }));
  }, []);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  }, []);

  const handleCustomTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomType(value);
    setFormData((prev) => ({
      ...prev,
      type: value,
    }));
  }, []);

  const handleFormFieldChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
            Активно
          </Badge>
        );
      case "maintenance":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
            ТО
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
            Неактивно
          </Badge>
        );
      case "decommissioned":
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
            Выведено из эксплуатации
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
            {status}
          </Badge>
        );
    }
  };

  const getPeriodBadge = (period: string) => {
    const colors = {
      "1М - ТО": "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
      "3М - ТО": "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
      "6М - ТО": "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100",
      "1Г - ТО": "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
    };

    return (
      <Badge key={period} className={`text-xs ${colors[period as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}>
        {period}
      </Badge>
    );
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Оборудование - Система управления оборудованием</title>
        <meta
          name="description"
          content="Управление оборудованием и настройка периодичности технического обслуживания"
        />
      </Helmet>

      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
          <Header />

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Оборудование</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Управление оборудованием и настройка периодичности ТО
                  </p>
                </div>

                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Добавить оборудование
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Добавить новое оборудование</DialogTitle>
                      <DialogDescription>
                        Заполните информацию о новом оборудовании и настройте периодичность ТО
                      </DialogDescription>
                    </DialogHeader>
                    <EquipmentDialogForm
                      formData={formData}
                      customType={customType}
                      isCustomType={isCustomType}
                      setIsCustomType={setIsCustomType}
                      handleFormFieldChange={handleFormFieldChange}
                      handleNameChange={handleNameChange}
                      handleCustomTypeChange={handleCustomTypeChange}
                      handleDescriptionChange={handleDescriptionChange}
                      handleMaintenancePeriodChange={handleMaintenancePeriodChange}
                      handleAddEquipment={handleAddEquipment}
                      handleEditEquipment={handleEditEquipment}
                      resetForm={resetForm}
                      setAddDialogOpen={setAddDialogOpen}
                      setEditDialogOpen={setEditDialogOpen}
                      equipmentTypes={equipmentTypes}
                      responsibleOptions={responsibleOptions}
                      maintenancePeriodOptions={maintenancePeriodOptions}
                      getPeriodBadge={getPeriodBadge}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Settings className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Всего оборудования</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{equipment.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Активно</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {equipment.filter((eq) => eq.status === "active").length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">На ТО</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {equipment.filter((eq) => eq.status === "maintenance").length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Settings className="h-8 w-8 text-red-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Неактивно</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {equipment.filter((eq) => eq.status === "inactive").length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Список оборудования</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left p-4 font-medium text-gray-900 dark:text-gray-100">ID</th>
                          <th className="text-left p-4 font-medium text-gray-900 dark:text-gray-100">Название</th>
                          <th className="text-left p-4 font-medium text-gray-900 dark:text-gray-100">Тип</th>
                          <th className="text-left p-4 font-medium text-gray-900 dark:text-gray-100">Статус</th>
                          <th className="text-left p-4 font-medium text-gray-900 dark:text-gray-100">Периодичность ТО</th>
                          <th className="text-left p-4 font-medium text-gray-900 dark:text-gray-100">Ответственный</th>
                          <th className="text-left p-4 font-medium text-gray-900 dark:text-gray-100">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {equipment.map((equipmentItem) => (
                          <tr
                            key={equipmentItem.id}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="p-4 text-gray-900 dark:text-gray-100 font-mono text-sm">{equipmentItem.id}</td>
                            <td className="p-4 text-gray-900 dark:text-gray-100 font-medium">{equipmentItem.name}</td>
                            <td className="p-4 text-gray-600 dark:text-gray-400">{equipmentItem.type}</td>
                            <td className="p-4">{getStatusBadge(equipmentItem.status)}</td>
                            <td className="p-4">
                              <div className="flex gap-1 flex-wrap">
                                {equipmentItem.maintenancePeriods?.map((period: string) => getPeriodBadge(period)) || (
                                  <span className="text-gray-400 text-sm">Не настроено</span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-gray-600 dark:text-gray-400">{equipmentItem.responsible}</td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => openViewDialog(equipmentItem)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => openEditDialog(equipmentItem)}>
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDeleteDialog(equipmentItem)}
                                  className="text-red-600 hover:text-red-700"
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
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать оборудование</DialogTitle>
            <DialogDescription>Измените информацию об оборудовании и настройки периодичности ТО</DialogDescription>
          </DialogHeader>
          <EquipmentForm
            initialData={selectedEquipment}
            onSave={(data) => {
              updateEquipmentMutation.mutate({ id: selectedEquipment.id, data });
              setEditDialogOpen(false);
              setSelectedEquipment(null);
            }}
            onCancel={() => {
              setEditDialogOpen(false);
              setSelectedEquipment(null);
            }}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Информация об оборудовании</DialogTitle>
            <DialogDescription>Подробная информация об оборудовании и настройках ТО</DialogDescription>
          </DialogHeader>
          {selectedEquipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">ID:</Label>
                  <p className="text-gray-600 dark:text-gray-400">{selectedEquipment.id}</p>
                </div>
                <div>
                  <Label className="font-medium">Название:</Label>
                  <p className="text-gray-600 dark:text-gray-400">{selectedEquipment.name}</p>
                </div>
                <div>
                  <Label className="font-medium">Тип:</Label>
                  <p className="text-gray-600 dark:text-gray-400">{selectedEquipment.type}</p>
                </div>
                <div>
                  <Label className="font-medium">Статус:</Label>
                  <div className="mt-1">{getStatusBadge(selectedEquipment.status)}</div>
                </div>
              </div>

              {selectedEquipment.description && (
                <div>
                  <Label className="font-medium">Описание:</Label>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedEquipment.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Последнее ТО:</Label>
                  <p className="text-gray-600 dark:text-gray-400">{selectedEquipment.lastMaintenance || "Не указано"}</p>
                </div>
                <div>
                  <Label className="font-medium">Следующее ТО:</Label>
                  <p className="text-gray-600 dark:text-gray-400">{selectedEquipment.nextMaintenance || "Не указано"}</p>
                </div>
                <div>
                  <Label className="font-medium">Ответственный:</Label>
                  <p className="text-gray-600 dark:text-gray-400">{selectedEquipment.responsible}</p>
                </div>
              </div>

              <div>
                <Label className="font-medium">Периодичность ТО:</Label>
                <div className="flex gap-2 flex-wrap mt-2">
                  {selectedEquipment.maintenancePeriods?.length > 0 ? (
                    selectedEquipment.maintenancePeriods.map((period: string) => getPeriodBadge(period))
                  ) : (
                    <span className="text-gray-400">Не настроено</span>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить оборудование</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить это оборудование? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          {selectedEquipment && (
            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-400">
                <strong>{selectedEquipment.name}</strong> ({selectedEquipment.id})
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteEquipment}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
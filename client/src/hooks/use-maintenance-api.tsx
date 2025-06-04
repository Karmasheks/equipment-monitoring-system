import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export function useMaintenanceApi() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Загрузка всех записей ТО
  const { data: maintenanceRecords = [], isLoading, error } = useQuery({
    queryKey: ['/api/maintenance'],
  });

  // Создание новой записи ТО
  const addMaintenanceMutation = useMutation({
    mutationFn: async (newRecord: any) => {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...newRecord,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка создания записи ТО');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance'] });
      toast({
        title: "Успешно",
        description: "Запись ТО создана",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать запись ТО",
        variant: "destructive",
      });
    },
  });

  // Обновление записи ТО
  const updateMaintenanceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...updates,
          updatedAt: new Date(),
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка обновления записи ТО');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance'] });
      toast({
        title: "Успешно",
        description: "Запись ТО обновлена",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить запись ТО",
        variant: "destructive",
      });
    },
  });

  // Удаление записи ТО
  const deleteMaintenanceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления записи ТО');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance'] });
      toast({
        title: "Успешно",
        description: "Запись ТО удалена",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить запись ТО",
        variant: "destructive",
      });
    },
  });

  // Функции фильтрации
  const getMaintenanceByStatus = (status: string) => 
    maintenanceRecords.filter((record: any) => record.status === status);

  const getMaintenanceByEquipment = (equipmentId: string) =>
    maintenanceRecords.filter((record: any) => record.equipmentId === equipmentId);

  const getMaintenanceByDateRange = (startDate: Date, endDate: Date) =>
    maintenanceRecords.filter((record: any) => {
      const recordDate = new Date(record.scheduledDate);
      return recordDate >= startDate && recordDate <= endDate;
    });

  return {
    maintenanceRecords,
    isLoading,
    error,
    addMaintenance: addMaintenanceMutation.mutate,
    updateMaintenance: updateMaintenanceMutation.mutate,
    deleteMaintenance: deleteMaintenanceMutation.mutate,
    isAddingMaintenance: addMaintenanceMutation.isPending,
    isUpdatingMaintenance: updateMaintenanceMutation.isPending,
    isDeletingMaintenance: deleteMaintenanceMutation.isPending,
    getMaintenanceByStatus,
    getMaintenanceByEquipment,
    getMaintenanceByDateRange,
  };
}
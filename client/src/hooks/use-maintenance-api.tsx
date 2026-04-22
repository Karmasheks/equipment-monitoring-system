import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { MaintenanceRecord, InsertMaintenanceRecord } from '../../../shared/schema';

export function useMaintenanceApi() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Загрузка всех записей ТО
  const { data: maintenanceRecords = [], isLoading, error } = useQuery<MaintenanceRecord[]>({
    queryKey: ['/api/maintenance'],
  });

  // Создание новой записи ТО
  const addMaintenanceMutation = useMutation({
    mutationFn: async (newRecord: InsertMaintenanceRecord) => {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...newRecord,
          // Ensure dates are ISO strings, not Date objects
          scheduledDate: newRecord.scheduledDate instanceof Date 
            ? newRecord.scheduledDate.toISOString() 
            : newRecord.scheduledDate,
          completedDate: newRecord.completedDate instanceof Date
            ? newRecord.completedDate.toISOString()
            : newRecord.completedDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка создания записи ТО');
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
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать запись ТО",
        variant: "destructive",
      });
    },
  });

  // Обновление записи ТО
  const updateMaintenanceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<MaintenanceRecord> }) => {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...updates,
          // Ensure dates are ISO strings, not Date objects
          scheduledDate: updates.scheduledDate instanceof Date 
            ? updates.scheduledDate.toISOString() 
            : updates.scheduledDate,
          completedDate: updates.completedDate instanceof Date
            ? updates.completedDate.toISOString()
            : updates.completedDate,
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка обновления записи ТО');
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
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить запись ТО",
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
        const error = await response.json();
        throw new Error(error.message || 'Ошибка удаления записи ТО');
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
    maintenanceRecords.filter((record: MaintenanceRecord) => record.status === status);

  const getMaintenanceByEquipment = (equipmentId: string) =>
    maintenanceRecords.filter((record: MaintenanceRecord) => record.equipmentId === equipmentId);

  const getMaintenanceByDateRange = (startDate: Date, endDate: Date) =>
    maintenanceRecords.filter((record: MaintenanceRecord) => {
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
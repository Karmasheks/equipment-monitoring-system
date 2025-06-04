import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface DailyInspection {
  id: number;
  equipmentId: string;
  equipmentName: string;
  inspectionDate: string;
  inspectedBy: string;
  status: 'completed' | 'in_progress' | 'not_started';
  workingStatus: 'working' | 'not_working' | 'maintenance';
  issues: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertDailyInspection {
  equipmentId: string;
  equipmentName: string;
  inspectionDate: string;
  inspectedBy: string;
  status: 'completed' | 'in_progress' | 'not_started';
  workingStatus: 'working' | 'not_working' | 'maintenance';
  issues: number;
  notes?: string;
}

export function useDailyInspections() {
  const queryClient = useQueryClient();

  // Получение всех ежедневных осмотров
  const { data: inspections = [], isLoading, error, refetch } = useQuery<DailyInspection[]>({
    queryKey: ['/api/daily-inspections'],
  });

  // Создание нового осмотра
  const createInspectionMutation = useMutation({
    mutationFn: async (inspection: InsertDailyInspection): Promise<DailyInspection> => {
      const response = await fetch('/api/daily-inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspection),
      });
      if (!response.ok) throw new Error('Failed to create inspection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-inspections'] });
      // Отправляем событие для синхронизации дашборда
      window.dispatchEvent(new CustomEvent('dailyInspectionsUpdated'));
    },
  });

  // Обновление осмотра
  const updateInspectionMutation = useMutation({
    mutationFn: async ({ id, ...inspection }: Partial<InsertDailyInspection> & { id: number }): Promise<DailyInspection> => {
      const response = await fetch(`/api/daily-inspections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspection),
      });
      if (!response.ok) throw new Error('Failed to update inspection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-inspections'] });
      window.dispatchEvent(new CustomEvent('dailyInspectionsUpdated'));
    },
  });

  // Удаление осмотра
  const deleteInspectionMutation = useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const response = await fetch(`/api/daily-inspections/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete inspection');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-inspections'] });
      window.dispatchEvent(new CustomEvent('dailyInspectionsUpdated'));
    },
  });

  // Получение осмотров по дате
  const getInspectionsByDate = (date: Date): DailyInspection[] => {
    const targetDate = date.toISOString().split('T')[0];
    return inspections.filter(inspection => 
      inspection.inspectionDate.split('T')[0] === targetDate
    );
  };

  // Получение сегодняшних осмотров
  const getTodayInspections = (): DailyInspection[] => {
    return getInspectionsByDate(new Date());
  };

  // Получение статистики осмотров за сегодня
  const getTodayStats = () => {
    const todayInspections = getTodayInspections();
    const uniqueEquipmentIds = new Set(todayInspections.map(i => i.equipmentId));
    
    return {
      totalInspected: uniqueEquipmentIds.size,
      totalIssues: todayInspections.reduce((sum, i) => sum + i.issues, 0),
      notWorking: todayInspections.filter(i => i.workingStatus === 'not_working').length,
      onMaintenance: todayInspections.filter(i => i.workingStatus === 'maintenance').length,
      working: todayInspections.filter(i => i.workingStatus === 'working').length,
    };
  };

  return {
    inspections,
    isLoading,
    error,
    refetch,
    createInspection: createInspectionMutation.mutate,
    updateInspection: updateInspectionMutation.mutate,
    deleteInspection: deleteInspectionMutation.mutate,
    isCreating: createInspectionMutation.isPending,
    isUpdating: updateInspectionMutation.isPending,
    isDeleting: deleteInspectionMutation.isPending,
    getInspectionsByDate,
    getTodayInspections,
    getTodayStats,
  };
}
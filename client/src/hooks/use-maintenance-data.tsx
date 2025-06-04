import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface MaintenanceRecord {
  id: number;
  equipmentId: string;
  equipmentName: string;
  maintenanceType: string;
  scheduledDate: Date;
  completedDate?: Date;
  responsible: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'postponed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  duration?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MaintenanceContextType {
  maintenanceRecords: MaintenanceRecord[];
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id'>) => Promise<void>;
  updateMaintenanceRecord: (id: number, updates: Partial<MaintenanceRecord>) => Promise<void>;
  deleteMaintenanceRecord: (id: number) => Promise<void>;
  getMaintenanceByEquipment: (equipmentName: string) => MaintenanceRecord[];
  getMaintenanceByStatus: (status: string) => MaintenanceRecord[];
  getMaintenanceByDateRange: (startDate: Date, endDate: Date) => MaintenanceRecord[];
  generateFromSchedule: (scheduleData: any[]) => Promise<void>;
  refreshData: () => Promise<void>;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);

  const loadMaintenanceRecords = async () => {
    try {
      const response = await fetch('/api/maintenance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMaintenanceRecords(data.map((record: any) => ({
          ...record,
          scheduledDate: new Date(record.scheduledDate || record.scheduled_date),
          completedDate: record.completedDate ? new Date(record.completedDate || record.completed_date) : undefined,
          createdAt: new Date(record.createdAt || record.created_at),
          updatedAt: new Date(record.updatedAt || record.updated_at),
        })));
      }
    } catch (error) {
      console.error('Ошибка загрузки записей ТО:', error);
    }
  };

  useEffect(() => {
    loadMaintenanceRecords();
  }, []);

  const addMaintenanceRecord = async (newRecord: Omit<MaintenanceRecord, 'id'>) => {
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRecord),
      });

      if (response.ok) {
        const createdRecord = await response.json();
        const formattedRecord = {
          ...createdRecord,
          scheduledDate: new Date(createdRecord.scheduledDate || createdRecord.scheduled_date),
          completedDate: createdRecord.completedDate ? new Date(createdRecord.completedDate || createdRecord.completed_date) : undefined,
          createdAt: new Date(createdRecord.createdAt || createdRecord.created_at),
          updatedAt: new Date(createdRecord.updatedAt || createdRecord.updated_at),
        };
        setMaintenanceRecords(prev => [...prev, formattedRecord]);
        
        // Уведомляем другие компоненты об изменении данных
        window.dispatchEvent(new CustomEvent('maintenanceDataChanged'));
      } else {
        console.error('Ошибка создания записи ТО');
      }
    } catch (error) {
      console.error('Ошибка подключения к серверу:', error);
    }
  };

  const updateMaintenanceRecord = async (id: number, updates: Partial<MaintenanceRecord>) => {
    try {
      // Преобразуем даты в правильный формат для сервера
      const formattedUpdates = {
        ...updates,
        scheduledDate: updates.scheduledDate instanceof Date 
          ? updates.scheduledDate.toISOString() 
          : updates.scheduledDate,
        completedDate: updates.completedDate instanceof Date 
          ? updates.completedDate.toISOString() 
          : updates.completedDate,
      };

      const response = await fetch(`/api/maintenance/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedUpdates),
      });

      if (response.ok) {
        const updatedRecord = await response.json();
        setMaintenanceRecords(prev => prev.map(record =>
          record.id === id ? {
            ...updatedRecord,
            scheduledDate: new Date(updatedRecord.scheduledDate || updatedRecord.scheduled_date),
            completedDate: updatedRecord.completedDate ? new Date(updatedRecord.completedDate || updatedRecord.completed_date) : undefined,
            createdAt: new Date(updatedRecord.createdAt || updatedRecord.created_at),
            updatedAt: new Date(updatedRecord.updatedAt || updatedRecord.updated_at),
          } : record
        ));
        
        // Уведомляем другие компоненты об изменении
        window.dispatchEvent(new CustomEvent('maintenanceDataChanged'));
      } else {
        console.error('Ошибка обновления записи ТО');
      }
    } catch (error) {
      console.error('Ошибка подключения к серверу:', error);
    }
  };

  const deleteMaintenanceRecord = async (id: number) => {
    try {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setMaintenanceRecords(prev => prev.filter(record => record.id !== id));
      } else {
        console.error('Ошибка удаления записи ТО');
      }
    } catch (error) {
      console.error('Ошибка подключения к серверу:', error);
    }
  };

  const getMaintenanceByEquipment = (equipmentName: string) => {
    return maintenanceRecords.filter(record => record.equipmentName === equipmentName);
  };

  const getMaintenanceByStatus = (status: string) => {
    return maintenanceRecords.filter(record => record.status === status);
  };

  const getMaintenanceByDateRange = (startDate: Date, endDate: Date) => {
    return maintenanceRecords.filter(record => {
      const recordDate = new Date(record.scheduledDate);
      return recordDate >= startDate && recordDate <= endDate;
    });
  };

  const generateFromSchedule = async (scheduleData: any[]) => {
    // Загружаем список оборудования для получения ID по имени
    try {
      const response = await fetch('/api/equipment', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const equipmentList = await response.json();
        let createdCount = 0;
        
        for (const item of scheduleData) {
          // Находим оборудование по имени, чтобы получить его ID
          const equipment = equipmentList.find((eq: any) => eq.name === item.equipmentName);
          
          if (equipment) {
            // Проверяем, существует ли уже такая запись ТО
            const existingRecord = maintenanceRecords.find(record => 
              record.equipmentId === equipment.id &&
              record.maintenanceType === item.type &&
              new Date(record.scheduledDate).toDateString() === new Date(item.scheduledDate || item.date).toDateString()
            );

            if (!existingRecord) {
              const newRecord: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'> = {
                equipmentId: equipment.id,
                equipmentName: item.equipmentName,
                maintenanceType: item.type,
                scheduledDate: new Date(item.scheduledDate || item.date),
                duration: item.duration || '2 часа',
                responsible: item.responsible,
                status: 'scheduled',
                priority: 'medium',
              };
              await addMaintenanceRecord(newRecord);
              createdCount++;
            }
          } else {
            console.warn(`Оборудование "${item.equipmentName}" не найдено в базе данных`);
          }
        }
        
        // Обновляем данные после создания всех записей
        await loadMaintenanceRecords();
        
        if (createdCount > 0) {
          console.log(`Создано ${createdCount} новых записей ТО`);
        } else {
          console.log('Все записи уже существуют, дубликаты не созданы');
        }
      }
    } catch (error) {
      console.error('Ошибка при создании записей ТО из расписания:', error);
    }
  };

  const refreshData = async () => {
    await loadMaintenanceRecords();
  };

  const value: MaintenanceContextType = {
    maintenanceRecords,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    getMaintenanceByEquipment,
    getMaintenanceByStatus,
    getMaintenanceByDateRange,
    generateFromSchedule,
    refreshData,
  };

  return (
    <MaintenanceContext.Provider value={value}>
      {children}
    </MaintenanceContext.Provider>
  );
}

export function useMaintenanceData() {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenanceData must be used within a MaintenanceProvider');
  }
  return context;
}
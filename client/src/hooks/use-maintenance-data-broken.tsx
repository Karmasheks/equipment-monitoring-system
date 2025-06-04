import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface MaintenanceRecord {
  id: number;
  equipmentName: string;
  type: string;
  date: Date;
  duration: string;
  responsible: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'postponed';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface MaintenanceContextType {
  maintenanceRecords: MaintenanceRecord[];
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id'>) => void;
  updateMaintenanceRecord: (id: number, updates: Partial<MaintenanceRecord>) => void;
  deleteMaintenanceRecord: (id: number) => void;
  getMaintenanceByEquipment: (equipmentName: string) => MaintenanceRecord[];
  getMaintenanceByStatus: (status: string) => MaintenanceRecord[];
  getMaintenanceByDateRange: (startDate: Date, endDate: Date) => MaintenanceRecord[];
  refreshData: () => void;
}

// Данные ТО теперь управляются через интерфейс - начинаем с пустой базы
const initialMaintenanceData: MaintenanceRecord[] = [];
    priority: "medium"
  },
  {
    id: 4,
    equipmentName: "Mikron XSM 600U",
    type: "1М - ТО",
    date: new Date(2025, 1, 15),
    duration: "2 часа",
    responsible: "Купцов Денис",
    status: "completed",
    priority: "medium"
  },
  // МАРТ 2025
  {
    id: 5,
    equipmentName: "ZR1000",
    type: "1М - ТО",
    date: new Date(2025, 2, 18),
    duration: "2 часа",
    responsible: "Купцов Денис",
    status: "completed",
    priority: "medium"
  },
  {
    id: 6,
    equipmentName: "Z24",
    type: "1М - ТО", 
    date: new Date(2025, 2, 22),
    duration: "2 часа",
    responsible: "Купцов Денис",
    status: "completed",
    priority: "medium"
  },
  // АПРЕЛЬ 2025
  {
    id: 7,
    equipmentName: "Z612",
    type: "1М - ТО",
    date: new Date(2025, 3, 25),
    duration: "2 часа",
    responsible: "Купцов Денис",
    status: "completed",
    priority: "medium"
  },
  {
    id: 8,
    equipmentName: "Okamoto",
    type: "1М - ТО",
    date: new Date(2025, 3, 14),
    duration: "2 часа",
    responsible: "Купцов Денис",
    status: "completed",
    priority: "medium"
  },
  // МАЙ 2025 - ЗАПЛАНИРОВАННЫЕ
  {
    id: 9,
    equipmentName: "ZR1000",
    type: "1М - ТО",
    date: new Date(2025, 4, 18),
    duration: "2 часа",
    responsible: "Купцов Денис",
    status: "scheduled",
    priority: "medium"
  },
  {
    id: 10,
    equipmentName: "Z24",
    type: "1М - ТО",
    date: new Date(2025, 4, 22),
    duration: "2 часа",
    responsible: "Купцов Денис", 
    status: "scheduled",
    priority: "medium"
  },
  {
    id: 11,
    equipmentName: "Nmill 1400",
    type: "3М - ТО",
    date: new Date(2025, 4, 20),
    duration: "4 часа",
    responsible: "Купцов Денис",
    status: "scheduled",
    priority: "high"
  }
];

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('maintenance-data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((record: any) => ({
          ...record,
          date: new Date(record.date)
        }));
      }
    } catch (error) {
      console.error('Error loading maintenance data from localStorage:', error);
    }
    return initialMaintenanceData;
  });

  useEffect(() => {
    try {
      localStorage.setItem('maintenance-data', JSON.stringify(maintenanceRecords));
      console.log('Maintenance data saved to localStorage');
    } catch (error) {
      console.error('Failed to save maintenance data:', error);
    }
  }, [maintenanceRecords]);

  const addMaintenanceRecord = (newRecord: Omit<MaintenanceRecord, 'id'>) => {
    const id = Math.max(...maintenanceRecords.map(r => r.id), 0) + 1;
    const recordWithId: MaintenanceRecord = { ...newRecord, id };
    setMaintenanceRecords(prev => [...prev, recordWithId]);
  };

  const updateMaintenanceRecord = (id: number, updates: Partial<MaintenanceRecord>) => {
    setMaintenanceRecords(prev => prev.map(record => 
      record.id === id ? { ...record, ...updates } : record
    ));
  };

  const deleteMaintenanceRecord = (id: number) => {
    setMaintenanceRecords(prev => prev.filter(record => record.id !== id));
  };

  const getMaintenanceByEquipment = (equipmentName: string) => {
    return maintenanceRecords.filter(record => record.equipmentName === equipmentName);
  };

  const getMaintenanceByStatus = (status: string) => {
    return maintenanceRecords.filter(record => record.status === status);
  };

  const getMaintenanceByDateRange = (startDate: Date, endDate: Date) => {
    return maintenanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });
  };

  const refreshData = () => {
    setMaintenanceRecords([...maintenanceRecords]);
  };

  const value: MaintenanceContextType = {
    maintenanceRecords,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    getMaintenanceByEquipment,
    getMaintenanceByStatus,
    getMaintenanceByDateRange,
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
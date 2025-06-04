import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Equipment {
  id: string;
  name: string;
  type: string;
  description?: string;
  status: 'active' | 'maintenance' | 'inactive' | 'decommissioned';
  lastMaintenance: string;
  nextMaintenance: string;
  responsible: string;
  maintenancePeriods: string[];
  department: string;
}

interface EquipmentContextType {
  equipment: Equipment[];
  addEquipment: (equipment: Omit<Equipment, 'id'>) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  getEquipmentByType: (type: string) => Equipment[];
  getEquipmentByStatus: (status: string) => Equipment[];
  getActiveEquipment: () => Equipment[]; // Исключает выведенное из эксплуатации
  refreshData: () => void;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

// Реальные данные оборудования (единая версия для всего проекта)
const initialEquipmentData: Equipment[] = [
  // Фрезерные станки
  {
    id: "FM001",
    name: "Nmill 1400",
    type: "Фрезерные станки",
    status: "active",
    lastMaintenance: "15.04.2025",
    nextMaintenance: "15.06.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "3М - ТО", "6М - ТО", "1Г - ТО"],
    department: ""
  },
  {
    id: "FM002",
    name: "Versa 645",
    type: "Фрезерные станки",
    status: "active",
    lastMaintenance: "10.04.2025",
    nextMaintenance: "10.07.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "3М - ТО", "6М - ТО"],
    department: ""
  },
  {
    id: "FM003",
    name: "Versa 823",
    type: "Фрезерные станки",
    status: "active",
    lastMaintenance: "20.04.2025",
    nextMaintenance: "20.07.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "3М - ТО", "6М - ТО"],
    department: ""
  },
  {
    id: "FM004",
    name: "Mikron",
    type: "Фрезерные станки",
    status: "active",
    lastMaintenance: "05.04.2025",
    nextMaintenance: "05.05.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "6М - ТО", "1Г - ТО"],
    department: ""
  },
  {
    id: "FM005",
    name: "Фрез. BF20",
    type: "Фрезерные станки",
    status: "active",
    lastMaintenance: "12.04.2025",
    nextMaintenance: "12.05.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "3М - ТО"],
    department: ""
  },
  {
    id: "FM006",
    name: "Фрез. BF30 CNC",
    type: "Фрезерные станки",
    status: "active",
    lastMaintenance: "08.04.2025",
    nextMaintenance: "08.05.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "3М - ТО", "6М - ТО"],
    department: ""
  },

  // Шлифовальные станки
  {
    id: "GR001",
    name: "ZR1000",
    type: "Шлифовальные станки",
    status: "active",
    lastMaintenance: "18.04.2025",
    nextMaintenance: "18.05.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "3М - ТО", "6М - ТО"],
    department: ""
  },
  {
    id: "GR002",
    name: "Z24",
    type: "Шлифовальные станки",
    status: "active",
    lastMaintenance: "22.04.2025",
    nextMaintenance: "22.05.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "3М - ТО"],
    department: ""
  },
  {
    id: "GR003",
    name: "Z612",
    type: "Шлифовальные станки",
    status: "active",
    lastMaintenance: "25.04.2025",
    nextMaintenance: "25.05.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "3М - ТО", "6М - ТО"],
    department: ""
  },
  {
    id: "GR004",
    name: "Okamoto",
    type: "Шлифовальные станки",
    status: "active",
    lastMaintenance: "14.04.2025",
    nextMaintenance: "14.05.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "6М - ТО", "1Г - ТО"],
    department: ""
  },
  {
    id: "GR005",
    name: "Seiger",
    type: "Шлифовальные станки",
    status: "active",
    lastMaintenance: "16.04.2025",
    nextMaintenance: "16.05.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "3М - ТО"],
    department: ""
  },

  // Токарные станки
  {
    id: "LT001",
    name: "Токар. TU2304V",
    type: "Токарные станки",
    status: "active",
    lastMaintenance: "11.04.2025",
    nextMaintenance: "11.05.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "3М - ТО", "6М - ТО", "1Г - ТО"],
    department: ""
  },

  // Электроэрозионное оборудование
  {
    id: "EDM001",
    name: "EA12V (2016)",
    type: "Электроэрозия",
    status: "active",
    lastMaintenance: "28.04.2025",
    nextMaintenance: "28.05.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "3М - ТО", "6М - ТО"],
    department: ""
  },
  {
    id: "EDM002",
    name: "EA12V (2019)",
    type: "Электроэрозия",
    status: "active",
    lastMaintenance: "30.04.2025",
    nextMaintenance: "30.05.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "3М - ТО", "6М - ТО"],
    department: ""
  },
  {
    id: "EDM003",
    name: "MP2400",
    type: "Электроэрозия",
    status: "active",
    lastMaintenance: "02.05.2025",
    nextMaintenance: "02.06.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "6М - ТО"],
    department: ""
  },
  {
    id: "EDM004",
    name: "Start 43C",
    type: "Электроэрозия",
    status: "active",
    lastMaintenance: "06.05.2025",
    nextMaintenance: "06.06.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "3М - ТО"],
    department: ""
  },
  {
    id: "EDM005",
    name: "EVO Diodeline",
    type: "Электроэрозия",
    status: "active",
    lastMaintenance: "08.05.2025",
    nextMaintenance: "08.06.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "3М - ТО", "6М - ТО"],
    department: ""
  },

  // Измерительное и настроечное оборудование
  {
    id: "MEAS001",
    name: "PreSet 2D+C",
    type: "Измерительное",
    status: "active",
    lastMaintenance: "09.05.2025",
    nextMaintenance: "09.06.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "6М - ТО"],
    department: ""
  },
  {
    id: "AUTO001",
    name: "Erowa Robot",
    type: "Автоматизация",
    status: "active",
    lastMaintenance: "12.05.2025",
    nextMaintenance: "12.06.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "3М - ТО", "6М - ТО", "1Г - ТО"],
    department: ""
  },
  {
    id: "MEAS002",
    name: "Pegas",
    type: "Измерительное",
    status: "active",
    lastMaintenance: "15.05.2025",
    nextMaintenance: "15.06.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "3М - ТО"],
    department: ""
  },

  // Вспомогательное оборудование
  {
    id: "AUX001",
    name: "LH87",
    type: "Вспомогательное",
    status: "maintenance",
    lastMaintenance: "18.05.2025",
    nextMaintenance: "18.06.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "6М - ТО"],
    department: ""
  },
  {
    id: "AUX002",
    name: "BILZ",
    type: "Вспомогательное",
    status: "active",
    lastMaintenance: "20.05.2025",
    nextMaintenance: "20.06.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "3М - ТО"],
    department: ""
  },
  {
    id: "WAR001",
    name: "Jungheinrich",
    type: "Складское",
    status: "active",
    lastMaintenance: "22.05.2025",
    nextMaintenance: "22.06.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "6М - ТО"],
    department: ""
  },
  {
    id: "AUX003",
    name: "UNIMAX 3AV",
    type: "Вспомогательное",
    status: "active",
    lastMaintenance: "24.05.2025",
    nextMaintenance: "24.06.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "3М - ТО", "6М - ТО"],
    department: ""
  },
  {
    id: "SHARP001",
    name: "Darex XT-3000",
    type: "Заточные станки",
    status: "active",
    lastMaintenance: "26.05.2025",
    nextMaintenance: "26.06.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "3М - ТО"],
    department: ""
  },
  {
    id: "CUT001",
    name: "Лица Optisaw",
    type: "Отрезные станки",
    status: "active",
    lastMaintenance: "28.05.2025",
    nextMaintenance: "28.06.2025",
    responsible: "Купцов Денис",
    maintenancePeriods: ["1М - ТО", "6М - ТО"],
    department: ""
  },
  // Выведенное из эксплуатации оборудование
  {
    id: "DECOM001",
    name: "Старый фрезер V1",
    type: "Фрезерные станки",
    status: "decommissioned",
    lastMaintenance: "01.01.2024",
    nextMaintenance: "-",
    responsible: "-",
    maintenancePeriods: [],
    department: "Архив"
  },
  {
    id: "DECOM002", 
    name: "Токарный станок 1980",
    type: "Токарные станки",
    status: "decommissioned",
    lastMaintenance: "15.12.2024",
    nextMaintenance: "-",
    responsible: "-",
    maintenancePeriods: [],
    department: "Архив"
  }
];

export function EquipmentProvider({ children }: { children: ReactNode }) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем данные из API при монтировании
  useEffect(() => {
    const loadEquipment = async () => {
      try {
        const response = await fetch('/api/equipment', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setEquipment(data);
        } else {
          console.error('Ошибка загрузки оборудования:', response.statusText);
          setEquipment(initialEquipmentData);
        }
      } catch (error) {
        console.error('Ошибка подключения к серверу:', error);
        setEquipment(initialEquipmentData);
      } finally {
        setIsLoading(false);
      }
    };

    loadEquipment();
  }, []);

  // Локальное сохранение удалено для синхронизации с базой данных

  const addEquipment = async (newEquipment: Omit<Equipment, 'id'>) => {
    try {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEquipment),
      });

      if (response.ok) {
        const createdEquipment = await response.json();
        setEquipment(prev => [...prev, createdEquipment]);
      } else {
        console.error('Ошибка создания оборудования');
      }
    } catch (error) {
      console.error('Ошибка подключения к серверу:', error);
    }
  };

  const updateEquipment = async (id: string, updates: Partial<Equipment>) => {
    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedEquipment = await response.json();
        setEquipment(prev => prev.map(item => 
          item.id === id ? updatedEquipment : item
        ));
      } else {
        console.error('Ошибка обновления оборудования');
      }
    } catch (error) {
      console.error('Ошибка подключения к серверу:', error);
    }
  };

  const deleteEquipment = async (id: string) => {
    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setEquipment(prev => prev.filter(item => item.id !== id));
      } else {
        console.error('Ошибка удаления оборудования');
      }
    } catch (error) {
      console.error('Ошибка подключения к серверу:', error);
    }
  };

  const getEquipmentByType = (type: string) => {
    return equipment.filter(item => item.type === type);
  };

  const getEquipmentByStatus = (status: string) => {
    return equipment.filter(item => item.status === status);
  };

  const getActiveEquipment = () => {
    return equipment.filter(item => item.status !== 'decommissioned');
  };

  const refreshData = () => {
    setEquipment(initialEquipmentData);
  };

  const value: EquipmentContextType = {
    equipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    getEquipmentByType,
    getEquipmentByStatus,
    getActiveEquipment,
    refreshData,
  };

  return (
    <EquipmentContext.Provider value={value}>
      {children}
    </EquipmentContext.Provider>
  );
}

export function useEquipmentData() {
  const context = useContext(EquipmentContext);
  if (context === undefined) {
    throw new Error('useEquipmentData must be used within an EquipmentProvider');
  }
  return context;
}

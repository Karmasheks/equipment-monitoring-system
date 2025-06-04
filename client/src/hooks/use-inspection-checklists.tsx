import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { InspectionChecklist, InsertInspectionChecklist } from '@shared/schema';

interface InspectionChecklistContextType {
  checklists: InspectionChecklist[];
  getChecklistByEquipmentId: (equipmentId: string) => InspectionChecklist | undefined;
  createChecklist: (checklist: InsertInspectionChecklist) => Promise<void>;
  updateChecklist: (id: number, checklist: Partial<InsertInspectionChecklist>) => Promise<void>;
  deleteChecklist: (id: number) => Promise<void>;
  refreshChecklists: () => Promise<void>;
}

const InspectionChecklistContext = createContext<InspectionChecklistContextType | undefined>(undefined);

export function InspectionChecklistProvider({ children }: { children: ReactNode }) {
  const [checklists, setChecklists] = useState<InspectionChecklist[]>([]);

  const loadChecklists = async () => {
    try {
      const response = await fetch('/api/inspection-checklists', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChecklists(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки чек-листов:', error);
    }
  };

  useEffect(() => {
    loadChecklists();
  }, []);

  const getChecklistByEquipmentId = (equipmentId: string): InspectionChecklist | undefined => {
    return checklists.find(checklist => checklist.equipmentId === equipmentId);
  };

  const createChecklist = async (checklistData: InsertInspectionChecklist) => {
    try {
      const response = await fetch('/api/inspection-checklists', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checklistData),
      });

      if (response.ok) {
        await loadChecklists();
        window.dispatchEvent(new CustomEvent('checklistsUpdated'));
      } else {
        console.error('Ошибка создания чек-листа');
      }
    } catch (error) {
      console.error('Ошибка подключения к серверу:', error);
    }
  };

  const updateChecklist = async (id: number, updates: Partial<InsertInspectionChecklist>) => {
    try {
      const response = await fetch(`/api/inspection-checklists/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await loadChecklists();
        window.dispatchEvent(new CustomEvent('checklistsUpdated'));
      } else {
        console.error('Ошибка обновления чек-листа');
      }
    } catch (error) {
      console.error('Ошибка подключения к серверу:', error);
    }
  };

  const deleteChecklist = async (id: number) => {
    try {
      const response = await fetch(`/api/inspection-checklists/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        await loadChecklists();
        window.dispatchEvent(new CustomEvent('checklistsUpdated'));
      } else {
        console.error('Ошибка удаления чек-листа');
      }
    } catch (error) {
      console.error('Ошибка подключения к серверу:', error);
    }
  };

  const refreshChecklists = async () => {
    await loadChecklists();
  };

  const value: InspectionChecklistContextType = {
    checklists,
    getChecklistByEquipmentId,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    refreshChecklists,
  };

  return (
    <InspectionChecklistContext.Provider value={value}>
      {children}
    </InspectionChecklistContext.Provider>
  );
}

export function useInspectionChecklists() {
  const context = useContext(InspectionChecklistContext);
  if (context === undefined) {
    throw new Error('useInspectionChecklists must be used within an InspectionChecklistProvider');
  }
  return context;
}
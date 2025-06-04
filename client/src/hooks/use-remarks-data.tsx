import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Remark {
  id: string;
  title: string;
  description: string;
  equipmentName: string;
  equipmentId: string;
  type: 'inspection' | 'maintenance' | 'manual';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reportedBy: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  notes: string[];
}

interface RemarksContextType {
  remarks: Remark[];
  addRemark: (remark: Omit<Remark, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRemark: (id: string, updates: Partial<Remark>) => Promise<void>;
  deleteRemark: (id: string) => Promise<void>;
  getRemarksByStatus: (status: string) => Remark[];
  getRemarksByEquipment: (equipmentId: string) => Remark[];
  getOpenRemarksCount: () => number;
  getCriticalRemarksCount: () => number;
  addRemarkNote: (id: string, note: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const RemarksContext = createContext<RemarksContextType | undefined>(undefined);

export function RemarksProvider({ children }: { children: ReactNode }) {
  const [remarks, setRemarks] = useState<Remark[]>([]);

  const loadRemarks = async () => {
    try {
      const response = await fetch('/api/remarks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRemarks(data.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          resolvedAt: item.resolvedAt ? new Date(item.resolvedAt) : undefined,
        })));
      }
    } catch (error) {
      console.error('Ошибка загрузки замечаний:', error);
    }
  };

  useEffect(() => {
    loadRemarks();
    
    // Слушаем события обновления замечаний
    const handleRemarksUpdate = () => {
      loadRemarks();
    };

    window.addEventListener('remarksUpdated', handleRemarksUpdate);
    window.addEventListener('remarkStatusChanged', handleRemarksUpdate);
    
    return () => {
      window.removeEventListener('remarksUpdated', handleRemarksUpdate);
      window.removeEventListener('remarkStatusChanged', handleRemarksUpdate);
    };
  }, []);

  const addRemark = async (newRemark: Omit<Remark, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/remarks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRemark),
      });

      if (response.ok) {
        const createdRemark = await response.json();
        setRemarks(prev => [...prev, {
          ...createdRemark,
          createdAt: new Date(createdRemark.createdAt),
          updatedAt: new Date(createdRemark.updatedAt),
          resolvedAt: createdRemark.resolvedAt ? new Date(createdRemark.resolvedAt) : undefined,
        }]);
      } else {
        console.error('Ошибка создания замечания');
      }
    } catch (error) {
      console.error('Ошибка подключения к серверу:', error);
    }
  };

  const updateRemark = async (id: string, updates: Partial<Remark>) => {
    try {
      const response = await fetch(`/api/remarks/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedRemark = await response.json();
        setRemarks(prev => prev.map(remark => 
          remark.id === id ? {
            ...updatedRemark,
            createdAt: new Date(updatedRemark.createdAt),
            updatedAt: new Date(updatedRemark.updatedAt),
            resolvedAt: updatedRemark.resolvedAt ? new Date(updatedRemark.resolvedAt) : undefined,
          } : remark
        ));
      } else {
        console.error('Ошибка обновления замечания');
      }
    } catch (error) {
      console.error('Ошибка подключения к серверу:', error);
    }
  };

  const deleteRemark = async (id: string) => {
    try {
      const response = await fetch(`/api/remarks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setRemarks(prev => prev.filter(remark => remark.id !== id));
      } else {
        console.error('Ошибка удаления замечания');
      }
    } catch (error) {
      console.error('Ошибка подключения к серверу:', error);
    }
  };

  const getRemarksByStatus = (status: string) => {
    return remarks.filter(remark => remark.status === status);
  };

  const getRemarksByEquipment = (equipmentId: string) => {
    return remarks.filter(remark => remark.equipmentId === equipmentId);
  };

  const getOpenRemarksCount = () => {
    return remarks.filter(remark => remark.status === 'open' || remark.status === 'in_progress').length;
  };

  const getCriticalRemarksCount = () => {
    return remarks.filter(remark => remark.priority === 'critical' && remark.status !== 'resolved' && remark.status !== 'closed').length;
  };

  const addRemarkNote = async (id: string, note: string) => {
    const remark = remarks.find(r => r.id === id);
    if (remark) {
      const updatedNotes = [...remark.notes, note];
      await updateRemark(id, { notes: updatedNotes });
    }
  };

  const refreshData = async () => {
    await loadRemarks();
  };

  const value: RemarksContextType = {
    remarks,
    addRemark,
    updateRemark,
    deleteRemark,
    getRemarksByStatus,
    getRemarksByEquipment,
    getOpenRemarksCount,
    getCriticalRemarksCount,
    addRemarkNote,
    refreshData,
  };

  return (
    <RemarksContext.Provider value={value}>
      {children}
    </RemarksContext.Provider>
  );
}

export function useRemarksData() {
  const context = useContext(RemarksContext);
  if (context === undefined) {
    throw new Error('useRemarksData must be used within a RemarksProvider');
  }
  return context;
}
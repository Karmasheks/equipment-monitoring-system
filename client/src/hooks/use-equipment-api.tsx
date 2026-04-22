import { useQuery } from '@tanstack/react-query';
import type { Equipment } from '../../../shared/schema';

export function useEquipmentApi() {
  // Загружаем данные оборудования из API
  const { data: equipment = [], isLoading, error } = useQuery<Equipment[]>({
    queryKey: ['/api/equipment'],
  });

  // Фильтр активного оборудования (исключает выведенное из эксплуатации)
  const getActiveEquipment = () => equipment.filter((eq: Equipment) => eq.status !== 'decommissioned');

  // Фильтр по типу оборудования
  const getEquipmentByType = (type: string) => 
    getActiveEquipment().filter((eq: Equipment) => eq.type === type);

  // Фильтр по статусу
  const getEquipmentByStatus = (status: string) => 
    getActiveEquipment().filter((eq: Equipment) => eq.status === status);

  return {
    equipment: getActiveEquipment(),
    allEquipment: equipment,
    isLoading,
    error,
    getActiveEquipment,
    getEquipmentByType,
    getEquipmentByStatus,
  };
}
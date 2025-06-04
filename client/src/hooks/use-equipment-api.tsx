import { useQuery } from '@tanstack/react-query';

export function useEquipmentApi() {
  // Загружаем данные оборудования из API
  const { data: equipment = [], isLoading, error } = useQuery({
    queryKey: ['/api/equipment'],
  });

  // Фильтр активного оборудования (исключает выведенное из эксплуатации)
  const getActiveEquipment = () => equipment.filter((eq: any) => eq.status !== 'decommissioned');

  // Фильтр по типу оборудования
  const getEquipmentByType = (type: string) => 
    getActiveEquipment().filter((eq: any) => eq.type === type);

  // Фильтр по статусу
  const getEquipmentByStatus = (status: string) => 
    getActiveEquipment().filter((eq: any) => eq.status === status);

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
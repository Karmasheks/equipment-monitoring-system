import { useState, useCallback, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface EquipmentFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const equipmentTypes = [
  "Фрезерный станок",
  "Токарный станок", 
  "Шлифовальный станок",
  "Сверлильный станок",
  "Гравировальный станок",
  "Плазменная резка",
  "Лазерная резка",
  "Гибочный станок",
  "Прессовое оборудование",
  "Сварочное оборудование",
  "Другое"
];

const responsibleOptions = [
  "Иванов И.И.",
  "Петров П.П.", 
  "Сидоров С.С.",
  "Калюжный Никита"
];

export default function EquipmentForm({ initialData, onSave, onCancel, isEdit = false }: EquipmentFormProps) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    type: "",
    description: "",
    status: "active",
    lastMaintenance: "",
    nextMaintenance: "",
    responsible: "",
    maintenancePeriods: [] as string[]
  });

  const [customType, setCustomType] = useState("");
  const [isCustomType, setIsCustomType] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || "",
        name: initialData.name || "",
        type: initialData.type || "",
        description: initialData.description || "",
        status: initialData.status || "active",
        lastMaintenance: initialData.lastMaintenance || "",
        nextMaintenance: initialData.nextMaintenance || "",
        responsible: initialData.responsible || "",
        maintenancePeriods: initialData.maintenancePeriods || []
      });
      
      const isCustom = !equipmentTypes.includes(initialData.type || "");
      setIsCustomType(isCustom);
      if (isCustom) {
        setCustomType(initialData.type || "");
      }
    }
  }, [initialData]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  }, []);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
  }, []);

  const handleCustomTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomType(value);
    setFormData(prev => ({ ...prev, type: value }));
  }, []);

  const handleMaintenancePeriodChange = useCallback((period: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      maintenancePeriods: checked 
        ? [...prev.maintenancePeriods, period]
        : prev.maintenancePeriods.filter(p => p !== period)
    }));
  }, []);

  const handleSave = () => {
    onSave(formData);
  };

  const maintenancePeriods = ["1М - ТО", "3М - ТО", "6М - ТО", "1Г - ТО"];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Название оборудования *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="Введите название"
          />
        </div>
        <div>
          <Label htmlFor="type">Тип оборудования *</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="customTypeCheck"
                checked={isCustomType}
                onChange={(e) => {
                  setIsCustomType(e.target.checked);
                  if (!e.target.checked) {
                    setCustomType("");
                    handleFieldChange('type', '');
                  }
                }}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <Label htmlFor="customTypeCheck" className="text-sm">Ввести тип вручную</Label>
            </div>
            
            {isCustomType ? (
              <Input
                placeholder="Введите тип оборудования"
                value={customType}
                onChange={handleCustomTypeChange}
              />
            ) : (
              <Select value={formData.type} onValueChange={(value) => handleFieldChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Описание оборудования</Label>
        <textarea
          id="description"
          className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          value={formData.description}
          onChange={handleDescriptionChange}
          placeholder="Введите описание оборудования (опционально)"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Статус</Label>
          <Select value={formData.status} onValueChange={(value) => handleFieldChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Активно</SelectItem>
              <SelectItem value="maintenance">ТО</SelectItem>
              <SelectItem value="inactive">Неактивно</SelectItem>
              <SelectItem value="decommissioned">Выведено из эксплуатации</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="responsible">Ответственный *</Label>
          <Select value={formData.responsible} onValueChange={(value) => handleFieldChange('responsible', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите ответственного" />
            </SelectTrigger>
            <SelectContent>
              {responsibleOptions.map((person) => (
                <SelectItem key={person} value={person}>{person}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lastMaintenance">Последнее ТО</Label>
          <Input
            id="lastMaintenance"
            type="date"
            value={formData.lastMaintenance}
            onChange={(e) => handleFieldChange('lastMaintenance', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="nextMaintenance">Следующее ТО</Label>
          <Input
            id="nextMaintenance"
            type="date"
            value={formData.nextMaintenance}
            onChange={(e) => handleFieldChange('nextMaintenance', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>Периодичность ТО</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {maintenancePeriods.map((period) => (
            <div key={period} className="flex items-center space-x-2">
              <Checkbox
                id={`period-${period}`}
                checked={formData.maintenancePeriods.includes(period)}
                onCheckedChange={(checked) => handleMaintenancePeriodChange(period, !!checked)}
              />
              <Label htmlFor={`period-${period}`} className="text-sm">
                {period}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button onClick={handleSave}>
          {isEdit ? 'Сохранить изменения' : 'Добавить оборудование'}
        </Button>
      </div>
    </div>
  );
}
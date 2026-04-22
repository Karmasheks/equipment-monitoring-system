import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type MaintenancePeriodOption = {
  value: string;
  label: string;
};

type Props = {
  isEdit?: boolean;
  formData: {
    id: string;
    name: string;
    type: string;
    description: string;
    status: string;
    lastMaintenance: string;
    nextMaintenance: string;
    responsible: string;
    maintenancePeriods: string[];
  };
  customType: string;
  isCustomType: boolean;
  setIsCustomType: React.Dispatch<React.SetStateAction<boolean>>;
  handleFormFieldChange: (field: string, value: string) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCustomTypeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleMaintenancePeriodChange: (period: string, checked: boolean) => void;
  handleAddEquipment: () => void;
  handleEditEquipment: () => void;
  resetForm: () => void;
  setAddDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  equipmentTypes: string[];
  responsibleOptions: string[];
  maintenancePeriodOptions: MaintenancePeriodOption[];
  getPeriodBadge: (period: string) => React.ReactNode;
};

export default function EquipmentDialogForm({
  isEdit = false,
  formData,
  customType,
  isCustomType,
  setIsCustomType,
  handleFormFieldChange,
  handleNameChange,
  handleCustomTypeChange,
  handleDescriptionChange,
  handleMaintenancePeriodChange,
  handleAddEquipment,
  handleEditEquipment,
  resetForm,
  setAddDialogOpen,
  setEditDialogOpen,
  equipmentTypes,
  responsibleOptions,
  maintenancePeriodOptions,
  getPeriodBadge,
}: Props) {
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
                    handleFormFieldChange("type", "");
                  }
                }}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <Label htmlFor="customTypeCheck" className="text-sm">
                Ввести тип вручную
              </Label>
            </div>

            {isCustomType ? (
              <Input
                placeholder="Введите тип оборудования"
                value={customType}
                onChange={handleCustomTypeChange}
              />
            ) : (
              <Select value={formData.type} onValueChange={(value) => handleFormFieldChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
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
          <Select value={formData.status} onValueChange={(value) => handleFormFieldChange("status", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Активно</SelectItem>
              <SelectItem value="maintenance">ТО</SelectItem>
              <SelectItem value="inactive">Неактивно</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="responsible">Ответственный *</Label>
          <Select value={formData.responsible} onValueChange={(value) => handleFormFieldChange("responsible", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите ответственного" />
            </SelectTrigger>
            <SelectContent>
              {responsibleOptions.map((person) => (
                <SelectItem key={person} value={person}>
                  {person}
                </SelectItem>
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
            onChange={(e) => handleFormFieldChange("lastMaintenance", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="nextMaintenance">Следующее ТО</Label>
          <Input
            id="nextMaintenance"
            type="date"
            value={formData.nextMaintenance}
            onChange={(e) => handleFormFieldChange("nextMaintenance", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label className="text-base font-medium">Периодичность технического обслуживания</Label>
        <p className="text-sm text-gray-500 mb-3">
          Выберите типы ТО, которые необходимо проводить для данного оборудования
        </p>
        <div className="grid grid-cols-2 gap-3">
          {maintenancePeriodOptions.map((period) => (
            <div key={period.value} className="flex items-center space-x-2">
              <Checkbox
                id={period.value}
                checked={formData.maintenancePeriods.includes(period.value)}
                onCheckedChange={(checked) => handleMaintenancePeriodChange(period.value, !!checked)}
              />
              <Label htmlFor={period.value} className="text-sm font-normal cursor-pointer">
                {period.label}
              </Label>
            </div>
          ))}
        </div>
        {formData.maintenancePeriods.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Выбранные периодичности:</p>
            <div className="flex gap-2 flex-wrap">
              {formData.maintenancePeriods.map((period) => getPeriodBadge(period))}
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="pt-6">
        <Button
          variant="outline"
          onClick={() => {
            if (isEdit) {
              setEditDialogOpen(false);
            } else {
              setAddDialogOpen(false);
            }
            resetForm();
          }}
        >
          Отмена
        </Button>
        <Button onClick={isEdit ? handleEditEquipment : handleAddEquipment}>
          {isEdit ? "Сохранить изменения" : "Добавить оборудование"}
        </Button>
      </DialogFooter>
    </div>
  );
}
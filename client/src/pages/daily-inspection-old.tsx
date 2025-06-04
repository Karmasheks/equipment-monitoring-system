import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock, AlertTriangle, Search, FileText, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InspectionItem {
  id: string;
  category: string;
  item: string;
  checked: boolean;
  status: 'ok' | 'attention' | 'critical';
  notes?: string;
}

export default function DailyInspection() {
  const { toast } = useToast();
  
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [inspectorName, setInspectorName] = useState("");

  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([
    // Безопасность
    { id: "safety-1", category: "Безопасность", item: "Проверка аварийной остановки", checked: false, status: 'ok' },
    { id: "safety-2", category: "Безопасность", item: "Проверка защитных ограждений", checked: false, status: 'ok' },
    { id: "safety-3", category: "Безопасность", item: "Состояние предупреждающих табличек", checked: false, status: 'ok' },
    { id: "safety-4", category: "Безопасность", item: "Наличие средств пожаротушения", checked: false, status: 'ok' },
    { id: "safety-5", category: "Безопасность", item: "Проверка освещения рабочей зоны", checked: false, status: 'ok' },
    
    // Механическая часть
    { id: "mech-1", category: "Механическая часть", item: "Визуальный осмотр на наличие повреждений", checked: false, status: 'ok' },
    { id: "mech-2", category: "Механическая часть", item: "Проверка крепежных элементов", checked: false, status: 'ok' },
    { id: "mech-3", category: "Механическая часть", item: "Состояние ремней и цепей", checked: false, status: 'ok' },
    { id: "mech-4", category: "Механическая часть", item: "Проверка подшипников (шум, нагрев)", checked: false, status: 'ok' },
    { id: "mech-5", category: "Механическая часть", item: "Состояние рабочих органов", checked: false, status: 'ok' },
    
    // Гидравлика
    { id: "hydr-1", category: "Гидравлика", item: "Уровень гидравлической жидкости", checked: false, status: 'ok' },
    { id: "hydr-2", category: "Гидравлика", item: "Визуальная проверка на утечки", checked: false, status: 'ok' },
    { id: "hydr-3", category: "Гидравлика", item: "Состояние шлангов и соединений", checked: false, status: 'ok' },
    { id: "hydr-4", category: "Гидравлика", item: "Проверка давления в системе", checked: false, status: 'ok' },
    { id: "hydr-5", category: "Гидравлика", item: "Чистота гидравлического фильтра", checked: false, status: 'ok' },
    
    // Электрика
    { id: "elec-1", category: "Электрика", item: "Состояние кабелей и проводов", checked: false, status: 'ok' },
    { id: "elec-2", category: "Электрика", item: "Проверка контактных соединений", checked: false, status: 'ok' },
    { id: "elec-3", category: "Электрика", item: "Работа сигнальных ламп", checked: false, status: 'ok' },
    { id: "elec-4", category: "Электрика", item: "Проверка заземления", checked: false, status: 'ok' },
    { id: "elec-5", category: "Электрика", item: "Состояние электрических шкафов", checked: false, status: 'ok' },
    
    // Смазка
    { id: "lub-1", category: "Смазка", item: "Уровень масла в редукторе", checked: false, status: 'ok' },
    { id: "lub-2", category: "Смазка", item: "Смазка подшипников", checked: false, status: 'ok' },
    { id: "lub-3", category: "Смазка", item: "Состояние масляных фильтров", checked: false, status: 'ok' },
    { id: "lub-4", category: "Смазка", item: "Проверка автоматической смазки", checked: false, status: 'ok' },
    
    // Чистота
    { id: "clean-1", category: "Чистота", item: "Общая чистота оборудования", checked: false, status: 'ok' },
    { id: "clean-2", category: "Чистота", item: "Чистота рабочей зоны", checked: false, status: 'ok' },
    { id: "clean-3", category: "Чистота", item: "Удаление пыли и грязи", checked: false, status: 'ok' },
    { id: "clean-4", category: "Чистота", item: "Проверка вентиляции", checked: false, status: 'ok' }
  ]);

  const equipmentList = [
    "Пресс гидравлический ПГ-100",
    "Станок токарный СТ-16К20",
    "Фрезерный станок ФС-250",
    "Компрессор воздушный КВ-50",
    "Насосная станция НС-15",
    "Кран мостовой КМ-5т",
    "Печь термическая ПТ-800"
  ];

  const categories = ["all", "Безопасность", "Механическая часть", "Гидравлика", "Электрика", "Смазка", "Чистота"];

  const filteredItems = inspectionItems.filter(item => {
    const matchesSearch = item.item.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleItemCheck = (id: string, checked: boolean) => {
    setInspectionItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked } : item
    ));
  };

  const handleStatusChange = (id: string, status: 'ok' | 'attention' | 'critical') => {
    setInspectionItems(prev => prev.map(item => 
      item.id === id ? { ...item, status } : item
    ));
  };

  const handleNotesChange = (id: string, notes: string) => {
    setInspectionItems(prev => prev.map(item => 
      item.id === id ? { ...item, notes } : item
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">ОК</Badge>;
      case 'attention':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Внимание</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Критично</Badge>;
      default:
        return null;
    }
  };

  const completedCount = inspectionItems.filter(item => item.checked).length;
  const totalCount = inspectionItems.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const criticalIssues = inspectionItems.filter(item => item.status === 'critical').length;
  const attentionIssues = inspectionItems.filter(item => item.status === 'attention').length;

  const handleSaveInspection = () => {
    if (!selectedEquipment || !inspectorName) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Осмотр сохранен",
      description: `Ежедневный осмотр ${selectedEquipment} успешно сохранен`,
    });
  };

  const handleResetInspection = () => {
    setInspectionItems(prev => prev.map(item => ({
      ...item,
      checked: false,
      status: 'ok' as const,
      notes: undefined
    })));
    setSelectedEquipment("");
    setInspectorName("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Ежедневные осмотры | Победит 4</title>
        <meta name="description" content="Система ежедневных осмотров оборудования перед началом работы" />
      </Helmet>
      
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <MobileSidebar />
          
          <main className="flex-1 p-6 lg:ml-64">
            <div className="w-full">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ежедневные осмотры</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Обязательная проверка оборудования перед началом работы
                </p>
              </div>

              {/* Статистика */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Выполнено</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedCount}/{totalCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-blue-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Прогресс</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(progressPercentage)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <AlertTriangle className="h-8 w-8 text-yellow-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Внимание</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{attentionIssues}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Критично</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{criticalIssues}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Форма информации об осмотре */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Информация об осмотре</CardTitle>
                  <CardDescription>
                    Заполните основную информацию перед началом осмотра
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="equipment">Оборудование *</Label>
                      <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите оборудование" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipmentList.map(equipment => (
                            <SelectItem key={equipment} value={equipment}>
                              {equipment}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inspector">Ответственный *</Label>
                      <Input
                        id="inspector"
                        value={inspectorName}
                        onChange={(e) => setInspectorName(e.target.value)}
                        placeholder="ФИО ответственного"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Фильтры */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          className="pl-10"
                          placeholder="Поиск пунктов осмотра..."
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Категория" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category === "all" ? "Все категории" : category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Список проверок */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Список проверок
                  </CardTitle>
                  <CardDescription>
                    Проверьте каждый пункт и отметьте его состояние
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {categories.filter(cat => cat !== "all").map(category => {
                      const categoryItems = filteredItems.filter(item => item.category === category);
                      if (categoryItems.length === 0) return null;
                      
                      return (
                        <div key={category} className="border rounded-lg p-4 dark:border-gray-700">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{category}</h3>
                          <div className="space-y-4">
                            {categoryItems.map(item => (
                              <div key={item.id} className="flex items-start space-x-4 p-4 border rounded-md dark:border-gray-600">
                                <Checkbox
                                  checked={item.checked}
                                  onCheckedChange={(checked) => handleItemCheck(item.id, !!checked)}
                                  className="mt-1"
                                />
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium text-gray-900 dark:text-white">{item.item}</p>
                                    {getStatusBadge(item.status)}
                                  </div>
                                  
                                  <div className="flex items-center space-x-4">
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        variant={item.status === 'ok' ? 'default' : 'outline'}
                                        onClick={() => handleStatusChange(item.id, 'ok')}
                                        className="text-xs"
                                      >
                                        ОК
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant={item.status === 'attention' ? 'default' : 'outline'}
                                        onClick={() => handleStatusChange(item.id, 'attention')}
                                        className="text-xs"
                                      >
                                        Внимание
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant={item.status === 'critical' ? 'destructive' : 'outline'}
                                        onClick={() => handleStatusChange(item.id, 'critical')}
                                        className="text-xs"
                                      >
                                        Критично
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {(item.status === 'attention' || item.status === 'critical') && (
                                    <Textarea
                                      placeholder="Опишите выявленные проблемы..."
                                      value={item.notes || ''}
                                      onChange={(e) => handleNotesChange(item.id, e.target.value)}
                                      className="mt-2"
                                    />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Button onClick={handleSaveInspection} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Сохранить осмотр
                    </Button>
                    <Button variant="outline" onClick={handleResetInspection}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Сбросить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  FileText,
  Settings,
  ClipboardCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRemarksData } from "@/hooks/use-remarks-data";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function Remarks() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { 
    remarks, 
    updateRemark, 
    addRemarkNote, 
    getOpenRemarksCount, 
    getCriticalRemarksCount 
  } = useRemarksData();

  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedRemark, setSelectedRemark] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated()) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredRemarks = remarks.filter(remark => {
    const matchesSearch = remark.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         remark.equipmentName.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         remark.description.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === "all" || remark.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || remark.priority === priorityFilter;
    const matchesType = typeFilter === "all" || remark.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive">Открыто</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">В работе</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Решено</Badge>;
      case 'closed':
        return <Badge variant="outline">Закрыто</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Критично</Badge>;
      case 'high':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Высокий</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Средний</Badge>;
      case 'low':
        return <Badge variant="outline">Низкий</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'inspection':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Осмотр</Badge>;
      case 'maintenance':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">ТО</Badge>;
      case 'manual':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Ручное</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleStatusChange = (remarkId: string, newStatus: string) => {
    updateRemark(remarkId, { status: newStatus as any });
    
    toast({
      title: "Статус обновлен",
      description: `Замечание переведено в статус: ${newStatus === 'open' ? 'Открыто' : 
                    newStatus === 'in_progress' ? 'В работе' : 
                    newStatus === 'resolved' ? 'Решено' : 'Закрыто'}`
    });
  };

  const handleAddNote = (remarkId: string) => {
    if (!newNote.trim()) return;
    
    addRemarkNote(remarkId, newNote);
    setNewNote("");
    
    toast({
      title: "Комментарий добавлен",
      description: "Новый комментарий успешно добавлен к замечанию"
    });
  };

  const stats = {
    total: remarks.length,
    open: remarks.filter(r => r.status === 'open').length,
    inProgress: remarks.filter(r => r.status === 'in_progress').length,
    resolved: remarks.filter(r => r.status === 'resolved').length,
    critical: getCriticalRemarksCount()
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Замечания - Система управления оборудованием</title>
      </Helmet>

      <div className="flex min-h-screen">
        <Sidebar />
        
        <div className="flex-1 flex flex-col w-full lg:ml-64">
          <Header />
          
          <main className="flex-1 p-4 lg:p-6 w-full max-w-full overflow-hidden">
            <div className="w-full max-w-full">
              <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Управление замечаниями
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Централизованное управление замечаниями из ежедневных осмотров и технического обслуживания
                </p>
              </div>

              {/* Статистика */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Всего</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Открыто</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.open}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">В работе</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.inProgress}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Решено</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.resolved}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-red-800" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Критично</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.critical}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Фильтры и поиск */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Фильтры и поиск
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Поиск замечаний..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="open">Открыто</SelectItem>
                      <SelectItem value="in_progress">В работе</SelectItem>
                      <SelectItem value="resolved">Решено</SelectItem>
                      <SelectItem value="closed">Закрыто</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Приоритет" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все приоритеты</SelectItem>
                      <SelectItem value="critical">Критично</SelectItem>
                      <SelectItem value="high">Высокий</SelectItem>
                      <SelectItem value="medium">Средний</SelectItem>
                      <SelectItem value="low">Низкий</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все типы</SelectItem>
                      <SelectItem value="inspection">Осмотр</SelectItem>
                      <SelectItem value="maintenance">ТО</SelectItem>
                      <SelectItem value="manual">Ручное</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить замечание
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Список замечаний */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Список замечаний ({filteredRemarks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRemarks.map((remark) => (
                    <div 
                      key={remark.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              {remark.title}
                            </h3>
                            {getStatusBadge(remark.status)}
                            {getPriorityBadge(remark.priority)}
                            {getTypeBadge(remark.type)}
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 mb-2">
                            {remark.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>Оборудование: {remark.equipmentName}</span>
                            <span>Создано: {format(remark.createdAt, 'dd.MM.yyyy', { locale: ru })}</span>
                            <span>Ответственный: {remark.assignedTo}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRemark(remark);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {remark.status === 'open' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
                              onClick={() => handleStatusChange(remark.id, 'in_progress')}
                            >
                              Взять в работу
                            </Button>
                          )}
                          
                          {remark.status === 'in_progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                              onClick={() => handleStatusChange(remark.id, 'resolved')}
                            >
                              Решено
                            </Button>
                          )}
                          
                          {remark.status === 'resolved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                              onClick={() => handleStatusChange(remark.id, 'closed')}
                            >
                              Закрыть
                            </Button>
                          )}
                          
                          <Select
                            value={remark.status}
                            onValueChange={(value) => handleStatusChange(remark.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Открыто</SelectItem>
                              <SelectItem value="in_progress">В работе</SelectItem>
                              <SelectItem value="resolved">Решено</SelectItem>
                              <SelectItem value="closed">Закрыто</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredRemarks.length === 0 && (
                    <div className="text-center py-12">
                      <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Замечания не найдены
                      </p>
                      <p className="text-gray-500 dark:text-gray-500">
                        Попробуйте изменить параметры фильтрации
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Диалог просмотра замечания */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Детали замечания</DialogTitle>
          </DialogHeader>
          
          {selectedRemark && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Заголовок</Label>
                <p className="text-lg font-semibold">{selectedRemark.title}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Описание</Label>
                <p className="text-gray-600 dark:text-gray-400">{selectedRemark.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Оборудование</Label>
                  <p>{selectedRemark.equipmentName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Тип</Label>
                  <div className="mt-1">{getTypeBadge(selectedRemark.type)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Приоритет</Label>
                  <div className="mt-1">{getPriorityBadge(selectedRemark.priority)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Статус</Label>
                  <div className="mt-1">{getStatusBadge(selectedRemark.status)}</div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">История комментариев</Label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                  {selectedRemark.notes.map((note: string, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Добавить комментарий</Label>
                <div className="flex gap-2 mt-2">
                  <Textarea
                    placeholder="Введите комментарий..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={() => handleAddNote(selectedRemark.id)}>
                    Добавить
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { 
  CalendarIcon, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plus,
  Filter,
  Bell,
  Wrench,
  User,
  CheckSquare,
  FileText
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRemarksData } from "@/hooks/use-remarks-data";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

// Схема для создания/редактирования задач
const taskSchema = z.object({
  title: z.string().min(1, "Название задачи обязательно"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  dueDate: z.date().optional(),
  reminderDate: z.date().optional(),
  equipmentId: z.string().optional(),
  maintenanceType: z.string().optional(),
  estimatedHours: z.number().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface Task {
  id: number;
  title: string;
  description?: string;
  userId: number;
  status: "pending" | "in_progress" | "completed" | "overdue";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  reminderDate?: string;
  equipmentId?: string;
  maintenanceType?: string;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export default function TasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isCollapsed } = useSidebarState();
  const { remarks, updateRemark, addRemarkNote } = useRemarksData();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"tasks" | "remarks">("tasks");
  const [selectedRemark, setSelectedRemark] = useState<any>(null);
  const [isRemarkDialogOpen, setIsRemarkDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState("");

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      dueDate: undefined,
      reminderDate: undefined,
      equipmentId: "",
      maintenanceType: "",
      estimatedHours: undefined,
    },
  });

  // Загрузка задач
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });

  // Загрузка оборудования для выбора
  const { data: equipment = [] } = useQuery({
    queryKey: ["/api/equipment"],
  });

  // Создание задачи
  const createTask = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const taskData = {
        ...data,
        userId: user?.id,
        status: "pending",
        dueDate: data.dueDate?.toISOString(),
        reminderDate: data.reminderDate?.toISOString(),
      };
      return apiRequest("/api/tasks", {
        method: "POST",
        body: JSON.stringify(taskData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Успех",
        description: "Задача успешно создана",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать задачу",
        variant: "destructive",
      });
    },
  });

  // Обновление задачи
  const updateTask = useMutation({
    mutationFn: async (data: TaskFormData) => {
      if (!editingTask) return;
      const taskData = {
        ...data,
        dueDate: data.dueDate?.toISOString(),
        reminderDate: data.reminderDate?.toISOString(),
      };
      return apiRequest(`/api/tasks/${editingTask.id}`, {
        method: "PATCH",
        body: JSON.stringify(taskData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsDialogOpen(false);
      setEditingTask(null);
      form.reset();
      toast({
        title: "Успех",
        description: "Задача успешно обновлена",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить задачу",
        variant: "destructive",
      });
    },
  });

  // Удаление задачи
  const deleteTask = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Успех",
        description: "Задача успешно удалена",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить задачу",
        variant: "destructive",
      });
    },
  });

  // Изменение статуса задачи
  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: string }) => {
      return apiRequest(`/api/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ 
          status,
          completedAt: status === "completed" ? new Date().toISOString() : null,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Успех",
        description: "Статус задачи обновлен",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус задачи",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    if (editingTask) {
      updateTask.mutate(data);
    } else {
      createTask.mutate(data);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    form.reset({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      reminderDate: task.reminderDate ? new Date(task.reminderDate) : undefined,
      equipmentId: task.equipmentId || "",
      maintenanceType: task.maintenanceType || "",
      estimatedHours: task.estimatedHours,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (taskId: number) => {
    if (confirm("Вы уверены, что хотите удалить эту задачу?")) {
      deleteTask.mutate(taskId);
    }
  };

  // Функции для управления замечаниями
  const handleRemarkStatusChange = async (remarkId: string, newStatus: string) => {
    await updateRemark(remarkId, { status: newStatus });
    toast({
      title: "Статус изменен",
      description: `Статус замечания обновлен на "${
        newStatus === 'open' ? 'Открыто' :
        newStatus === 'in_progress' ? 'В работе' : 
        newStatus === 'resolved' ? 'Решено' : 'Закрыто'
      }"`
    });
  };

  const handleAddRemarkNote = async (remarkId: string) => {
    if (!newNote.trim()) return;
    
    await addRemarkNote(remarkId, newNote.trim());
    setNewNote("");
    toast({
      title: "Комментарий добавлен",
      description: "Новый комментарий успешно добавлен к замечанию"
    });
  };

  const createTaskFromRemark = async (remark: any) => {
    const taskData = {
      title: `Решение: ${remark.title}`,
      description: `Замечание: ${remark.description}\n\nОборудование: ${remark.equipmentName}`,
      priority: remark.priority === 'critical' ? 'urgent' : remark.priority,
      equipmentId: remark.equipmentId,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
    };

    try {
      await createTask.mutateAsync(taskData);
      await handleRemarkStatusChange(remark.id, 'in_progress');
      toast({
        title: "Задача создана",
        description: "Замечание превращено в задачу и помечено как \"В работе\""
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать задачу из замечания",
        variant: "destructive"
      });
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate) return false;
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate < now && task.status !== "completed";
  };

  const hasReminder = (task: Task) => {
    if (!task.reminderDate) return false;
    const now = new Date();
    const reminderDate = new Date(task.reminderDate);
    return reminderDate <= now && reminderDate > new Date(now.getTime() - 24 * 60 * 60 * 1000);
  };

  if (!user) {
    return null;
  }

  // Фильтрация задач
  const filteredTasks = tasks.filter((task: Task) => {
    const statusMatch = filterStatus === "all" || task.status === filterStatus;
    const priorityMatch = filterPriority === "all" || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in_progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "overdue": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        <Sidebar />
        <div className={`flex-1 flex flex-col overflow-hidden ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Header />
          <div className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="p-6">
              <div className="space-y-6">
                {/* Заголовок и статистика */}
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Задачи и замечания</h1>
                    <p className="text-gray-600 dark:text-gray-300">Создание и отслеживание задач с напоминаниями</p>
                  </div>
                  
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingTask(null);
                        form.reset();
                      }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Создать задачу
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingTask ? "Редактировать задачу" : "Создать новую задачу"}
                        </DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Название задачи</FormLabel>
                                <FormControl>
                                  <Input placeholder="Введите название задачи" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Описание</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Опишите детали задачи"
                                    className="min-h-[100px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="priority"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Приоритет</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Выберите приоритет" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="low">Низкий</SelectItem>
                                      <SelectItem value="medium">Средний</SelectItem>
                                      <SelectItem value="high">Высокий</SelectItem>
                                      <SelectItem value="urgent">Срочный</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="estimatedHours"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Планируемые часы</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      {...field}
                                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="dueDate"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Срок выполнения</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant={"outline"}
                                          className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                          )}
                                        >
                                          {field.value ? (
                                            format(field.value, "dd.MM.yyyy", { locale: ru })
                                          ) : (
                                            <span>Выберите дату</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="reminderDate"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Дата напоминания</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant={"outline"}
                                          className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                          )}
                                        >
                                          {field.value ? (
                                            format(field.value, "dd.MM.yyyy", { locale: ru })
                                          ) : (
                                            <span>Выберите дату</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="equipmentId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Оборудование</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Выберите оборудование" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="">Не выбрано</SelectItem>
                                      {equipment.map((item: any) => (
                                        <SelectItem key={item.id} value={item.id}>
                                          {item.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="maintenanceType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Тип обслуживания</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Выберите тип" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="">Не выбрано</SelectItem>
                                      <SelectItem value="1M-TO">1M-TO (1 месяц)</SelectItem>
                                      <SelectItem value="3M-TO">3M-TO (3 месяца)</SelectItem>
                                      <SelectItem value="6M-TO">6M-TO (6 месяцев)</SelectItem>
                                      <SelectItem value="1G-TO">1G-TO (12 месяцев)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex justify-end gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsDialogOpen(false)}
                            >
                              Отмена
                            </Button>
                            <Button
                              type="submit"
                              disabled={createTask.isPending || updateTask.isPending}
                            >
                              {editingTask ? "Сохранить" : "Создать"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Вкладки */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "tasks" | "remarks")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="tasks" className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4" />
                      Задачи ({filteredTasks.length})
                    </TabsTrigger>
                    <TabsTrigger value="remarks" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Замечания ({remarks.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="tasks" className="space-y-6">
                    {/* Фильтры для задач */}
                    <div className="flex gap-4">
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-48">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Фильтр по статусу" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все статусы</SelectItem>
                          <SelectItem value="pending">Ожидает</SelectItem>
                          <SelectItem value="in_progress">В работе</SelectItem>
                          <SelectItem value="completed">Завершено</SelectItem>
                          <SelectItem value="overdue">Просрочено</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="w-48">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Фильтр по приоритету" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все приоритеты</SelectItem>
                          <SelectItem value="low">Низкий</SelectItem>
                          <SelectItem value="medium">Средний</SelectItem>
                          <SelectItem value="high">Высокий</SelectItem>
                          <SelectItem value="urgent">Срочный</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                {/* Список задач */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {isLoading ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">Загрузка задач...</p>
                    </div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">Задач не найдено</p>
                    </div>
                  ) : (
                    filteredTasks.map((task: Task) => (
                      <Card key={task.id} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{task.title}</CardTitle>
                            <div className="flex gap-1">
                              {hasReminder(task) && (
                                <Bell className="w-4 h-4 text-yellow-500" />
                              )}
                              {isOverdue(task) && (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority === "low" && "Низкий"}
                              {task.priority === "medium" && "Средний"}
                              {task.priority === "high" && "Высокий"}
                              {task.priority === "urgent" && "Срочный"}
                            </Badge>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status === "pending" && "Ожидает"}
                              {task.status === "in_progress" && "В работе"}
                              {task.status === "completed" && "Завершено"}
                              {task.status === "overdue" && "Просрочено"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="space-y-2 text-sm">
                            {task.dueDate && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Срок: {format(new Date(task.dueDate), "dd.MM.yyyy", { locale: ru })}</span>
                              </div>
                            )}
                            
                            {task.equipmentId && (
                              <div className="flex items-center gap-2">
                                <Wrench className="w-4 h-4" />
                                <span>Оборудование: {task.equipmentId}</span>
                              </div>
                            )}
                            
                            {task.estimatedHours && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>Планируется: {task.estimatedHours}ч</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <Select
                              value={task.status}
                              onValueChange={(value) => updateTaskStatus.mutate({ taskId: task.id, status: value })}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Ожидает</SelectItem>
                                <SelectItem value="in_progress">В работе</SelectItem>
                                <SelectItem value="completed">Завершено</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEdit(task)}
                            >
                              Изменить
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDelete(task.id)}
                            >
                              Удалить
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
                  </TabsContent>

                  <TabsContent value="remarks" className="space-y-6">
                    {/* Список замечаний */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {remarks.length === 0 ? (
                        <div className="col-span-full text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400">Замечаний не найдено</p>
                        </div>
                      ) : (
                        remarks.map((remark: any) => (
                          <Card key={remark.id} className="relative">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-lg">{remark.title}</CardTitle>
                                <Badge className={
                                  remark.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                  remark.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                  remark.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }>
                                  {remark.priority === 'critical' ? 'Критично' :
                                   remark.priority === 'high' ? 'Высокий' :
                                   remark.priority === 'medium' ? 'Средний' : 'Низкий'}
                                </Badge>
                              </div>
                              <div className="flex gap-2">
                                <Badge className={
                                  remark.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                  remark.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }>
                                  {remark.status === 'resolved' ? 'Решено' :
                                   remark.status === 'in_progress' ? 'В работе' : 'Открыто'}
                                </Badge>
                                <Badge variant="outline">
                                  {remark.type === 'inspection' ? 'Осмотр' : 
                                   remark.type === 'maintenance' ? 'ТО' : 'Ручное'}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                {remark.description}
                              </p>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Wrench className="w-4 h-4" />
                                  <span>Оборудование: {remark.equipmentName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span>Ответственный: {remark.assignedTo}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>Создано: {format(new Date(remark.createdAt), "dd.MM.yyyy", { locale: ru })}</span>
                                </div>
                              </div>
                              
                              <div className="flex gap-2 mt-4">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => createTaskFromRemark(remark)}
                                  disabled={remark.status === 'resolved'}
                                >
                                  Создать задачу
                                </Button>
                                
                                <Select onValueChange={(value) => handleRemarkStatusChange(remark.id, value)}>
                                  <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Статус" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="open">Открыто</SelectItem>
                                    <SelectItem value="in_progress">В работе</SelectItem>
                                    <SelectItem value="resolved">Решено</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
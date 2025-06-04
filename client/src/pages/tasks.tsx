import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  FileText,
  TrendingUp,
  BarChart3,
  Activity
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRemarksData } from "@/hooks/use-remarks-data";
import { cn } from "@/lib/utils";

// Схема валидации задач
const taskSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["pending", "in_progress", "completed", "overdue"]),
  dueDate: z.date().optional().or(z.literal(undefined)).or(z.literal(null)),
  reminderDate: z.date().optional().or(z.literal(undefined)).or(z.literal(null)),
  equipmentId: z.string().optional(),
  maintenanceType: z.string().optional(),
  estimatedHours: z.number().optional().or(z.literal(undefined)).or(z.literal(null)),
  actualHours: z.number().optional().or(z.literal(undefined)).or(z.literal(null)),
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
  const { isCollapsed } = useSidebarState();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { remarks } = useRemarksData();

  const [activeTab, setActiveTab] = useState<"tasks" | "remarks">("tasks");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [remarksFilter, setRemarksFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('open');
  const [tasksFilter, setTasksFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('pending');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Слушаем событие навигации на вкладку замечаний с Dashboard
  useEffect(() => {
    const handleNavigateToRemarks = () => {
      setActiveTab("remarks");
    };

    window.addEventListener('navigateToRemarks', handleNavigateToRemarks);
    
    return () => {
      window.removeEventListener('navigateToRemarks', handleNavigateToRemarks);
    };
  }, []);

  // Загрузка задач
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['/api/tasks'],
    enabled: !!user
  });

  // Загрузка оборудования для формы
  const { data: equipment = [] } = useQuery({
    queryKey: ['/api/equipment']
  });

  // Загрузка статистики задач
  const { data: taskStats = { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 } } = useQuery({
    queryKey: ['/api/tasks/stats']
  });

  // Форма задач
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
    },
  });

  // Создание задачи
  const createTask = useMutation({
    mutationFn: async (data: TaskFormData) => {
      return apiRequest('POST', '/api/tasks', {
        ...data,
        userId: user?.id,
        createdBy: user?.name || 'Неизвестный пользователь',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/stats'] });
      // Отправляем событие для обновления Dashboard
      window.dispatchEvent(new CustomEvent('taskCreated'));
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Задача создана", description: "Задача успешно создана" });
    },
  });

  // Обновление задачи
  const updateTask = useMutation({
    mutationFn: async (data: TaskFormData) => {
      if (!editingTask) return;
      return apiRequest('PUT', `/api/tasks/${editingTask.id}`, {
        ...data,
        lastModifiedBy: user?.name || 'Неизвестный пользователь',
        ...(data.status === 'completed' && { completedBy: user?.name || 'Неизвестный пользователь' }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/stats'] });
      // Отправляем событие для обновления Dashboard
      window.dispatchEvent(new CustomEvent('taskUpdated'));
      setIsDialogOpen(false);
      setEditingTask(null);
      form.reset();
      toast({ title: "Задача обновлена", description: "Задача успешно обновлена" });
    },
  });

  // Удаление задачи
  const deleteTask = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/stats'] });
      toast({ title: "Задача удалена", description: "Задача успешно удалена" });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Form errors:', form.formState.errors);
    
    // Очищаем пустые значения для отправки на сервер
    const cleanData = {
      title: data.title,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate || null,
      reminderDate: data.reminderDate || null,
      estimatedHours: data.estimatedHours || null,
      actualHours: data.actualHours || null,
      equipmentId: (data.equipmentId && data.equipmentId !== "none") ? data.equipmentId : undefined,
      maintenanceType: (data.maintenanceType && data.maintenanceType !== "general") ? data.maintenanceType : undefined,
      description: data.description || undefined,
    };
    
    console.log('Cleaned data for submission:', cleanData);
    
    if (editingTask) {
      updateTask.mutate(cleanData);
    } else {
      createTask.mutate(cleanData);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    form.reset({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      reminderDate: task.reminderDate ? new Date(task.reminderDate) : undefined,
      equipmentId: task.equipmentId || "",
      maintenanceType: task.maintenanceType || "",
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Вы уверены, что хотите удалить эту задачу?")) {
      deleteTask.mutate(id);
    }
  };

  // Функции для работы с замечаниями
  const createTaskFromRemark = async (remark: any) => {
    const taskData = {
      title: `Задача из замечания: ${remark.title}`,
      description: remark.description,
      priority: remark.priority,
      status: "pending" as const,
      equipmentId: remark.equipmentId,
      userId: user?.id || 1
    };
    
    createTask.mutate(taskData);
  };

  const updateRemarkStatus = useMutation({
    mutationFn: async ({ remarkId, status }: { remarkId: string, status: string }) => {
      const updateData = {
        status,
        lastModifiedBy: user?.name || 'Неизвестный пользователь',
        ...(status === 'resolved' && { resolvedBy: user?.name || 'Неизвестный пользователь' })
      };
      const response = await apiRequest('PUT', `/api/remarks/${remarkId}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/remarks'] });
      // Обновляем уведомления и данные замечаний
      window.dispatchEvent(new CustomEvent('remarksUpdated'));
      window.dispatchEvent(new CustomEvent('remarkStatusChanged'));
      toast({
        title: "Статус обновлен",
        description: "Статус замечания успешно изменен"
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус замечания",
        variant: "destructive"
      });
    }
  });

  const handleRemarkStatusChange = (remarkId: string, status: string) => {
    updateRemarkStatus.mutate({ remarkId, status });
  };

  // Фильтрация задач
  const isOverdue = (task: Task) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  };

  const hasReminder = (task: Task) => {
    return task.reminderDate && new Date(task.reminderDate) <= new Date();
  };

  const filteredTasks = tasks.filter((task: Task) => {
    const statusMatch = tasksFilter === "all" || task.status === tasksFilter;
    const priorityMatch = filterPriority === "all" || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const filteredRemarks = remarks.filter((remark) => {
    return remarksFilter === "all" || remark.status === remarksFilter;
  });

  // Счетчики для активных элементов
  const activeTasks = tasks.filter((task: Task) => task.status === 'pending' || task.status === 'in_progress');
  const activeRemarks = remarks.filter((remark) => remark.status === 'open' || remark.status === 'in_progress');

  // Функции стилизации
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <Header />
      
      <div className={cn("transition-all duration-300", isCollapsed ? "ml-16" : "ml-64")}>
        <div className="pt-16">
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              <div className="space-y-6">
                {/* Заголовок */}
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Задачи и замечания
                  </h1>
                  
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
                        <div className="text-sm text-muted-foreground">
                          Поля отмеченные <span className="text-red-500">*</span> обязательны для заполнения.
                          Остальные поля можно оставить пустыми.
                        </div>
                      </DialogHeader>
                      
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">
                                  Название <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Введите название задачи" />
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
                                <FormLabel>Описание (опционально)</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder="Введите описание задачи" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Поле выбора оборудования */}
                          <FormField
                            control={form.control}
                            name="equipmentId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Связанное оборудование (опционально)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Выберите оборудование" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="none">Не связано с оборудованием</SelectItem>
                                    {equipment.map((eq: any) => (
                                      <SelectItem key={eq.id} value={eq.id}>
                                        {eq.name} ({eq.type})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Поле типа ТО (если выбрано оборудование) */}
                          {form.watch("equipmentId") && (
                            <FormField
                              control={form.control}
                              name="maintenanceType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Тип обслуживания</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Выберите тип ТО" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="general">Общая задача</SelectItem>
                                      <SelectItem value="1M-TO">1M-TO (Ежемесячное ТО)</SelectItem>
                                      <SelectItem value="3M-TO">3M-TO (Квартальное ТО)</SelectItem>
                                      <SelectItem value="6M-TO">6M-TO (Полугодовое ТО)</SelectItem>
                                      <SelectItem value="1G-TO">1G-TO (Годовое ТО)</SelectItem>
                                      <SelectItem value="repair">Ремонт</SelectItem>
                                      <SelectItem value="inspection">Инспекция</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="priority"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Приоритет <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value || "medium"}>
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
                              name="status"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Статус <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value || "pending"}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Выберите статус" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="pending">Ожидает</SelectItem>
                                      <SelectItem value="in_progress">В работе</SelectItem>
                                      <SelectItem value="completed">Завершено</SelectItem>
                                      <SelectItem value="overdue">Просрочено</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Даты и время */}
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="dueDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Срок выполнения (опционально)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="datetime-local"
                                      {...field}
                                      value={field.value ? (() => {
                                        const date = new Date(field.value);
                                        const year = date.getFullYear();
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const day = String(date.getDate()).padStart(2, '0');
                                        const hours = String(date.getHours()).padStart(2, '0');
                                        const minutes = String(date.getMinutes()).padStart(2, '0');
                                        return `${year}-${month}-${day}T${hours}:${minutes}`;
                                      })() : ""}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        field.onChange(value ? new Date(value) : null);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="reminderDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Напоминание</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="datetime-local"
                                      {...field}
                                      value={field.value ? (() => {
                                        const date = new Date(field.value);
                                        const year = date.getFullYear();
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const day = String(date.getDate()).padStart(2, '0');
                                        const hours = String(date.getHours()).padStart(2, '0');
                                        const minutes = String(date.getMinutes()).padStart(2, '0');
                                        return `${year}-${month}-${day}T${hours}:${minutes}`;
                                      })() : ""}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        field.onChange(value ? new Date(value) : null);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Время выполнения */}
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="estimatedHours"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Оценочное время (часы)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      placeholder="0.0"
                                      {...field}
                                      value={field.value || ""}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        field.onChange(value ? parseFloat(value) : null);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="actualHours"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Фактическое время (часы)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      placeholder="0.0"
                                      {...field}
                                      value={field.value || ""}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        field.onChange(value ? parseFloat(value) : null);
                                      }}
                                    />
                                  </FormControl>
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
                              onClick={(e) => {
                                console.log('Button clicked');
                                console.log('Form valid:', form.formState.isValid);
                                console.log('Form errors:', form.formState.errors);
                                console.log('Form values:', form.getValues());
                                // Временно отключим проверку валидации
                                // if (!form.formState.isValid) {
                                //   e.preventDefault();
                                //   console.log('Form is not valid, preventing submit');
                                // }
                              }}
                            >
                              {editingTask ? "Сохранить" : "Создать"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Статистические карточки */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Всего задач</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.total}</p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                          <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 dark:text-green-400">
                          {taskStats.total > 0 ? `${Math.round((taskStats.completed / taskStats.total) * 100)}% выполнено` : '0% выполнено'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Активные задачи</p>
                          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{taskStats.pending + taskStats.inProgress}</p>
                        </div>
                        <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                          <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <Clock className="h-4 w-4 text-orange-500 mr-1" />
                        <span className="text-sm text-orange-600 dark:text-orange-400">
                          В работе: {taskStats.inProgress}, Ожидают: {taskStats.pending}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Выполненные</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{taskStats.completed}</p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 dark:text-green-400">
                          Успешно завершены
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Просроченные</p>
                          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{taskStats.overdue}</p>
                        </div>
                        <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-sm text-red-600 dark:text-red-400">
                          Требуют внимания
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Дополнительная статистика по замечаниям */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Статистика замечаний</h3>
                        <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Всего замечаний:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{remarks.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Активные:</span>
                          <span className="font-medium text-orange-600 dark:text-orange-400">
                            {remarks.filter(r => r.status === 'open' || r.status === 'in_progress').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Решённые:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {remarks.filter(r => r.status === 'resolved').length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Производительность</h3>
                        <TrendingUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Эффективность:</span>
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {taskStats.total > 0 ? `${Math.round((taskStats.completed / taskStats.total) * 100)}%` : '0%'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Среднее время:</span>
                          <span className="font-medium text-gray-900 dark:text-white">2.5 дня</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Качество:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">Высокое</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Вкладки */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "tasks" | "remarks")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="tasks" className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4" />
                      Задачи ({activeTasks.length})
                    </TabsTrigger>
                    <TabsTrigger value="remarks" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Замечания ({activeRemarks.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="tasks" className="space-y-6">
                    {/* Фильтры для задач */}
                    <div className="flex gap-4">
                      <Select value={tasksFilter} onValueChange={(value: 'all' | 'pending' | 'in_progress' | 'completed') => setTasksFilter(value)}>
                        <SelectTrigger className="w-48">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Фильтр по статусу" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все статусы</SelectItem>
                          <SelectItem value="pending">Ожидает</SelectItem>
                          <SelectItem value="in_progress">В работе</SelectItem>
                          <SelectItem value="completed">Завершено</SelectItem>
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
                                    <span>Оборудование: {(() => {
                                      const eq = equipment.find((e: any) => e.id === task.equipmentId);
                                      return eq ? eq.name : task.equipmentId;
                                    })()}</span>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span>Создал: {user?.name}</span>
                                </div>
                                
                                {task.lastModifiedBy && (
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>Изменил: {task.lastModifiedBy}</span>
                                  </div>
                                )}
                                
                                {task.completedBy && task.status === 'completed' && (
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>Завершил: {task.completedBy}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-2 mt-4">
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
                    {/* Фильтр для замечаний */}
                    <div className="flex gap-4">
                      <Select value={remarksFilter} onValueChange={(value: 'all' | 'open' | 'in_progress' | 'resolved') => setRemarksFilter(value)}>
                        <SelectTrigger className="w-48">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Фильтр по статусу" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все статусы</SelectItem>
                          <SelectItem value="open">Открыто</SelectItem>
                          <SelectItem value="in_progress">В работе</SelectItem>
                          <SelectItem value="resolved">Решено</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Список замечаний */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredRemarks.length === 0 ? (
                        <div className="col-span-full text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400">
                            {remarksFilter === 'all' ? 'Замечаний не найдено' : 
                             remarksFilter === 'open' ? 'Открытых замечаний не найдено' :
                             remarksFilter === 'in_progress' ? 'Замечаний в работе не найдено' :
                             'Решенных замечаний не найдено'}
                          </p>
                        </div>
                      ) : (
                        filteredRemarks.map((remark: any) => (
                          <Card key={remark.id} className="relative">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-lg">{remark.title}</CardTitle>
                                <Badge className={getPriorityColor(remark.priority)}>
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
                                  <Clock className="w-4 h-4" />
                                  <span>Создано: {format(new Date(remark.createdAt), "dd.MM.yyyy", { locale: ru })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span>Создал: {remark.reportedBy}</span>
                                </div>
                                {remark.lastModifiedBy && (
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>Изменил: {remark.lastModifiedBy}</span>
                                  </div>
                                )}
                                {remark.resolvedBy && remark.status === 'resolved' && (
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>Решил: {remark.resolvedBy}</span>
                                  </div>
                                )}
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
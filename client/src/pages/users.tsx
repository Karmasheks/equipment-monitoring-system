import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileEdit, Trash2, Eye, UserPlus, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";

export default function Users() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Состояния для диалогов
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Состояние формы для добавления/редактирования
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    email: "",
    role: "user",
    department: "",
    position: "",
    password: ""
  });

  // Получение данных пользователей из API
  const { data: usersList = [], isLoading: usersLoading, error: usersError, refetch } = useQuery({
    queryKey: ['/api/users'],
    enabled: !!user && user.role === 'admin',
    staleTime: 0
  });

  // Мутации для работы с пользователями
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest('POST', '/api/users', userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number, userData: any }) => {
      return apiRequest('PUT', `/api/users/${id}`, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    }
  });

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

  // Обработчики для форм
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async () => {
    try {
      await createUserMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        position: formData.position,
        password: formData.password
      });
      
      toast({
        title: "Пользователь добавлен",
        description: `${formData.name} успешно добавлен в систему`,
      });
      
      setAddDialogOpen(false);
      setFormData({
        id: 0,
        name: "",
        email: "",
        role: "user",
        department: "",
        position: "",
        password: ""
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить пользователя",
        variant: "destructive"
      });
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    
    try {
      await updateUserMutation.mutateAsync({
        id: selectedUser.id,
        userData: {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          position: formData.position,
          ...(formData.password && { password: formData.password })
        }
      });
      
      toast({
        title: "Пользователь обновлен",
        description: `Данные ${formData.name} успешно обновлены`,
      });
      
      setEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить пользователя",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteUserMutation.mutateAsync(selectedUser.id);
      
      toast({
        title: "Пользователь удален",
        description: `${selectedUser?.name} удален из системы`,
      });
      
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пользователя",
        variant: "destructive"
      });
    }
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleEditDialogOpen = (user: any) => {
    setSelectedUser(user);
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || "",
      position: user.position || "",
      password: ""
    });
    setEditDialogOpen(true);
  };

  const handleDeleteDialogOpen = (user: any) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'editor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'user': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'editor': return 'Редактор';
      case 'user': return 'Пользователь';
      default: return role;
    }
  };

  // Проверка доступа для не-админов
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Helmet>
          <title>Управление пользователями | Система мониторинга</title>
        </Helmet>
        
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <Header />
            
            <main className="flex-1 p-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Доступ запрещен
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      У вас нет прав для просмотра этой страницы. Только администраторы могут управлять пользователями.
                    </p>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Управление пользователями | Система мониторинга</title>
      </Helmet>
      
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
          <Header />
          
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Управление пользователями</h1>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => refetch()} 
                    variant="outline"
                    disabled={usersLoading}
                    className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${usersLoading ? 'animate-spin' : ''}`} />
                    Обновить
                  </Button>
                  <Button 
                    onClick={() => setAddDialogOpen(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Добавить пользователя
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
                {usersLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Загрузка пользователей...</span>
                  </div>
                ) : usersError ? (
                  <div className="flex items-center justify-center p-8">
                    <span className="text-red-600 dark:text-red-400">Ошибка загрузки пользователей</span>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          Пользователь
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          Роль
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          Отдел
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {Array.isArray(usersList) && usersList.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary-600 text-white">
                                  {item.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || "ПП"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {item.position || "Сотрудник"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getRoleBadgeColor(item.role)}>
                              {getRoleDisplayName(item.role)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.department || "Не указан"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewUser(item)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDialogOpen(item)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                <FileEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDialogOpen(item)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Диалоги */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Добавить пользователя</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Имя</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Роль</Label>
              <Select value={formData.role} onValueChange={(value) => handleSelectChange('role', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Пользователь</SelectItem>
                  <SelectItem value="editor">Редактор</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">Отдел</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">Должность</Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">Пароль</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleAddUser}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Имя</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">Роль</Label>
              <Select value={formData.role} onValueChange={(value) => handleSelectChange('role', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Администратор</SelectItem>
                  <SelectItem value="engineer">Инженер</SelectItem>
                  <SelectItem value="technician">Техник</SelectItem>
                  <SelectItem value="operator">Оператор</SelectItem>
                  <SelectItem value="user">Пользователь</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-department" className="text-right">Отдел</Label>
              <Input
                id="edit-department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-position" className="text-right">Должность</Label>
              <Input
                id="edit-position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right">Новый пароль</Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Оставьте пустым, чтобы не менять"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleEditUser}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Удалить пользователя</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Вы уверены, что хотите удалить пользователя <strong>{selectedUser?.name}</strong>? 
              Это действие нельзя отменить.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Удалить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог просмотра */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Информация о пользователе</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary-600 text-white text-lg">
                  {selectedUser?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || "ПП"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{selectedUser?.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser?.position || "Сотрудник"}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <Label className="text-sm font-medium">Email:</Label>
                <p className="text-sm">{selectedUser?.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Роль:</Label>
                <Badge className={getRoleBadgeColor(selectedUser?.role || '')}>
                  {getRoleDisplayName(selectedUser?.role || '')}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Отдел:</Label>
                <p className="text-sm">{selectedUser?.department || "Не указан"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Дата создания:</Label>
                <p className="text-sm">{selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('ru-RU') : "Не указана"}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
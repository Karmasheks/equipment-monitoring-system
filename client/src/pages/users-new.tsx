import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, Edit, Trash2, Shield, Eye, UserPlus, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UsersPage() {
  const { toast } = useToast();

  // Состояния для пользователей
  const [usersList, setUsersList] = useState([
    {
      id: 1,
      name: "Иванов Иван Иванович",
      email: "admin@example.com",
      role: "admin",
      department: "ИТ отдел",
      position: "Администратор системы",
      avatar: null,
      lastLogin: "2025-05-28T10:30:00"
    },
    {
      id: 2,
      name: "Петров Петр Петрович",
      email: "petrov@example.com",
      role: "engineer",
      department: "Инженерный отдел",
      position: "Ведущий инженер",
      avatar: null,
      lastLogin: "2025-05-27T15:45:00"
    },
    {
      id: 3,
      name: "Сидоров Сидор Сидорович",
      email: "sidorov@example.com",
      role: "operator",
      department: "Производственный отдел",
      position: "Оператор оборудования",
      avatar: null,
      lastLogin: "2025-05-28T09:15:00"
    }
  ]);

  // Состояния для ролей
  const [rolesList, setRolesList] = useState([
    {
      id: 1,
      name: "admin",
      displayName: "Администратор",
      description: "Полный доступ ко всем функциям системы",
      permissions: ["users.read", "users.write", "users.delete", "equipment.read", "equipment.write", "equipment.delete", "maintenance.read", "maintenance.write", "reports.read", "settings.write"]
    },
    {
      id: 2,
      name: "engineer",
      displayName: "Инженер",
      description: "Доступ к управлению оборудованием и техническому обслуживанию",
      permissions: ["equipment.read", "equipment.write", "maintenance.read", "maintenance.write", "reports.read"]
    },
    {
      id: 3,
      name: "operator",
      displayName: "Оператор",
      description: "Базовый доступ к просмотру оборудования и созданию заявок",
      permissions: ["equipment.read", "maintenance.read"]
    }
  ]);

  // Диалоги пользователей
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userFormData, setUserFormData] = useState({
    id: 0,
    name: "",
    email: "",
    role: "operator",
    department: "",
    position: "",
    password: ""
  });
  const [editingUser, setEditingUser] = useState<any>(null);

  // Диалоги ролей
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleFormData, setRoleFormData] = useState({
    id: 0,
    name: "",
    displayName: "",
    description: "",
    permissions: [] as string[]
  });
  const [editingRole, setEditingRole] = useState<any>(null);

  // Доступные разрешения
  const availablePermissions = [
    { id: "users.read", name: "Просмотр пользователей" },
    { id: "users.write", name: "Создание/изменение пользователей" },
    { id: "users.delete", name: "Удаление пользователей" },
    { id: "equipment.read", name: "Просмотр оборудования" },
    { id: "equipment.write", name: "Создание/изменение оборудования" },
    { id: "equipment.delete", name: "Удаление оборудования" },
    { id: "maintenance.read", name: "Просмотр ТО" },
    { id: "maintenance.write", name: "Создание/изменение ТО" },
    { id: "reports.read", name: "Просмотр отчетов" },
    { id: "settings.write", name: "Изменение настроек системы" }
  ];

  // Обработчики пользователей
  const openUserDialog = (user: any = null) => {
    if (user) {
      setEditingUser(user);
      setUserFormData({
        ...user,
        password: ""
      });
    } else {
      setEditingUser(null);
      setUserFormData({
        id: 0,
        name: "",
        email: "",
        role: "operator",
        department: "",
        position: "",
        password: ""
      });
    }
    setUserDialogOpen(true);
  };

  const handleUserSubmit = () => {
    if (editingUser) {
      // Редактирование
      setUsersList(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...userFormData, id: editingUser.id, avatar: user.avatar, lastLogin: user.lastLogin }
          : user
      ));
      toast({
        title: "Пользователь обновлен",
        description: `Информация о ${userFormData.name} успешно обновлена`,
      });
    } else {
      // Добавление
      const newUser = {
        ...userFormData,
        id: Math.max(...usersList.map(u => u.id)) + 1,
        avatar: null,
        lastLogin: new Date().toISOString()
      };
      setUsersList(prev => [...prev, newUser]);
      toast({
        title: "Пользователь добавлен",
        description: `${userFormData.name} успешно добавлен в систему`,
      });
    }
    setUserDialogOpen(false);
  };

  const deleteUser = (userId: number) => {
    const user = usersList.find(u => u.id === userId);
    setUsersList(prev => prev.filter(u => u.id !== userId));
    toast({
      title: "Пользователь удален",
      description: `${user?.name} удален из системы`,
      variant: "destructive"
    });
  };

  // Обработчики ролей
  const openRoleDialog = (role: any = null) => {
    if (role) {
      setEditingRole(role);
      setRoleFormData({
        ...role
      });
    } else {
      setEditingRole(null);
      setRoleFormData({
        id: 0,
        name: "",
        displayName: "",
        description: "",
        permissions: []
      });
    }
    setRoleDialogOpen(true);
  };

  const handleRoleSubmit = () => {
    if (editingRole) {
      // Редактирование
      setRolesList(prev => prev.map(role => 
        role.id === editingRole.id ? { ...roleFormData, id: editingRole.id } : role
      ));
      toast({
        title: "Роль обновлена",
        description: `Роль ${roleFormData.displayName} успешно обновлена`,
      });
    } else {
      // Добавление
      const newRole = {
        ...roleFormData,
        id: Math.max(...rolesList.map(r => r.id)) + 1
      };
      setRolesList(prev => [...prev, newRole]);
      toast({
        title: "Роль добавлена",
        description: `Роль ${roleFormData.displayName} успешно добавлена`,
      });
    }
    setRoleDialogOpen(false);
  };

  const deleteRole = (roleId: number) => {
    const role = rolesList.find(r => r.id === roleId);
    setRolesList(prev => prev.filter(r => r.id !== roleId));
    toast({
      title: "Роль удалена",
      description: `Роль ${role?.displayName} удалена из системы`,
      variant: "destructive"
    });
  };

  const togglePermission = (permissionId: string) => {
    setRoleFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const getRoleDisplayName = (roleName: string) => {
    const role = rolesList.find(r => r.name === roleName);
    return role?.displayName || roleName;
  };

  const getRoleClass = (roleName: string) => {
    switch(roleName) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      case 'engineer': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'operator': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Управление пользователями - Система мониторинга оборудования</title>
        <meta name="description" content="Управление пользователями и ролями доступа в системе мониторинга оборудования" />
      </Helmet>
      
      <div className="flex h-screen">
        <Sidebar />
        <MobileSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-6 py-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Управление пользователями</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Управление пользователями и ролями доступа в системе
                </p>
              </div>

              <Tabs defaultValue="users" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="users" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Пользователи
                  </TabsTrigger>
                  <TabsTrigger value="roles" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Роли и права доступа
                  </TabsTrigger>
                </TabsList>

                {/* Вкладка пользователей */}
                <TabsContent value="users">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Пользователи системы</CardTitle>
                        <CardDescription>
                          Управление учетными записями пользователей
                        </CardDescription>
                      </div>
                      <Button onClick={() => openUserDialog()}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Добавить пользователя
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Пользователь</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Роль</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Отдел</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Должность</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Последний вход</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Действия</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                            {usersList.map((user) => (
                              <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                        <span className="text-sm font-medium text-gray-700">
                                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge className={getRoleClass(user.role)}>
                                    {getRoleDisplayName(user.role)}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.department}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.position}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(user.lastLogin).toLocaleDateString('ru-RU')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <Button variant="ghost" size="sm" onClick={() => openUserDialog(user)}>
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => deleteUser(user.id)}>
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Вкладка ролей */}
                <TabsContent value="roles">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Роли и права доступа</CardTitle>
                        <CardDescription>
                          Настройка ролей и управление правами доступа
                        </CardDescription>
                      </div>
                      <Button onClick={() => openRoleDialog()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить роль
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6">
                        {rolesList.map((role) => (
                          <div key={role.id} className="border rounded-lg p-6 dark:border-gray-700">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {role.displayName}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                  {role.description}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={() => openRoleDialog(role)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => deleteRole(role.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Права доступа:</h4>
                              <div className="flex flex-wrap gap-2">
                                {role.permissions.map((permission) => {
                                  const perm = availablePermissions.find(p => p.id === permission);
                                  return (
                                    <Badge key={permission} variant="secondary">
                                      {perm?.name || permission}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      {/* Диалог пользователя */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">ФИО</Label>
              <Input
                id="name"
                value={userFormData.name}
                onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            {!editingUser && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                  className="col-span-3"
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Роль</Label>
              <Select
                value={userFormData.role}
                onValueChange={(value) => setUserFormData({...userFormData, role: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rolesList.map((role) => (
                    <SelectItem key={role.name} value={role.name}>
                      {role.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">Отдел</Label>
              <Input
                id="department"
                value={userFormData.department}
                onChange={(e) => setUserFormData({...userFormData, department: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">Должность</Label>
              <Input
                id="position"
                value={userFormData.position}
                onChange={(e) => setUserFormData({...userFormData, position: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleUserSubmit}>
              {editingUser ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог роли */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Редактировать роль' : 'Добавить роль'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roleName" className="text-right">Системное имя</Label>
              <Input
                id="roleName"
                value={roleFormData.name}
                onChange={(e) => setRoleFormData({...roleFormData, name: e.target.value})}
                className="col-span-3"
                placeholder="admin, engineer, operator"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="displayName" className="text-right">Название</Label>
              <Input
                id="displayName"
                value={roleFormData.displayName}
                onChange={(e) => setRoleFormData({...roleFormData, displayName: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right mt-2">Описание</Label>
              <Textarea
                id="description"
                value={roleFormData.description}
                onChange={(e) => setRoleFormData({...roleFormData, description: e.target.value})}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">Права доступа</Label>
              <div className="col-span-3 space-y-2">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={permission.id}
                      checked={roleFormData.permissions.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor={permission.id} className="text-sm">
                      {permission.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleRoleSubmit}>
              {editingRole ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
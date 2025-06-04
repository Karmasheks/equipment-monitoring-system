import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { User, Mail, Phone, MapPin, Save, Camera, Lock, Bell, Shield, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function Profile() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Основная информация профиля
  const [profileData, setProfileData] = useState({
    name: user?.name || "Алекс Морган",
    email: user?.email || "admin@example.com", 
    position: user?.position || "Сотрудник",
    avatar: ""
  });

  // Данные для смены пароля
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Настройки уведомлений
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    maintenanceAlerts: true,
    systemUpdates: false,
    weeklyReports: true,
    criticalAlerts: true
  });

  // Настройки приватности
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    statusVisible: true,
    activityVisible: false,
    contactInfoVisible: true
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleProfileUpdate = () => {
    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      toast({
        title: "Ошибка",
        description: "Введите корректный email адрес",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Профиль обновлен",
      description: "Ваши данные успешно сохранены",
    });
  };

  const handlePasswordChange = () => {
    if (!passwordData.currentPassword) {
      toast({
        title: "Ошибка",
        description: "Введите текущий пароль",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Ошибка",
        description: "Новый пароль должен содержать минимум 6 символов",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Пароли не совпадают",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Пароль изменен",
      description: "Ваш пароль успешно обновлен",
    });

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleNotificationUpdate = () => {
    toast({
      title: "Настройки сохранены",
      description: "Настройки уведомлений обновлены",
    });
  };

  const handlePrivacyUpdate = () => {
    toast({
      title: "Настройки сохранены",
      description: "Настройки приватности обновлены",
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Профиль пользователя | Победит 4</title>
        <meta name="description" content="Настройки профиля и персональные данные пользователя" />
      </Helmet>
      
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:pl-64">
          <Header />
          <MobileSidebar />
          
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Профиль пользователя</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Управление личными данными и настройками аккаунта
                </p>
              </div>

              {/* Карточка профиля */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profileData.avatar} alt={profileData.name} />
                        <AvatarFallback className="text-xl font-semibold bg-primary-100 text-primary-600">
                          {getInitials(profileData.name)}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full p-2 h-8 w-8"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profileData.name}</h2>
                      <p className="text-gray-600 dark:text-gray-400">{profileData.position}</p>
                      <div className="mt-3">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Активен
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">Основное</TabsTrigger>
                  <TabsTrigger value="security">Безопасность</TabsTrigger>
                  <TabsTrigger value="notifications">Уведомления</TabsTrigger>
                  <TabsTrigger value="privacy">Приватность</TabsTrigger>
                </TabsList>

                {/* Основная информация */}
                <TabsContent value="general">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Личная информация
                      </CardTitle>
                      <CardDescription>
                        Обновите свои личные данные и контактную информацию
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Полное имя *</Label>
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            placeholder="Введите полное имя"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email адрес *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            placeholder="example@company.com"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="position">Должность</Label>
                          <Input
                            id="position"
                            value={profileData.position}
                            onChange={(e) => setProfileData({...profileData, position: e.target.value})}
                            placeholder="Ваша должность"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="role">Роль доступа</Label>
                          <div className="flex items-center space-x-2">
                            <Badge variant={user?.role === 'admin' ? 'default' : user?.role === 'operator' ? 'secondary' : user?.role === 'engineer' ? 'outline' : 'destructive'}>
                              {user?.role === 'admin' && 'Администратор'}
                              {user?.role === 'operator' && 'Оператор'} 
                              {user?.role === 'engineer' && 'Инженер'}
                              {user?.role === 'viewer' && 'Только просмотр'}
                              {!user?.role && 'Не определена'}
                            </Badge>
                            <p className="text-sm text-gray-500">
                              {user?.role === 'admin' && 'Полный доступ ко всем функциям'}
                              {user?.role === 'operator' && 'Управление оборудованием и отчеты'} 
                              {user?.role === 'engineer' && 'Просмотр и выполнение осмотров'}
                              {user?.role === 'viewer' && 'Только просмотр данных'}
                              {!user?.role && 'Обратитесь к администратору'}
                            </p>
                          </div>
                          <p className="text-xs text-gray-400">
                            Для изменения роли обратитесь к администратору системы
                          </p>
                        </div>
                      </div>

                      <Button onClick={handleProfileUpdate} className="w-full md:w-auto">
                        <Save className="h-4 w-4 mr-2" />
                        Сохранить изменения
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Безопасность */}
                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Lock className="h-5 w-5 mr-2" />
                        Безопасность аккаунта
                      </CardTitle>
                      <CardDescription>
                        Измените пароль и настройте параметры безопасности
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Текущий пароль *</Label>
                          <div className="relative">
                            <Input
                              id="current-password"
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                              placeholder="Введите текущий пароль"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="new-password">Новый пароль *</Label>
                          <div className="relative">
                            <Input
                              id="new-password"
                              type={showNewPassword ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                              placeholder="Введите новый пароль"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Подтверждение пароля *</Label>
                          <div className="relative">
                            <Input
                              id="confirm-password"
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                              placeholder="Повторите новый пароль"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Button onClick={handlePasswordChange} className="w-full md:w-auto">
                        <Lock className="h-4 w-4 mr-2" />
                        Изменить пароль
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Уведомления */}
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Bell className="h-5 w-5 mr-2" />
                        Настройки уведомлений
                      </CardTitle>
                      <CardDescription>
                        Управляйте типами уведомлений, которые вы хотите получать
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>Email уведомления</Label>
                            <p className="text-sm text-gray-500">Получать уведомления на email</p>
                          </div>
                          <Switch
                            checked={notificationSettings.emailNotifications}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>Push уведомления</Label>
                            <p className="text-sm text-gray-500">Получать уведомления в браузере</p>
                          </div>
                          <Switch
                            checked={notificationSettings.pushNotifications}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>Уведомления о ТО</Label>
                            <p className="text-sm text-gray-500">Оповещения о плановом обслуживании</p>
                          </div>
                          <Switch
                            checked={notificationSettings.maintenanceAlerts}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, maintenanceAlerts: checked})}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>Критические оповещения</Label>
                            <p className="text-sm text-gray-500">Важные системные уведомления</p>
                          </div>
                          <Switch
                            checked={notificationSettings.criticalAlerts}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, criticalAlerts: checked})}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>Еженедельные отчеты</Label>
                            <p className="text-sm text-gray-500">Сводка за неделю</p>
                          </div>
                          <Switch
                            checked={notificationSettings.weeklyReports}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weeklyReports: checked})}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>Обновления системы</Label>
                            <p className="text-sm text-gray-500">Уведомления об обновлениях</p>
                          </div>
                          <Switch
                            checked={notificationSettings.systemUpdates}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemUpdates: checked})}
                          />
                        </div>
                      </div>

                      <Button onClick={handleNotificationUpdate} className="w-full md:w-auto">
                        <Save className="h-4 w-4 mr-2" />
                        Сохранить настройки
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Приватность */}
                <TabsContent value="privacy">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        Настройки приватности
                      </CardTitle>
                      <CardDescription>
                        Управляйте видимостью вашей информации для других пользователей
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>Видимость профиля</Label>
                            <p className="text-sm text-gray-500">Другие пользователи могут видеть ваш профиль</p>
                          </div>
                          <Switch
                            checked={privacySettings.profileVisible}
                            onCheckedChange={(checked) => setPrivacySettings({...privacySettings, profileVisible: checked})}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>Показывать статус</Label>
                            <p className="text-sm text-gray-500">Отображать ваш статус активности</p>
                          </div>
                          <Switch
                            checked={privacySettings.statusVisible}
                            onCheckedChange={(checked) => setPrivacySettings({...privacySettings, statusVisible: checked})}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>История активности</Label>
                            <p className="text-sm text-gray-500">Показывать последнюю активность</p>
                          </div>
                          <Switch
                            checked={privacySettings.activityVisible}
                            onCheckedChange={(checked) => setPrivacySettings({...privacySettings, activityVisible: checked})}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>Контактная информация</Label>
                            <p className="text-sm text-gray-500">Показывать email и телефон</p>
                          </div>
                          <Switch
                            checked={privacySettings.contactInfoVisible}
                            onCheckedChange={(checked) => setPrivacySettings({...privacySettings, contactInfoVisible: checked})}
                          />
                        </div>
                      </div>

                      <Button onClick={handlePrivacyUpdate} className="w-full md:w-auto">
                        <Save className="h-4 w-4 mr-2" />
                        Сохранить настройки
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
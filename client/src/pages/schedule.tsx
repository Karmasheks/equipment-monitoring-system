import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useEquipmentData } from "@/hooks/use-equipment-data";
import { useMaintenanceApi } from "@/hooks/use-maintenance-api";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Clock, AlertTriangle, CheckCircle, Filter, Edit, Trash2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, startOfYear, endOfYear, eachMonthOfInterval } from "date-fns";
import { ru } from "date-fns/locale";

export default function Schedule() {
  const [, setLocation] = useLocation();
  // Загрузка оборудования из API
  const { data: equipment = [] } = useQuery({
    queryKey: ['/api/equipment'],
  });
  
  // Фильтруем только активное оборудование (исключаем выведенное из эксплуатации)
  const getActiveEquipment = () => equipment.filter((eq: any) => eq.status !== 'decommissioned');
  
  const { maintenanceRecords, addMaintenance, updateMaintenance, deleteMaintenance } = useMaintenanceApi();
  
  // Загрузка задач с датами
  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'month' | 'year'>('month');
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    equipmentName: '',
    type: '1М - ТО',
    duration: '',
    responsible: 'Купцов Денис',
    status: 'scheduled',
    priority: 'medium',
    notes: ''
  });
  
  // Инициализация данных расписания с сохранением в localStorage
  const initialScheduleData = [
    // ЯНВАРЬ 2025
    {
      id: 1,
      equipmentName: "Nmill 1400",
      type: "6М - ТО",
      date: new Date(2025, 0, 7), // 7 января - вторник
      duration: "4 часа",
      responsible: "Купцов Денис",
      status: "completed",
      priority: "medium"
    },
    {
      id: 2,
      equipmentName: "Versa 645",
      type: "1М - ТО",
      date: new Date(2025, 0, 14), // 14 января - вторник
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "completed",
      priority: "low"
    },
    {
      id: 3,
      equipmentName: "Versa 823",
      type: "6М - ТО",
      date: new Date(2025, 0, 20), // 20 января
      duration: "4 часа",
      responsible: "Купцов Денис",
      status: "completed",
      priority: "medium"
    },
    {
      id: 4,
      equipmentName: "Versa 1000",
      type: "1М - ТО",
      date: new Date(2025, 0, 27), // 27 января
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "completed",
      priority: "low"
    },

    // ФЕВРАЛЬ 2025  
    {
      id: 5,
      equipmentName: "BF20",
      type: "6М - ТО",
      date: new Date(2025, 1, 3), // 3 февраля
      duration: "3 часа",
      responsible: "Купцов Денис",
      status: "completed",
      priority: "medium"
    },
    {
      id: 6,
      equipmentName: "BF30 CNC",
      type: "1М - ТО",
      date: new Date(2025, 1, 10), // 10 февраля  
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "completed",
      priority: "low"
    },
    {
      id: 7,
      equipmentName: "Okamoto",
      type: "6М - ТО",
      date: new Date(2025, 1, 17), // 17 февраля
      duration: "3 часа", 
      responsible: "Купцов Денис",
      status: "completed",
      priority: "medium"
    },
    {
      id: 8,
      equipmentName: "Seiger",
      type: "6М - ТО",
      date: new Date(2025, 1, 24), // 24 февраля
      duration: "3 часа",
      responsible: "Купцов Денис",
      status: "completed",
      priority: "medium"
    },

    // МАРТ 2025
    {
      id: 9,
      equipmentName: "Haas UMC 750",
      type: "1М - ТО",
      date: new Date(2025, 2, 3), // 3 марта
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "completed",
      priority: "low"
    },
    {
      id: 10,
      equipmentName: "Studer S40",
      type: "6М - ТО",
      date: new Date(2025, 2, 10), // 10 марта
      duration: "3 часа",
      responsible: "Купцов Денис",
      status: "completed",
      priority: "medium"
    },
    {
      id: 11,
      equipmentName: "UNIMAX 3AV",
      type: "6М - ТО",
      date: new Date(2025, 2, 17), // 17 марта
      duration: "3 часа",
      responsible: "Купцов Денис", 
      status: "completed",
      priority: "medium"
    },
    {
      id: 12,
      equipmentName: "Darex XT-3000",
      type: "1М - ТО",
      date: new Date(2025, 2, 24), // 24 марта
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "completed",
      priority: "low"
    },
    {
      id: 13,
      equipmentName: "PreSet 2D+C",
      type: "6М - ТО",
      date: new Date(2025, 2, 31), // 31 марта
      duration: "3 часа",
      responsible: "Купцов Денис",
      status: "completed",
      priority: "medium"
    },

    // АПРЕЛЬ 2025
    {
      id: 14,
      equipmentName: "Лица Optisaw",
      type: "1М - ТО",
      date: new Date(2025, 3, 7), // 7 апреля
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "completed",
      priority: "low"
    },
    {
      id: 15,
      equipmentName: "Mikron VCE 800",
      type: "6М - ТО",
      date: new Date(2025, 3, 14), // 14 апреля
      duration: "3 часа",
      responsible: "Купцов Денис",
      status: "completed",
      priority: "medium"
    },
    {
      id: 16,
      equipmentName: "Mikron VCE 1000",
      type: "1М - ТО",
      date: new Date(2025, 3, 21), // 21 апреля
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "completed",
      priority: "low"
    },
    {
      id: 17,
      equipmentName: "BILZ",
      type: "6М - ТО",
      date: new Date(2025, 3, 28), // 28 апреля
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "completed",
      priority: "medium"
    },

    // МАЙ 2025 (текущие и будущие работы)
    {
      id: 18,
      equipmentName: "Jungheinrich",
      type: "1М - ТО",
      date: new Date(2025, 4, 5), // 5 мая
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "in_progress",
      priority: "low"
    },
    {
      id: 19,
      equipmentName: "UNIMAX 3AV",
      type: "6М - ТО",
      date: new Date(2025, 4, 12), // 12 мая
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "medium"
    },
    {
      id: 20,
      equipmentName: "Darex XT-3000",
      type: "1М - ТО",
      date: new Date(2025, 4, 19), // 19 мая
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "low"
    },
    {
      id: 21,
      equipmentName: "Токар. TU2304V",
      type: "6М - ТО",
      date: new Date(2025, 4, 26), // 26 мая
      duration: "3 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "medium"
    },

    // ИЮНЬ 2025
    {
      id: 22,
      equipmentName: "Лица Optisaw",
      type: "1М - ТО",
      date: new Date(2025, 5, 2), // 2 июня
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "low"
    },
    {
      id: 23,
      equipmentName: "Фрез. BF20",
      type: "6М - ТО",
      date: new Date(2025, 5, 9), // 9 июня
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "medium"
    },
    {
      id: 24,
      equipmentName: "Фрез. BF30 CNC",
      type: "1М - ТО",
      date: new Date(2025, 5, 16), // 16 июня
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "low"
    },
    {
      id: 25,
      equipmentName: "ZR1000",
      type: "6М - ТО",
      date: new Date(2025, 5, 23), // 23 июня
      duration: "3 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "medium"
    },
    {
      id: 26,
      equipmentName: "Nmill 1400",
      type: "6М - ТО",
      date: new Date(2025, 5, 30), // 30 июня
      duration: "4 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "medium"
    },
    {
      id: 27,
      equipmentName: "Erowa Robot",
      type: "3М - ТО",
      date: new Date(2025, 3, 15), // 15 апреля - невыполненное ТО
      duration: "8 часов",
      responsible: "Купцов Денис",
      status: "overdue",
      priority: "high"
    },
    {
      id: 28,
      equipmentName: "Z24",
      type: "1Г - ТО",
      date: new Date(2025, 7, 15), // 15 августа - пятница (работы вне плана)
      duration: "6 часов",
      responsible: "Купцов Денис",
      status: "unplanned",
      priority: "medium"
    },

    // ИЮЛЬ 2025
    {
      id: 29,
      equipmentName: "Versa 645",
      type: "6М - ТО",
      date: new Date(2025, 6, 7), // 7 июля - понедельник
      duration: "4 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "medium"
    },
    {
      id: 30,
      equipmentName: "Mikron",
      type: "6М - ТО",
      date: new Date(2025, 6, 14), // 14 июля - понедельник
      duration: "4 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "medium"
    },
    {
      id: 31,
      equipmentName: "Seiger",
      type: "1М - ТО",
      date: new Date(2025, 6, 21), // 21 июля - понедельник
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "low"
    },
    {
      id: 32,
      equipmentName: "Z612",
      type: "1М - ТО",
      date: new Date(2025, 6, 28), // 28 июля - понедельник
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "low"
    },

    // АВГУСТ 2025
    {
      id: 33,
      equipmentName: "EA12V (2016)",
      type: "6М - ТО",
      date: new Date(2025, 7, 4), // 4 августа
      duration: "3 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "medium"
    },
    {
      id: 34,
      equipmentName: "EA12V (2019)",
      type: "1М - ТО",
      date: new Date(2025, 7, 11), // 11 августа
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "low"
    },
    {
      id: 35,
      equipmentName: "MP2400",
      type: "1М - ТО",
      date: new Date(2025, 7, 18), // 18 августа
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "low"
    },
    {
      id: 36,
      equipmentName: "Start 43C",
      type: "6М - ТО",
      date: new Date(2025, 7, 25), // 25 августа
      duration: "3 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "medium"
    },

    // СЕНТЯБРЬ 2025
    {
      id: 37,
      equipmentName: "PreSet 2D+C",
      type: "1М - ТО",
      date: new Date(2025, 8, 1), // 1 сентября
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "low"
    },
    {
      id: 38,
      equipmentName: "EVO Diodeline",
      type: "6М - ТО",
      date: new Date(2025, 8, 8), // 8 сентября
      duration: "4 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "medium"
    },
    {
      id: 39,
      equipmentName: "Pegas",
      type: "1М - ТО",
      date: new Date(2025, 8, 15), // 15 сентября
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "low"
    },
    {
      id: 40,
      equipmentName: "LH87",
      type: "6М - ТО",
      date: new Date(2025, 8, 22), // 22 сентября
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "medium"
    },
    {
      id: 41,
      equipmentName: "BILZ",
      type: "1М - ТО",
      date: new Date(2025, 8, 29), // 29 сентября
      duration: "1 час",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "low"
    },

    // ОКТЯБРЬ 2025
    {
      id: 42,
      equipmentName: "Jungheinrich",
      type: "6М - ТО",
      date: new Date(2025, 9, 6), // 6 октября
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "medium"
    },
    {
      id: 43,
      equipmentName: "UNIMAX 3AV",
      type: "1М - ТО",
      date: new Date(2025, 9, 13), // 13 октября
      duration: "1 час",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "low"
    },
    {
      id: 44,
      equipmentName: "Darex XT-3000",
      type: "6М - ТО",
      date: new Date(2025, 9, 20), // 20 октября
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "medium"
    },
    {
      id: 45,
      equipmentName: "Токар. TU2304V",
      type: "1М - ТО",
      date: new Date(2025, 9, 27), // 27 октября
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "low"
    },

    // НОЯБРЬ 2025
    {
      id: 46,
      equipmentName: "Лица Optisaw",
      type: "6М - ТО",
      date: new Date(2025, 10, 3), // 3 ноября
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "medium"
    },
    {
      id: 47,
      equipmentName: "Фрез. BF20",
      type: "1М - ТО",
      date: new Date(2025, 10, 10), // 10 ноября
      duration: "1 час",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "low"
    },
    {
      id: 48,
      equipmentName: "Фрез. BF30 CNC",
      type: "6М - ТО",
      date: new Date(2025, 10, 17), // 17 ноября
      duration: "3 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "medium"
    },
    {
      id: 49,
      equipmentName: "ZR1000",
      type: "1М - ТО",
      date: new Date(2025, 10, 24), // 24 ноября
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "low"
    },

    // ДЕКАБРЬ 2025
    {
      id: 50,
      equipmentName: "Nmill 1400",
      type: "1М - ТО",
      date: new Date(2025, 11, 1), // 1 декабря
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "low"
    },
    {
      id: 51,
      equipmentName: "Versa 823",
      type: "6М - ТО",
      date: new Date(2025, 11, 8), // 8 декабря
      duration: "4 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "medium"
    },
    {
      id: 52,
      equipmentName: "Okamoto",
      type: "1М - ТО",
      date: new Date(2025, 11, 15), // 15 декабря
      duration: "2 часа",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "low"
    },
    {
      id: 53,
      equipmentName: "Erowa Robot",
      type: "1Г - ТО",
      date: new Date(2025, 11, 22), // 22 декабря - капитальный ремонт
      duration: "8 часов",
      responsible: "Купцов Денис",
      status: "scheduled",
      priority: "high"
    }
  ];

  // Функция открытия диалога редактирования записи ТО
  const openEditDialog = (maintenanceItem: any) => {
    setSelectedMaintenance(maintenanceItem);
    setFormData({
      equipmentName: maintenanceItem.equipmentName,
      type: maintenanceItem.type,
      duration: maintenanceItem.duration,
      responsible: maintenanceItem.responsible,
      status: maintenanceItem.status,
      priority: maintenanceItem.priority,
      notes: maintenanceItem.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  // Преобразуем записи ТО из базы данных в формат календаря
  const maintenanceSchedule = maintenanceRecords.map(record => ({
    id: record.id,
    equipmentName: record.equipmentName,
    type: record.maintenanceType,
    date: new Date(record.scheduledDate),
    duration: record.duration || "2 часа",
    responsible: record.responsible || "Купцов Денис",
    status: record.status,
    priority: record.priority || "medium",
    notes: record.notes || ""
  }));

  // Функция добавления нового ТО в базу данных
  const addMaintenanceToSchedule = async (maintenance: any) => {
    const newRecord = {
      equipmentId: equipment.find(eq => eq.name === maintenance.equipmentName)?.id || 'FM001',
      equipmentName: maintenance.equipmentName,
      maintenanceType: maintenance.type,
      scheduledDate: maintenance.date.toISOString(),
      status: maintenance.status,
      responsible: maintenance.responsible,
      duration: maintenance.duration,
      priority: maintenance.priority,
      notes: maintenance.notes || '',
      completedDate: undefined,
      actualDuration: undefined
    };
    
    await addMaintenanceRecord(newRecord);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Генерируем календарные дни с правильным выравниванием
  const firstDayOfWeek = monthStart.getDay(); // 0 = Воскресенье, 1 = Понедельник
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Преобразуем для понедельника = 0
  
  // Добавляем пустые дни в начале для правильного выравнивания
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(monthStart.getDate() - adjustedFirstDay);
  
  // Добавляем дни до конца календарной сетки (всего 42 дня = 6 недель)
  const calendarEnd = new Date(calendarStart);
  calendarEnd.setDate(calendarStart.getDate() + 41);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Для годового вида
  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);
  const yearMonths = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const getMaintenanceForDay = (day: Date) => {
    return maintenanceSchedule.filter(item => isSameDay(item.date, day));
  };

  // Функция для получения задач с датами для определенного дня
  const getTasksForDay = (day: Date) => {
    return tasks.filter((task: any) => 
      task.dueDate && isSameDay(new Date(task.dueDate), day)
    );
  };

  // Функция для получения всех событий дня (ТО + задачи)
  const getAllEventsForDay = (day: Date) => {
    const maintenanceEvents = getMaintenanceForDay(day);
    const taskEvents = getTasksForDay(day);
    return { maintenance: maintenanceEvents, tasks: taskEvents };
  };

  const getMaintenanceForMonth = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    return maintenanceSchedule.filter(item => 
      item.date >= monthStart && item.date <= monthEnd
    );
  };

  // Список оборудования для выбора (берем из базы данных)
  const equipmentList = getActiveEquipment().map(eq => eq.name);

  const responsibleList = [
    "Купцов Денис",
    "Калюжный Никита", 
    "Пырихин Илья"
  ];

  // Обработчики для форм
  const handleDayClick = (day: Date) => {
    // Всегда позволяем создать новое ТО на выбранный день
    setSelectedDate(day);
    setFormData({
      equipmentName: '',
      type: '1М - ТО',
      duration: '2 часа',
      responsible: 'Купцов Денис',
      status: 'scheduled',
      priority: 'medium',
      notes: ''
    });
    setIsAddDialogOpen(true);
  };

  const handleSaveAdd = async () => {
    if (!selectedDate) return;
    
    // Находим оборудование по имени для получения ID
    const equipmentItem = equipment.find(eq => eq.name === formData.equipmentName);
    
    if (equipmentItem) {
      // Создаем запись ТО в базе данных
      const newMaintenanceRecord = {
        equipmentId: equipmentItem.id,
        equipmentName: formData.equipmentName,
        maintenanceType: formData.type,
        scheduledDate: selectedDate,
        duration: formData.duration,
        responsible: formData.responsible,
        status: formData.status as 'scheduled' | 'in_progress' | 'completed' | 'postponed',
        priority: formData.priority as 'low' | 'medium' | 'high' | 'critical'
      };

      await addMaintenance(newMaintenanceRecord);
    }

    // Данные автоматически обновятся через useMaintenanceData
    setIsAddDialogOpen(false);
    setSelectedDate(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedMaintenance) return;
    
    try {
      const equipmentItem = equipment.find(eq => eq.name === formData.equipmentName);
      
      const updates = {
        equipmentId: equipmentItem?.id || selectedMaintenance.equipmentId,
        equipmentName: formData.equipmentName,
        maintenanceType: formData.type,
        scheduledDate: selectedMaintenance.date instanceof Date 
          ? selectedMaintenance.date 
          : new Date(selectedMaintenance.date),
        duration: formData.duration,
        responsible: formData.responsible,
        status: formData.status as 'scheduled' | 'in_progress' | 'completed' | 'postponed',
        priority: formData.priority as 'low' | 'medium' | 'high' | 'critical',
        notes: formData.notes
      };

      await updateMaintenance({ id: selectedMaintenance.id, updates });
      setIsEditDialogOpen(false);
      setSelectedMaintenance(null);
    } catch (error) {
      console.error('Ошибка обновления записи ТО:', error);
    }
  };

  const handleDeleteMaintenance = async () => {
    if (!selectedMaintenance) return;
    
    if (confirm('Вы уверены, что хотите удалить эту запись ТО?')) {
      try {
        await deleteMaintenance(selectedMaintenance.id);
        setIsEditDialogOpen(false);
        setSelectedMaintenance(null);
      } catch (error) {
        console.error('Ошибка удаления записи ТО:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': // Запланированное ТО / Перенос ТО
        return 'bg-yellow-300 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100';
      case 'overdue': // Невыполненное ТО / ТО на следующий год
        return 'bg-red-300 text-red-900 dark:bg-red-600 dark:text-red-100';
      case 'completed': // Выполненное ТО
        return 'bg-green-300 text-green-900 dark:bg-green-600 dark:text-green-100';
      case 'unplanned': // Работы вне плана с описанием в комментариях
        return 'bg-orange-300 text-orange-900 dark:bg-orange-600 dark:text-orange-100';
      case 'in_progress': // В процессе выполнения
        return 'bg-blue-300 text-blue-900 dark:bg-blue-600 dark:text-blue-100';
      default:
        return 'bg-gray-300 text-gray-900 dark:bg-gray-600 dark:text-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <AlertTriangle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Запланировано';
      case 'in_progress':
        return 'В процессе';
      case 'completed':
        return 'Завершено';
      case 'overdue':
        return 'Просрочено';
      default:
        return 'Неизвестно';
    }
  };

  const upcomingMaintenance = maintenanceSchedule
    .filter(item => item.status === 'scheduled' || item.status === 'overdue')
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>График ТО - Система мониторинга оборудования</title>
        <meta name="description" content="График технического обслуживания оборудования" />
      </Helmet>
      
      <div className="flex h-screen">
        <Sidebar />
        <MobileSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Header />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-6 py-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">График ТО</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Планирование и отслеживание технического обслуживания оборудования
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Календарь */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          {viewType === 'month' 
                            ? format(currentDate, 'LLLL yyyy', { locale: ru })
                            : format(currentDate, 'yyyy', { locale: ru }) + ' год'
                          }
                        </CardTitle>
                        <CardDescription>
                          График планового технического обслуживания
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {/* Кнопки переключения вида */}
                        <div className="flex gap-1 mr-4">
                          <Button
                            variant={viewType === 'month' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewType('month')}
                          >
                            Месяц
                          </Button>
                          <Button
                            variant={viewType === 'year' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewType('year')}
                          >
                            Год
                          </Button>
                        </div>
                        {/* Навигация по времени */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentDate(
                            viewType === 'month' 
                              ? subMonths(currentDate, 1)
                              : new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate())
                          )}
                        >
                          ←
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentDate(
                            viewType === 'month'
                              ? addMonths(currentDate, 1)
                              : new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate())
                          )}
                        >
                          →
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {viewType === 'month' ? (
                        // Месячный вид
                        <>
                          <div className="grid grid-cols-7 gap-1 mb-4">
                            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                              <div key={day} className="p-2 text-center text-sm font-medium text-gray-900">
                                {day}
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map(day => {
                              const { maintenance: dayMaintenance, tasks: dayTasks } = getAllEventsForDay(day);
                              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                              const isCurrentDay = isToday(day);
                              
                              return (
                                <div
                                  key={day.toString()}
                                  onClick={() => handleDayClick(day)}
                                  className={`min-h-[80px] p-1 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                                    isCurrentDay
                                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
                                      : isCurrentMonth
                                        ? 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        : 'bg-gray-50 border-gray-100 dark:bg-gray-900 dark:border-gray-800 opacity-50'
                                  }`}
                                >
                                  <div className={`text-sm font-medium mb-1 ${
                                    isCurrentMonth 
                                      ? 'text-gray-900' 
                                      : 'text-gray-600'
                                  }`}>
                                    {format(day, 'd')}
                                  </div>
                                  <div className="space-y-1">
                                    {/* Отображение записей ТО */}
                                    {dayMaintenance.map(item => (
                                      <div
                                        key={`maintenance-${item.id}`}
                                        className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(item.status)}`}
                                        title={`${item.equipmentName} - ${item.type} (Нажмите для редактирования)`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openEditDialog(item);
                                        }}
                                      >
                                        {item.equipmentName.length > 10 
                                          ? item.equipmentName.substring(0, 10) + '...'
                                          : item.equipmentName
                                        }
                                      </div>
                                    ))}
                                    
                                    {/* Отображение задач */}
                                    {dayTasks.map((task: any) => {
                                      const taskEquipment = task.equipmentId ? 
                                        equipment.find((e: any) => e.id === task.equipmentId) : null;
                                      const equipmentName = taskEquipment ? taskEquipment.name : task.equipmentId;
                                      
                                      return (
                                        <div
                                          key={`task-${task.id}`}
                                          className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                                            task.status === 'completed' 
                                              ? 'bg-green-100 text-green-800 border border-green-200' 
                                              : task.priority === 'urgent' || task.priority === 'high'
                                                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                                : 'bg-purple-100 text-purple-800 border border-purple-200'
                                          }`}
                                          title={`Задача: ${task.title}${equipmentName ? ` (${equipmentName})` : ''} - ${task.priority === 'urgent' ? 'Срочно' : task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setLocation("/tasks");
                                          }}
                                        >
                                          📋 {task.title.length > 8 
                                            ? task.title.substring(0, 8) + '...'
                                            : task.title
                                          }
                                          {equipmentName && (
                                            <div className="text-xs opacity-75 mt-1">
                                              {equipmentName.length > 10 
                                                ? equipmentName.substring(0, 10) + '...'
                                                : equipmentName
                                              }
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                    
                                    {dayMaintenance.length === 0 && dayTasks.length === 0 && (
                                      <div className="text-xs text-gray-700 text-center py-2">
                                        + Добавить ТО
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        // Годовой вид
                        <div className="grid grid-cols-3 gap-4">
                          {yearMonths.map(month => {
                            const monthMaintenance = getMaintenanceForMonth(month);
                            const monthStats = {
                              scheduled: monthMaintenance.filter(item => item.status === 'scheduled').length,
                              completed: monthMaintenance.filter(item => item.status === 'completed').length,
                              overdue: monthMaintenance.filter(item => item.status === 'overdue').length,
                              unplanned: monthMaintenance.filter(item => item.status === 'unplanned').length
                            };
                            
                            return (
                              <div
                                key={month.toString()}
                                className="p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => {
                                  setCurrentDate(month);
                                  setViewType('month');
                                }}
                              >
                                <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                  {format(month, 'LLLL', { locale: ru })}
                                </div>
                                <div className="space-y-2">
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Всего ТО: {monthMaintenance.length}
                                  </div>
                                  <div className="grid grid-cols-2 gap-1 text-xs">
                                    {monthStats.scheduled > 0 && (
                                      <div className="bg-yellow-300 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100 px-2 py-1 rounded">
                                        Запланировано: {monthStats.scheduled}
                                      </div>
                                    )}
                                    {monthStats.completed > 0 && (
                                      <div className="bg-green-300 dark:bg-green-600 text-green-900 dark:text-green-100 px-2 py-1 rounded">
                                        Выполнено: {monthStats.completed}
                                      </div>
                                    )}
                                    {monthStats.overdue > 0 && (
                                      <div className="bg-red-300 dark:bg-red-600 text-red-900 dark:text-red-100 px-2 py-1 rounded">
                                        Просрочено: {monthStats.overdue}
                                      </div>
                                    )}
                                    {monthStats.unplanned > 0 && (
                                      <div className="bg-orange-300 dark:bg-orange-600 text-orange-900 dark:text-orange-100 px-2 py-1 rounded">
                                        Внеплановые: {monthStats.unplanned}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Боковая панель с предстоящими работами */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Предстоящие работы
                      </CardTitle>
                      <CardDescription>
                        Ближайшие запланированные работы по ТО
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {upcomingMaintenance.map(item => (
                        <div key={item.id} className="border rounded-lg p-3 dark:border-gray-700">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {item.equipmentName}
                            </h4>
                            <Badge className={getStatusColor(item.status)}>
                              {getStatusIcon(item.status)}
                              <span className="ml-1">{getStatusText(item.status)}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {item.type}
                          </p>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <div>📅 {format(item.date, 'dd.MM.yyyy', { locale: ru })}</div>
                            <div>⏱️ {item.duration}</div>
                            <div>👤 {item.responsible}</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Пояснения
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Типы ТО */}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Типы технического обслуживания:</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-400 dark:bg-blue-500 border border-blue-600 dark:border-blue-400 rounded"></div>
                            <span className="text-gray-700 dark:text-gray-300"><strong>1М - ТО</strong> - Ежемесячное обслуживание</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-indigo-400 dark:bg-indigo-500 border border-indigo-600 dark:border-indigo-400 rounded"></div>
                            <span className="text-gray-700 dark:text-gray-300"><strong>3М - ТО</strong> - Квартальное обслуживание</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-purple-400 dark:bg-purple-500 border border-purple-600 dark:border-purple-400 rounded"></div>
                            <span className="text-gray-700 dark:text-gray-300"><strong>6М - ТО</strong> - Полугодовое обслуживание</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-violet-400 dark:bg-violet-500 border border-violet-600 dark:border-violet-400 rounded"></div>
                            <span className="text-gray-700 dark:text-gray-300"><strong>1Г - ТО</strong> - Годовое обслуживание</span>
                          </div>
                        </div>
                      </div>

                      {/* Статусы */}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Статусы выполнения:</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-400 dark:bg-yellow-500 border border-yellow-600 dark:border-yellow-400 rounded"></div>
                            <span className="text-gray-700 dark:text-gray-300">Запланированное ТО / Перенос ТО</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-400 dark:bg-red-500 border border-red-600 dark:border-red-400 rounded"></div>
                            <span className="text-gray-700 dark:text-gray-300">Невыполненное ТО / ТО на следующий год</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-400 dark:bg-green-500 border border-green-600 dark:border-green-400 rounded"></div>
                            <span className="text-gray-700 dark:text-gray-300">Выполненное ТО</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-400 dark:bg-orange-500 border border-orange-600 dark:border-orange-400 rounded"></div>
                            <span className="text-gray-700 dark:text-gray-300">Работы вне плана с описанием в комментариях</span>
                          </div>
                        </div>
                      </div>

                      {/* Статистика */}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Статистика за период:</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Запланировано:</span>
                            <span className="font-medium text-yellow-600 dark:text-yellow-400">
                              {maintenanceSchedule.filter(item => item.status === 'scheduled').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Просрочено:</span>
                            <span className="font-medium text-red-600 dark:text-red-400">
                              {maintenanceSchedule.filter(item => item.status === 'overdue').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Завершено:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {maintenanceSchedule.filter(item => item.status === 'completed').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Вне плана:</span>
                            <span className="font-medium text-orange-600 dark:text-orange-400">
                              {maintenanceSchedule.filter(item => item.status === 'unplanned').length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Диалог добавления нового ТО */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Добавить ТО на {selectedDate && format(selectedDate, 'd MMMM yyyy', { locale: ru })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="equipment">Оборудование</Label>
              <Select 
                value={formData.equipmentName} 
                onValueChange={(value) => setFormData({...formData, equipmentName: value})}
              >
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
            
            <div>
              <Label htmlFor="type">Тип ТО</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({...formData, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1М - ТО">1М - ТО</SelectItem>
                  <SelectItem value="3М - ТО">3М - ТО</SelectItem>
                  <SelectItem value="6М - ТО">6М - ТО</SelectItem>
                  <SelectItem value="1Г - ТО">1Г - ТО</SelectItem>
                  <SelectItem value="Ремонт">Ремонт</SelectItem>
                  <SelectItem value="Незапланированные работы">Незапланированные работы</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Длительность</Label>
              <Select 
                value={formData.duration} 
                onValueChange={(value) => setFormData({...formData, duration: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 час">1 час</SelectItem>
                  <SelectItem value="2 часа">2 часа</SelectItem>
                  <SelectItem value="4 часа">4 часа</SelectItem>
                  <SelectItem value="8 часов">8 часов</SelectItem>
                  <SelectItem value="16 часов">16 часов</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="responsible">Ответственный</Label>
              <Select 
                value={formData.responsible} 
                onValueChange={(value) => setFormData({...formData, responsible: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {responsibleList.map(person => (
                    <SelectItem key={person} value={person}>
                      {person}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Статус</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Запланировано</SelectItem>
                  <SelectItem value="in_progress">В процессе</SelectItem>
                  <SelectItem value="completed">Выполнено</SelectItem>
                  <SelectItem value="overdue">Просрочено</SelectItem>
                  <SelectItem value="unplanned">Незапланированная работа</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Приоритет</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({...formData, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Примечания</Label>
              <Textarea 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Дополнительная информация..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveAdd} disabled={!formData.equipmentName}>
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования ТО */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Редактировать ТО - {selectedMaintenance?.equipmentName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="equipment">Оборудование</Label>
              <Select 
                value={formData.equipmentName} 
                onValueChange={(value) => setFormData({...formData, equipmentName: value})}
              >
                <SelectTrigger>
                  <SelectValue />
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
            
            <div>
              <Label htmlFor="type">Тип ТО</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({...formData, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1М - ТО">1М - ТО</SelectItem>
                  <SelectItem value="3М - ТО">3М - ТО</SelectItem>
                  <SelectItem value="6М - ТО">6М - ТО</SelectItem>
                  <SelectItem value="1Г - ТО">1Г - ТО</SelectItem>
                  <SelectItem value="Ремонт">Ремонт</SelectItem>
                  <SelectItem value="Незапланированные работы">Незапланированные работы</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Длительность</Label>
              <Select 
                value={formData.duration} 
                onValueChange={(value) => setFormData({...formData, duration: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 час">1 час</SelectItem>
                  <SelectItem value="2 часа">2 часа</SelectItem>
                  <SelectItem value="4 часа">4 часа</SelectItem>
                  <SelectItem value="8 часов">8 часов</SelectItem>
                  <SelectItem value="16 часов">16 часов</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="responsible">Ответственный</Label>
              <Select 
                value={formData.responsible} 
                onValueChange={(value) => setFormData({...formData, responsible: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {responsibleList.map(person => (
                    <SelectItem key={person} value={person}>
                      {person}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Статус</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Запланировано</SelectItem>
                  <SelectItem value="in_progress">В процессе</SelectItem>
                  <SelectItem value="completed">Выполнено</SelectItem>
                  <SelectItem value="overdue">Просрочено</SelectItem>
                  <SelectItem value="unplanned">Незапланированная работа</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Приоритет</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({...formData, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Примечания</Label>
              <Textarea 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Дополнительная информация..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDeleteMaintenance}>
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить
            </Button>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
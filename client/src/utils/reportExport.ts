import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ExportData {
  tasks: any[];
  remarks: any[];
  maintenance: any[];
  equipment: any[];
}

export const exportToPDF = (data: ExportData, title: string) => {
  const doc = new jsPDF();
  
  // Заголовок на английском языке из-за ограничений jsPDF с кириллицей
  doc.setFontSize(18);
  doc.text('Equipment Management System Report', 20, 20);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US')}`, 20, 30);
  
  let yPosition = 50;
  
  // Таблица задач
  if (data.tasks.length > 0) {
    doc.setFontSize(14);
    doc.text('Tasks', 20, yPosition);
    yPosition += 10;
    
    const taskHeaders = ['ID', 'Title', 'Status', 'Priority', 'Equipment', 'Due Date'];
    const taskRows = data.tasks.map(task => [
      task.id.toString(),
      task.title ? task.title.replace(/[^\x00-\x7F]/g, "?") : '',
      getStatusTextEn(task.status),
      getPriorityTextEn(task.priority),
      task.equipmentId || '',
      task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US') : ''
    ]);
    
    autoTable(doc, {
      head: [taskHeaders],
      body: taskRows,
      startY: yPosition,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }
  
  // Таблица замечаний
  if (data.remarks.length > 0) {
    doc.setFontSize(14);
    doc.text('Remarks', 20, yPosition);
    yPosition += 10;
    
    const remarkHeaders = ['ID', 'Title', 'Status', 'Equipment', 'Created'];
    const remarkRows = data.remarks.map(remark => [
      remark.id.toString(),
      remark.title ? remark.title.replace(/[^\x00-\x7F]/g, "?") : '',
      getStatusTextEn(remark.status),
      remark.equipmentName ? remark.equipmentName.replace(/[^\x00-\x7F]/g, "?") : '',
      new Date(remark.createdAt).toLocaleDateString('en-US')
    ]);
    
    autoTable(doc, {
      head: [remarkHeaders],
      body: remarkRows,
      startY: yPosition,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }
  
  // Таблица техобслуживания
  if (data.maintenance.length > 0 && yPosition < 250) {
    doc.setFontSize(14);
    doc.text('Maintenance', 20, yPosition);
    yPosition += 10;
    
    const maintenanceHeaders = ['ID', 'Equipment', 'Type', 'Status', 'Scheduled', 'Responsible'];
    const maintenanceRows = data.maintenance.map(maintenance => [
      maintenance.id.toString(),
      maintenance.equipmentName ? maintenance.equipmentName.replace(/[^\x00-\x7F]/g, "?") : '',
      maintenance.maintenanceType || '',
      getMaintenanceStatusTextEn(maintenance.status),
      new Date(maintenance.scheduledDate).toLocaleDateString('en-US'),
      maintenance.responsible ? maintenance.responsible.replace(/[^\x00-\x7F]/g, "?") : ''
    ]);
    
    autoTable(doc, {
      head: [maintenanceHeaders],
      body: maintenanceRows,
      startY: yPosition,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
  }
  
  // Сохранение файла
  const fileName = `Equipment_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const exportToExcel = (data: ExportData, title: string) => {
  const workbook = XLSX.utils.book_new();
  
  // Лист с задачами
  if (data.tasks.length > 0) {
    const taskData = data.tasks.map(task => ({
      'ID': task.id,
      'Название': task.title || '',
      'Описание': task.description || '',
      'Статус': getStatusText(task.status),
      'Приоритет': getPriorityText(task.priority),
      'Оборудование': task.equipmentId || '',
      'Тип ТО': task.maintenanceType || '',
      'Срок выполнения': task.dueDate ? new Date(task.dueDate).toLocaleDateString('ru-RU') : '',
      'Создал': task.createdBy || '',
      'Дата создания': new Date(task.createdAt).toLocaleDateString('ru-RU'),
      'Изменил': task.modifiedBy || '',
      'Дата изменения': task.modifiedAt ? new Date(task.modifiedAt).toLocaleDateString('ru-RU') : '',
      'Закрыл': task.closedBy || '',
      'Дата закрытия': task.closedAt ? new Date(task.closedAt).toLocaleDateString('ru-RU') : ''
    }));
    
    const taskSheet = XLSX.utils.json_to_sheet(taskData);
    XLSX.utils.book_append_sheet(workbook, taskSheet, 'Задачи');
  }
  
  // Лист с замечаниями
  if (data.remarks.length > 0) {
    const remarkData = data.remarks.map(remark => ({
      'ID': remark.id,
      'Название': remark.title || '',
      'Описание': remark.description || '',
      'Статус': getStatusText(remark.status),
      'Оборудование ID': remark.equipmentId || '',
      'Оборудование': remark.equipmentName || '',
      'Источник': remark.source || '',
      'Создал': remark.createdBy || '',
      'Дата создания': new Date(remark.createdAt).toLocaleDateString('ru-RU'),
      'Изменил': remark.modifiedBy || '',
      'Дата изменения': remark.modifiedAt ? new Date(remark.modifiedAt).toLocaleDateString('ru-RU') : '',
      'Закрыл': remark.closedBy || '',
      'Дата закрытия': remark.closedAt ? new Date(remark.closedAt).toLocaleDateString('ru-RU') : ''
    }));
    
    const remarkSheet = XLSX.utils.json_to_sheet(remarkData);
    XLSX.utils.book_append_sheet(workbook, remarkSheet, 'Замечания');
  }
  
  // Лист с техобслуживанием
  if (data.maintenance.length > 0) {
    const maintenanceData = data.maintenance.map(maintenance => ({
      'ID': maintenance.id,
      'Оборудование ID': maintenance.equipmentId || '',
      'Оборудование': maintenance.equipmentName || '',
      'Тип ТО': maintenance.maintenanceType || '',
      'Статус': getMaintenanceStatusText(maintenance.status),
      'Приоритет': maintenance.priority || '',
      'Плановая дата': new Date(maintenance.scheduledDate).toLocaleDateString('ru-RU'),
      'Дата выполнения': maintenance.completedDate ? new Date(maintenance.completedDate).toLocaleDateString('ru-RU') : '',
      'Ответственный': maintenance.responsible || '',
      'Заметки': maintenance.notes || '',
      'Длительность': maintenance.duration || '',
      'Дата создания': new Date(maintenance.createdAt).toLocaleDateString('ru-RU'),
      'Дата обновления': maintenance.updatedAt ? new Date(maintenance.updatedAt).toLocaleDateString('ru-RU') : ''
    }));
    
    const maintenanceSheet = XLSX.utils.json_to_sheet(maintenanceData);
    XLSX.utils.book_append_sheet(workbook, maintenanceSheet, 'Техобслуживание');
  }
  
  // Лист с оборудованием
  if (data.equipment.length > 0) {
    const equipmentData = data.equipment.map(equipment => ({
      'ID': equipment.id,
      'Название': equipment.name || '',
      'Тип': equipment.type || '',
      'Производитель': equipment.manufacturer || '',
      'Модель': equipment.model || '',
      'Серийный номер': equipment.serialNumber || '',
      'Расположение': equipment.location || '',
      'Статус': equipment.status || '',
      'Дата установки': equipment.installationDate ? new Date(equipment.installationDate).toLocaleDateString('ru-RU') : '',
      'Описание': equipment.description || ''
    }));
    
    const equipmentSheet = XLSX.utils.json_to_sheet(equipmentData);
    XLSX.utils.book_append_sheet(workbook, equipmentSheet, 'Оборудование');
  }
  
  // Сохранение файла
  const fileName = `Отчет_система_управления_оборудованием_${new Date().toISOString().split('T')[0]}.xlsx`;
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const file = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(file, fileName);
};

export const exportToCSV = (data: ExportData, title: string) => {
  let csvContent = `${title}\n`;
  csvContent += `Дата формирования: ${new Date().toLocaleDateString('ru-RU')}\n\n`;
  
  // Задачи
  if (data.tasks.length > 0) {
    csvContent += 'ЗАДАЧИ\n';
    csvContent += 'ID,Название,Статус,Приоритет,Оборудование,Срок выполнения,Создал,Дата создания\n';
    
    data.tasks.forEach(task => {
      csvContent += `${task.id},"${task.title || ''}","${getStatusText(task.status)}","${getPriorityText(task.priority)}","${task.equipmentId || ''}","${task.dueDate ? new Date(task.dueDate).toLocaleDateString('ru-RU') : ''}","${task.createdBy || ''}","${new Date(task.createdAt).toLocaleDateString('ru-RU')}"\n`;
    });
    csvContent += '\n';
  }
  
  // Замечания
  if (data.remarks.length > 0) {
    csvContent += 'ЗАМЕЧАНИЯ\n';
    csvContent += 'ID,Название,Статус,Оборудование,Источник,Создал,Дата создания\n';
    
    data.remarks.forEach(remark => {
      csvContent += `${remark.id},"${remark.title || ''}","${getStatusText(remark.status)}","${remark.equipmentName || ''}","${remark.source || ''}","${remark.createdBy || ''}","${new Date(remark.createdAt).toLocaleDateString('ru-RU')}"\n`;
    });
    csvContent += '\n';
  }
  
  // Техобслуживание
  if (data.maintenance.length > 0) {
    csvContent += 'ТЕХНИЧЕСКОЕ ОБСЛУЖИВАНИЕ\n';
    csvContent += 'ID,Оборудование,Тип ТО,Статус,Плановая дата,Ответственный\n';
    
    data.maintenance.forEach(maintenance => {
      csvContent += `${maintenance.id},"${maintenance.equipmentName || ''}","${maintenance.maintenanceType || ''}","${getMaintenanceStatusText(maintenance.status)}","${new Date(maintenance.scheduledDate).toLocaleDateString('ru-RU')}","${maintenance.responsible || ''}"\n`;
    });
  }
  
  // Сохранение файла с BOM для корректного отображения кириллицы
  const fileName = `Отчет_система_управления_оборудованием_${new Date().toISOString().split('T')[0]}.csv`;
  const BOM = '\uFEFF';
  const file = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(file, fileName);
};

// Вспомогательные функции для перевода статусов
function getStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    'pending': 'Ожидает',
    'in-progress': 'В работе',
    'completed': 'Завершено',
    'open': 'Открыто',
    'resolved': 'Решено'
  };
  return statusMap[status] || status;
}

function getStatusTextEn(status: string): string {
  const statusMap: { [key: string]: string } = {
    'pending': 'Pending',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'open': 'Open',
    'resolved': 'Resolved'
  };
  return statusMap[status] || status;
}

function getPriorityText(priority: string): string {
  const priorityMap: { [key: string]: string } = {
    'low': 'Низкий',
    'medium': 'Средний',
    'high': 'Высокий',
    'critical': 'Критический'
  };
  return priorityMap[priority] || priority;
}

function getPriorityTextEn(priority: string): string {
  const priorityMap: { [key: string]: string } = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'critical': 'Critical'
  };
  return priorityMap[priority] || priority;
}

function getMaintenanceStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    'scheduled': 'Запланировано',
    'in-progress': 'В работе',
    'completed': 'Завершено',
    'overdue': 'Просрочено',
    'cancelled': 'Отменено'
  };
  return statusMap[status] || status;
}

function getMaintenanceStatusTextEn(status: string): string {
  const statusMap: { [key: string]: string } = {
    'scheduled': 'Scheduled',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'overdue': 'Overdue',
    'cancelled': 'Cancelled'
  };
  return statusMap[status] || status;
}
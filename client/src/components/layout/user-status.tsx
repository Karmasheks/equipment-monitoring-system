import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User, Clock, Coffee, Plane, UserX, Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface UserStatus {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const userStatuses: UserStatus[] = [
  {
    id: "online",
    name: "Онлайн",
    icon: <Wifi className="w-3 h-3" />,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/20"
  },
  {
    id: "working",
    name: "На работе",
    icon: <User className="w-3 h-3" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/20"
  },
  {
    id: "break",
    name: "На перерыве",
    icon: <Coffee className="w-3 h-3" />,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20"
  },
  {
    id: "vacation",
    name: "В отпуске",
    icon: <Plane className="w-3 h-3" />,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/20"
  },
  {
    id: "absent",
    name: "Отсутствует",
    icon: <UserX className="w-3 h-3" />,
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/20"
  },
  {
    id: "busy",
    name: "Занят",
    icon: <Clock className="w-3 h-3" />,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/20"
  }
];

interface UserStatusSelectorProps {
  currentStatus: string;
  onStatusChange: (statusId: string) => void;
  userName: string;
}

export function UserStatusSelector({ currentStatus, onStatusChange, userName }: UserStatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = (statusId: string) => {
    onStatusChange(statusId);
    setIsOpen(false);
    
    const status = userStatuses.find(s => s.id === statusId);
    toast({
      title: "Статус обновлен",
      description: `Ваш статус изменен на "${status?.name}"`,
    });
  };

  const currentStatusObj = userStatuses.find(s => s.id === currentStatus) || userStatuses[0];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start p-2 h-auto hover:bg-gray-700/50">
          <div className="flex items-center space-x-2 w-full">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStatusObj.bgColor}`}>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-white group-hover:text-gray-900 hover:text-gray-900">{userName}</div>
              <div className="flex items-center space-x-1">
                <span className={currentStatusObj.color}>{currentStatusObj.icon}</span>
                <span className="text-xs text-white group-hover:text-gray-700 hover:text-gray-700">{currentStatusObj.name}</span>
              </div>
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Изменить статус</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            {userStatuses.map((status) => (
              <Button
                key={status.id}
                variant={currentStatus === status.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleStatusChange(status.id)}
              >
                <div className="flex items-center space-x-3">
                  <span className={status.color}>{status.icon}</span>
                  <span>{status.name}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function getStatusBadge(statusId: string, darkMode: boolean = false) {
  const status = userStatuses.find(s => s.id === statusId) || userStatuses[0];
  
  if (darkMode) {
    // Цвета для темного фона боковой панели
    const darkColors = {
      'online': 'bg-green-500/20 text-green-300',
      'working': 'bg-blue-500/20 text-blue-300',
      'break': 'bg-yellow-500/20 text-yellow-300',
      'vacation': 'bg-purple-500/20 text-purple-300',
      'absent': 'bg-red-500/20 text-red-300',
      'busy': 'bg-orange-500/20 text-orange-300'
    };
    
    const colorClass = darkColors[status.id as keyof typeof darkColors] || darkColors.online;
    
    return (
      <Badge className={`${colorClass} border-0 text-xs`}>
        {status.icon}
        <span className="ml-1">{status.name}</span>
      </Badge>
    );
  }
  
  return (
    <Badge className={`${status.bgColor} ${status.color} border-0`}>
      {status.icon}
      <span className="ml-1">{status.name}</span>
    </Badge>
  );
}

export { userStatuses };
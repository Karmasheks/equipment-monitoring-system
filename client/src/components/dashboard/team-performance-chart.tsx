import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function TeamPerformanceChart() {
  const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн"];
  const heights = [40, 65, 50, 75, 60, 80];
  const colors = [
    "bg-primary-100 dark:bg-primary-900/30",
    "bg-primary-200 dark:bg-primary-800/40",
    "bg-primary-300 dark:bg-primary-700/50",
    "bg-primary-400 dark:bg-primary-600/60",
    "bg-primary-500 dark:bg-primary-500/70",
    "bg-primary-600 dark:bg-primary-400/80",
  ];

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="p-5 border-b border-gray-200 flex justify-between items-center dark:border-gray-700">
        <CardTitle className="font-semibold text-gray-800 dark:text-white">Динамика эффективности команды</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          >
            Неделя
          </Button>
          <Button 
            size="sm" 
            className="px-3 py-1 text-xs font-medium rounded-md bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
          >
            Месяц
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          >
            Квартал
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex items-end h-64 space-x-6 px-2">
          {months.map((month, index) => (
            <div key={month} className="flex flex-col items-center space-y-2 flex-1">
              <div 
                className={`w-full ${colors[index]} rounded-t animate-in fade-in-50 duration-500`} 
                style={{ height: `${heights[index]}%` }}
              ></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{month}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          <div>Среднее: 75%</div>
          <div>Цель: 90%</div>
        </div>
      </CardContent>
    </Card>
  );
}

import * as React from "react";

interface ProgressCardProps {
  title: string;
  value: number | string;
  change: number;
  positive?: boolean;
  icon: React.ReactNode;
  progress: number;
  target?: number;
  className?: string;
}

export function ProgressCard({
  title,
  value,
  change,
  positive = true,
  icon,
  progress,
  target,
  className,
}: ProgressCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-5 transition-all hover:shadow-md ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm text-gray-500 uppercase tracking-wider">{title}</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <p className={`ml-2 text-sm font-medium ${positive ? 'text-success-500' : 'text-error-500'}`}>
              <i className={`fas fa-arrow-${positive ? 'up' : 'down'} text-xs mr-0.5`}></i>
              <span>{change}%</span>
            </p>
          </div>
          <p className="mt-1 text-xs text-gray-500">vs last month</p>
        </div>
        <div className="bg-primary-100 rounded-full p-3 text-primary-600">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {target ? "Target" : "Progress"}
          </div>
          <div className="text-xs font-medium text-gray-700">{progress}%</div>
        </div>
        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-primary-600 h-1.5 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

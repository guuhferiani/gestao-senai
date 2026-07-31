import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 bg-red-50 dark:bg-red-950/40 rounded-md">
          <Icon className="h-5 w-5 text-[#D31900]" />
        </div>
      </div>
      
      <div className="mt-4 flex items-baseline gap-2">
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
        
        {trend && (
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      
      {(description || trend) && (
        <p className="mt-1 text-sm text-gray-500">
          {trend ? trend.label : description}
        </p>
      )}
    </div>
  );
}

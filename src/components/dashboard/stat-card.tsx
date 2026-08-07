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
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400">{title}</h3>
        <div className="p-2.5 bg-red-50 dark:bg-red-950/50 rounded-lg text-[#e30613]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      <div className="mt-4 flex items-baseline gap-2">
        <p className="text-3xl font-extrabold text-gray-900 dark:text-neutral-100">{value}</p>
        
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
            trend.isPositive 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' 
              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
          }`}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      
      {(description || trend) && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-neutral-400">
          {trend ? trend.label : description}
        </p>
      )}
    </div>
  );
}

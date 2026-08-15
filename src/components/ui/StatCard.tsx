import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "emerald" | "blue" | "amber" | "rose" | "indigo" | "purple";
  badge?: string;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "emerald",
  badge,
}) => {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  const iconBgMap = {
    emerald: "bg-emerald-600 text-white",
    blue: "bg-blue-600 text-white",
    amber: "bg-amber-500 text-white",
    rose: "bg-rose-600 text-white",
    indigo: "bg-indigo-600 text-white",
    purple: "bg-purple-600 text-white",
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center ${iconBgMap[color]} shadow-sm shrink-0`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-slate-500 truncate">{title}</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 truncate">{value}</h3>
          </div>
        </div>
        {badge && (
          <span className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-bold border shrink-0 ${colorMap[color]}`}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="text-[11px] sm:text-xs text-slate-400 mt-3 pt-3 border-t border-slate-50 truncate">{subtitle}</p>}
    </div>
  );
};

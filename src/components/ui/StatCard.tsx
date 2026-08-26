import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "emerald" | "blue" | "amber" | "rose" | "indigo" | "purple" | "slate";
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
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    blue: "bg-sky-50 text-sky-700 border-sky-200/80",
    amber: "bg-amber-50 text-amber-700 border-amber-200/80",
    rose: "bg-red-50 text-red-700 border-red-200/80",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    purple: "bg-purple-50 text-purple-700 border-purple-200/80",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const iconBgMap = {
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    blue: "bg-sky-50 text-sky-700 border border-sky-200/60",
    amber: "bg-amber-50 text-amber-700 border border-amber-200/60",
    rose: "bg-red-50 text-red-700 border border-red-200/60",
    indigo: "bg-indigo-50 text-indigo-700 border border-indigo-200/60",
    purple: "bg-purple-50 text-purple-700 border border-purple-200/60",
    slate: "bg-slate-100 text-slate-700 border border-slate-200",
  };

  return (
    <div className="card-surface p-4 sm:p-5 hover:border-slate-300 transition-all duration-150 relative overflow-hidden group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgMap[color]} shrink-0 transition-transform group-hover:scale-105`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">{title}</p>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5 tabular-nums truncate">
              {value}
            </h3>
          </div>
        </div>
        {badge && (
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${colorMap[color]}`}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-[11px] text-slate-500 mt-2.5 pt-2.5 border-t border-slate-100 font-medium truncate flex items-center gap-1.5">
          {subtitle}
        </p>
      )}
    </div>
  );
};

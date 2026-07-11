import React from 'react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

export interface StatCardDef {
  id: string;
  label: string;
  sublabel: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  navigateTo?: string;
  /** When true, renders the wide "interessados" layout with a CTA button */
  wide?: boolean;
  ctaLabel?: string;
  ctaAction?: string;
  /** Render a custom value string (e.g. "42 Interessados") */
  valueSuffix?: string;
}

interface StatCardProps extends StatCardDef {
  value: number | string;
  onNavigate: (tab: string) => void;
  onAction?: (key: string) => void;
}

export function StatCard({ label, sublabel, icon: Icon, iconBg, iconColor, navigateTo, wide, ctaLabel, ctaAction, valueSuffix, value, onNavigate, onAction }: StatCardProps) {
  const handleClick = () => {
    if (navigateTo) onNavigate(navigateTo);
    else if (ctaAction && onAction) onAction(ctaAction);
  };

  if (wide) {
    return (
      <div
        onClick={handleClick}
        className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md hover:border-[#001856]/20 transition-all col-span-full"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={iconColor} />
            </div>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-xl font-bold text-[#001856]">
                {value}{valueSuffix ? ` ${valueSuffix}` : ''}
              </p>
              <p className="text-xs text-gray-400">{sublabel}</p>
            </div>
          </div>
          {ctaLabel && (
            <div className="flex items-center gap-1.5 text-xs text-[#001856] font-semibold border border-[#001856]/20 rounded-lg px-3 py-1.5 hover:bg-[#001856]/5 transition-colors flex-shrink-0">
              {ctaLabel} <ArrowUpRight size={13} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex items-stretch gap-3 cursor-pointer hover:shadow-md hover:border-[#001856]/20 transition-all"
    >
      <div className={`aspect-square w-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 truncate">{label}</p>
        <p className="text-3xl font-bold text-[#001856]">{value}</p>
      </div>
    </div>
  );
}

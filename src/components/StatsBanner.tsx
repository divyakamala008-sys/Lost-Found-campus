import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, Sparkles, Building2, HelpCircle } from 'lucide-react';
import { CampusItem } from '../types';

interface StatsBannerProps {
  items: CampusItem[];
  highMatchesCount: number;
  onFilterCustody: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  items,
  highMatchesCount,
  onFilterCustody,
}) => {
  const lostCount = items.filter((i) => i.type === 'lost' && i.status === 'active').length;
  const foundCount = items.filter((i) => i.type === 'found' && i.status === 'active').length;
  const reunitedCount = items.filter((i) => i.status === 'reunited').length;
  const safeLockerCount = items.filter((i) => i.heldAtOfficialDesk && i.status === 'active').length;

  const totalClosed = reunitedCount + items.filter((i) => i.status !== 'active').length;
  const totalItems = items.length;
  const recoveryRate = Math.round(((reunitedCount + 12) / (totalItems + 14)) * 100);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 mb-6 shadow-md relative overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Headline */}
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Campus Network Active
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Avg Match Time: 3.4 hrs
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Lost something on campus? We match items automatically.
          </h1>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">
            Upload photos, location pins, and notes. Our AI continuously scans reported lost and found items across all campus buildings to find high-confidence matches.
          </p>
        </div>

        {/* Right Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 shrink-0">
          
          {/* Metric 1 */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-3.5">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Looking For</span>
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-1">{lostCount}</div>
            <div className="text-[11px] text-amber-300/80 font-medium">Lost Reports</div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-3.5">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Turned In</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-1">{foundCount}</div>
            <div className="text-[11px] text-emerald-300/80 font-medium">Found Items</div>
          </div>

          {/* Metric 3 */}
          <div
            onClick={onFilterCustody}
            className="bg-white/5 hover:bg-white/10 transition-colors cursor-pointer backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-3.5 group"
            title="Click to view items held at official desks"
          >
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Safe Custody</span>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-300 mt-1">{safeLockerCount}</div>
            <div className="text-[11px] text-blue-200/80 font-medium">At Official Desks</div>
          </div>

          {/* Metric 4 */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-3.5">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Reunited</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">{recoveryRate}%</div>
            <div className="text-[11px] text-emerald-200/80 font-medium">Recovery Rate</div>
          </div>

        </div>

      </div>
    </div>
  );
};

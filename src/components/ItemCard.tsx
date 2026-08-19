import React from 'react';
import {
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Tag,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { CampusItem, ItemMatchResult } from '../types';
import { CATEGORY_METADATA } from '../data/campusData';

interface ItemCardProps {
  item: CampusItem;
  matches?: ItemMatchResult[];
  onSelect: (item: CampusItem) => void;
  onOpenMatches: (item: CampusItem) => void;
  onClaim: (item: CampusItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  matches = [],
  onSelect,
  onOpenMatches,
  onClaim,
}) => {
  const categoryMeta = CATEGORY_METADATA[item.category] || CATEGORY_METADATA.other;
  const isLost = item.type === 'lost';
  const isReunited = item.status === 'reunited';

  // Highest match calculation
  const topMatch = matches.length > 0 ? matches[0] : null;
  const hasHighMatch = topMatch && topMatch.analysis.matchScore >= 65;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      id={`item-card-${item.id}`}
      className={`group relative bg-white dark:bg-slate-850 rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden hover:shadow-lg ${
        isReunited
          ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
          : hasHighMatch
          ? 'border-amber-300 dark:border-amber-700/80 ring-1 ring-amber-400/20 shadow-xs'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer" onClick={() => onSelect(item)}>
        <img
          src={item.imageUrl || categoryMeta.placeholderImg}
          alt={item.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = categoryMeta.placeholderImg;
          }}
        />

        {/* Gradient Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          {/* Lost vs Found Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${
              isLost
                ? 'bg-amber-500/90 text-white border border-amber-400/50'
                : 'bg-emerald-600/90 text-white border border-emerald-400/50'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isLost ? 'bg-amber-200 animate-pulse' : 'bg-emerald-200'
              }`}
            />
            {isLost ? 'Lost Item' : 'Found Item'}
          </span>

          {/* Status or Desk Badge */}
          {isReunited ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-white shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Reunited
            </span>
          ) : item.heldAtOfficialDesk ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-blue-600/90 text-white backdrop-blur-md shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              Official Desk
            </span>
          ) : null}
        </div>

        {/* Bottom Image Details (Category + Reward if any) */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-white pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md border border-white/20 font-medium text-[11px]">
            {categoryMeta.label}
          </span>

          {item.rewardAmount && item.rewardAmount > 0 && isLost && !isReunited && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-bold text-[11px] shadow-xs">
              ${item.rewardAmount} Reward
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Location & Time */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 gap-2">
            <div className="flex items-center gap-1 truncate" title={item.location.name}>
              <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                {item.location.name}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 text-[11px]">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{formatDate(item.dateOccurred)}</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(item)}
            className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
          >
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Distinctive marks / Tags chips */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            {item.brand && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {item.brand}
              </span>
            )}
            {item.colors.slice(0, 2).map((col, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800"
              >
                {col}
              </span>
            ))}
            {item.distinctiveMarks && item.distinctiveMarks.length > 0 && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 truncate max-w-[160px]">
                <Tag className="w-2.5 h-2.5 shrink-0 text-indigo-500" />
                {item.distinctiveMarks[0]}
              </span>
            )}
          </div>
        </div>

        {/* AI Match Callout or Reunited Banner */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {isReunited ? (
            <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 rounded-lg">
              <span>Item Returned to Owner</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          ) : topMatch && topMatch.analysis.matchScore >= 40 ? (
            <div
              onClick={() => onOpenMatches(item)}
              className={`text-xs cursor-pointer p-2 rounded-xl border transition-all flex items-center justify-between ${
                topMatch.analysis.matchScore >= 75
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles
                  className={`w-3.5 h-3.5 ${
                    topMatch.analysis.matchScore >= 75 ? 'text-amber-500' : 'text-indigo-500'
                  }`}
                />
                <div>
                  <span className="font-bold">
                    {topMatch.analysis.matchScore}% Match Suggestion
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {topMatch.candidateItem.title}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <button
                id={`view-item-btn-${item.id}`}
                onClick={() => onSelect(item)}
                className="flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors text-center"
              >
                View Details
              </button>
              <button
                id={`check-matches-btn-${item.id}`}
                onClick={() => onOpenMatches(item)}
                className="py-1.5 px-2.5 text-xs font-semibold rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors flex items-center gap-1"
                title="Search AI matches"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Matches</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  Tag,
  Sparkles,
  CheckCircle2,
  Share2,
  Mail,
  Phone,
  HelpCircle,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Building2,
  Lock
} from 'lucide-react';
import { CampusItem, ItemMatchResult } from '../types';
import { CATEGORY_METADATA } from '../data/campusData';
import { findMatchesForItem } from '../utils/matchingEngine';

interface ItemDetailsModalProps {
  item: CampusItem | null;
  allItems: CampusItem[];
  onClose: () => void;
  onOpenMatches: (item: CampusItem) => void;
  onClaim: (item: CampusItem) => void;
  onMarkReunited: (itemId: string) => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  allItems,
  onClose,
  onOpenMatches,
  onClaim,
  onMarkReunited,
}) => {
  const [matches, setMatches] = useState<ItemMatchResult[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!item) return;
    findMatchesForItem(item, allItems, false).then((res) => {
      setMatches(res.slice(0, 3));
    });
  }, [item, allItems]);

  if (!item) return null;

  const categoryMeta = CATEGORY_METADATA[item.category] || CATEGORY_METADATA.other;
  const isLost = item.type === 'lost';
  const isReunited = item.status === 'reunited';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                isLost
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {isLost ? 'LOST REPORT' : 'FOUND REPORT'}
            </span>
            {isReunited && (
              <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Reunited
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="share-item-btn"
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 font-medium"
              title="Share item link"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
            <button
              id="details-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Main Image Banner */}
          <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <img
              src={item.imageUrl || categoryMeta.placeholderImg}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {item.rewardAmount && item.rewardAmount > 0 && isLost && (
              <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 px-3 py-1 rounded-xl font-extrabold text-xs shadow-md">
                ${item.rewardAmount} Reward
              </div>
            )}
          </div>

          {/* Title & Metadata */}
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {categoryMeta.label}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Reported {new Date(item.dateReported).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {item.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Campus Location</span>
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                {item.location.name}
              </span>
              {item.specificLocationDetails && (
                <span className="text-[10px] text-slate-500 block truncate">
                  {item.specificLocationDetails}
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Brand / Model</span>
              <span className="font-semibold text-slate-900 dark:text-white block mt-0.5">
                {item.brand || 'Unspecified'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Colors</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {item.colors.map((c, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Distinctive Marks & Verification Question */}
          {(item.distinctiveMarks?.length || item.verificationQuestion) && (
            <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/60 dark:border-indigo-800/50 space-y-2 text-xs">
              {item.distinctiveMarks && item.distinctiveMarks.length > 0 && (
                <div>
                  <span className="font-bold text-indigo-950 dark:text-indigo-200 block mb-1">
                    Distinctive Visual Identifiers:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.distinctiveMarks.map((mark, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 font-medium"
                      >
                        {mark}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.verificationQuestion && (
                <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900">
                  <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" />
                    Security Question for Claimants:
                  </span>
                  <p className="text-indigo-900/80 dark:text-indigo-300 mt-0.5">
                    "{item.verificationQuestion.question}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Custody / Contact Info */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              {item.heldAtOfficialDesk ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  Official Campus Custody Location
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 text-indigo-500" />
                  Contact Information
                </>
              )}
            </div>

            {item.heldAtOfficialDesk ? (
              <p className="text-slate-600 dark:text-slate-300">
                This item is safely stored at{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {item.officialDeskLocation || item.location.deskName || item.location.name}
                </span>
                . Bring campus photo ID to collect.
              </p>
            ) : (
              <div className="space-y-1 text-slate-600 dark:text-slate-300">
                <p>
                  Reported by: <span className="font-semibold">{item.contactName}</span>
                </p>
                <p>
                  Email: <span className="font-mono">{item.contactEmail}</span>
                </p>
                {item.contactPhone && <p>Phone: {item.contactPhone}</p>}
              </div>
            )}
          </div>

          {/* AI Match Suggestions for this Item */}
          {matches.length > 0 && !isReunited && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Suggested AI Matches ({matches.length})
                </h4>
                <button
                  id="open-full-match-studio-btn"
                  onClick={() => {
                    onClose();
                    onOpenMatches(item);
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Open Match Studio
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {matches.map((m) => (
                  <div
                    key={m.candidateItem.id}
                    onClick={() => {
                      onClose();
                      onOpenMatches(item);
                    }}
                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={m.candidateItem.imageUrl}
                        alt={m.candidateItem.title}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold">
                            {m.analysis.matchScore}% Match
                          </span>
                          <span className="text-[11px] text-slate-400 truncate">
                            {m.candidateItem.location.name}
                          </span>
                        </div>
                        <h5 className="text-xs font-semibold text-slate-900 dark:text-white truncate mt-0.5 group-hover:text-indigo-600">
                          {m.candidateItem.title}
                        </h5>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3 shrink-0">
          {!isReunited ? (
            <button
              id="mark-reunited-btn"
              onClick={() => {
                onMarkReunited(item.id);
                onClose();
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors flex items-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as Reunited</span>
            </button>
          ) : (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Belonging Reunited
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              id="details-check-matches-btn"
              onClick={() => {
                onClose();
                onOpenMatches(item);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              AI Match Studio
            </button>

            {!isReunited && (
              <button
                id="details-claim-btn"
                onClick={() => {
                  onClose();
                  onClaim(item);
                }}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                Claim / Verify
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

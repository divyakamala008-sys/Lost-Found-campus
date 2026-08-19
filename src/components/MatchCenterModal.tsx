import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  ArrowRightLeft,
  MessageSquare,
  Award,
  Layers,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { CampusItem, ItemMatchResult } from '../types';
import { CATEGORY_METADATA } from '../data/campusData';
import { findMatchesForItem } from '../utils/matchingEngine';

interface MatchCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: CampusItem | null;
  allItems: CampusItem[];
  onInitiateClaim: (target: CampusItem, candidate: CampusItem) => void;
  onSelectItem: (item: CampusItem) => void;
}

export const MatchCenterModal: React.FC<MatchCenterModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
  allItems,
  onInitiateClaim,
  onSelectItem,
}) => {
  const [activeItem, setActiveItem] = useState<CampusItem | null>(selectedItem);
  const [matches, setMatches] = useState<ItemMatchResult[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(0);

  useEffect(() => {
    if (selectedItem) {
      setActiveItem(selectedItem);
    } else {
      // Pick first active item with matches if none selected
      const firstActive = allItems.find((i) => i.status === 'active');
      if (firstActive) setActiveItem(firstActive);
    }
  }, [selectedItem, isOpen, allItems]);

  useEffect(() => {
    if (!activeItem || !isOpen) return;

    let isMounted = true;
    setIsLoadingMatches(true);

    findMatchesForItem(activeItem, allItems, true).then((results) => {
      if (isMounted) {
        setMatches(results);
        setSelectedCandidateIndex(0);
        setIsLoadingMatches(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeItem, allItems, isOpen]);

  if (!isOpen || !activeItem) return null;

  const currentMatch = matches[selectedCandidateIndex] || null;
  const isLost = activeItem.type === 'lost';
  const targetCategoryMeta = CATEGORY_METADATA[activeItem.category];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                AI Match & Verification Studio
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparing campus reports using multimodal vision, location proximity, and timeline sync.
              </p>
            </div>
          </div>

          <button
            id="match-center-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Item Switcher Strip */}
        <div className="px-5 py-2.5 bg-indigo-50/60 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/50 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap shrink-0">
            Compare Target Item:
          </span>
          {allItems
            .filter((i) => i.status === 'active')
            .map((item) => {
              const isSelected = item.id === activeItem.id;
              return (
                <button
                  key={item.id}
                  id={`match-target-select-${item.id}`}
                  onClick={() => setActiveItem(item)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.type === 'lost' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                  />
                  <span className="max-w-[130px] truncate">{item.title}</span>
                </button>
              );
            })}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          
          {isLoadingMatches ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Running Gemini AI Multimodal Comparison...
              </p>
              <p className="text-xs text-slate-400 max-w-sm">
                Evaluating physical traits, photo embeddings, campus zones, and timestamps.
              </p>
            </div>
          ) : matches.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
              <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-2" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">
                No Direct Matches Found Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                We haven't detected an opposite ({isLost ? 'found' : 'lost'}) report matching this item's description or building yet. Our AI will automatically alert you when a counterpart is turned in.
              </p>
            </div>
          ) : (
            <>
              {/* Candidates Selector Strip if multiple */}
              {matches.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
                    Candidate Matches ({matches.length}):
                  </span>
                  {matches.map((m, idx) => {
                    const isCandidateSelected = idx === selectedCandidateIndex;
                    return (
                      <button
                        key={m.candidateItem.id}
                        id={`candidate-pill-${idx}`}
                        onClick={() => setSelectedCandidateIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                          isCandidateSelected
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold text-white ${
                            m.analysis.matchScore >= 75
                              ? 'bg-amber-500'
                              : m.analysis.matchScore >= 50
                              ? 'bg-indigo-600'
                              : 'bg-slate-500'
                          }`}
                        >
                          {m.analysis.matchScore}%
                        </span>
                        <span className="max-w-[120px] truncate">
                          {m.candidateItem.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Side-by-Side Comparison Container */}
              {currentMatch && (
                <div className="space-y-6">
                  
                  {/* Top Match Score & AI Assessment Card */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      currentMatch.analysis.matchScore >= 75
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-indigo-500/10 border-indigo-500/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-3.5">
                        {/* Radial-like Score Circle */}
                        <div
                          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-extrabold shadow-md shrink-0 ${
                            currentMatch.analysis.matchScore >= 75
                              ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                              : 'bg-gradient-to-br from-indigo-600 to-blue-500'
                          }`}
                        >
                          <span className="text-xl leading-none">
                            {currentMatch.analysis.matchScore}%
                          </span>
                          <span className="text-[9px] uppercase tracking-wider font-semibold opacity-90">
                            Match
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold uppercase px-2 py-0.5 rounded-md ${
                                currentMatch.analysis.confidenceLevel === 'High'
                                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                                  : 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-300'
                              }`}
                            >
                              {currentMatch.analysis.confidenceLevel} Confidence Match
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Powered by Gemini 3.7
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 leading-snug">
                            {currentMatch.analysis.overallAssessment}
                          </p>
                        </div>
                      </div>

                      {/* Primary CTA */}
                      <button
                        id="initiate-claim-btn"
                        onClick={() => onInitiateClaim(activeItem, currentMatch.candidateItem)}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify & Claim Belonging</span>
                      </button>

                    </div>

                    {/* Breakdown Reasons */}
                    <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Key Matching Correlation Signals:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentMatch.analysis.reasons.map((reason, rIdx) => (
                          <div
                            key={rIdx}
                            className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Visual Side-by-Side Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                    
                    {/* Center Icon Connector for desktop */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 items-center justify-center shadow-lg">
                      <ArrowRightLeft className="w-4 h-4" />
                    </div>

                    {/* Left Card: Target Item */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-lg ${
                            isLost
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          Target Item ({isLost ? 'LOST' : 'FOUND'})
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Reported by {activeItem.contactName}
                        </span>
                      </div>

                      <div className="aspect-16/10 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
                        <img
                          src={activeItem.imageUrl || targetCategoryMeta.placeholderImg}
                          alt={activeItem.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                          {activeItem.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {activeItem.description}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="font-medium">{activeItem.location.name}</span>
                          <span className="text-slate-400">({activeItem.location.zone})</span>
                        </div>
                        {activeItem.specificLocationDetails && (
                          <div className="text-[11px] text-slate-500 pl-5">
                            Spot: {activeItem.specificLocationDetails}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            Occurred: {new Date(activeItem.dateOccurred).toLocaleString()}
                          </span>
                        </div>
                        {activeItem.distinctiveMarks && activeItem.distinctiveMarks.length > 0 && (
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium pl-5">
                            Marks: {activeItem.distinctiveMarks.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Card: Candidate Match */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-lg ${
                            currentMatch.candidateItem.type === 'lost'
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          Suggested Match ({currentMatch.candidateItem.type === 'lost' ? 'LOST' : 'FOUND'})
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {currentMatch.candidateItem.heldAtOfficialDesk ? 'Safe in Custody' : `Reported by ${currentMatch.candidateItem.contactName}`}
                        </span>
                      </div>

                      <div className="aspect-16/10 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
                        <img
                          src={currentMatch.candidateItem.imageUrl || CATEGORY_METADATA[currentMatch.candidateItem.category]?.placeholderImg}
                          alt={currentMatch.candidateItem.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                          {currentMatch.candidateItem.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {currentMatch.candidateItem.description}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="font-medium">{currentMatch.candidateItem.location.name}</span>
                          <span className="text-slate-400">({currentMatch.candidateItem.location.zone})</span>
                        </div>
                        {currentMatch.candidateItem.specificLocationDetails && (
                          <div className="text-[11px] text-slate-500 pl-5">
                            Spot: {currentMatch.candidateItem.specificLocationDetails}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            Occurred: {new Date(currentMatch.candidateItem.dateOccurred).toLocaleString()}
                          </span>
                        </div>
                        {currentMatch.candidateItem.distinctiveMarks && currentMatch.candidateItem.distinctiveMarks.length > 0 && (
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium pl-5">
                            Marks: {currentMatch.candidateItem.distinctiveMarks.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Verification Challenge Preview */}
                  {currentMatch.analysis.suggestedVerificationPrompt && (
                    <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800/60 flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-blue-950 dark:text-blue-200">
                          Recommended Ownership Verification Question:
                        </h5>
                        <p className="text-xs text-blue-800 dark:text-blue-300 mt-0.5">
                          "{currentMatch.analysis.suggestedVerificationPrompt}"
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3 shrink-0">
          <button
            id="match-center-dismiss-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors"
          >
            Close Studio
          </button>

          {currentMatch && (
            <button
              id="match-center-claim-action-btn"
              onClick={() => onInitiateClaim(activeItem, currentMatch.candidateItem)}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Proceed with Claim & Verification
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

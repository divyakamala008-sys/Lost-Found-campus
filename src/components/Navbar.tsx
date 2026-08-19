import React from 'react';
import {
  Compass,
  PlusCircle,
  Sparkles,
  Search,
  ShieldCheck,
  MapPin,
  SlidersHorizontal,
  Layers,
  BellRing
} from 'lucide-react';
import { ItemType } from '../types';

interface NavbarProps {
  activeTab: 'all' | 'lost' | 'found' | 'map' | 'matches';
  setActiveTab: (tab: 'all' | 'lost' | 'found' | 'map' | 'matches') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenReportModal: (defaultType?: ItemType) => void;
  onOpenMatchCenter: () => void;
  totalHighMatchesCount: number;
  totalActiveItems: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenReportModal,
  onOpenMatchCenter,
  totalHighMatchesCount,
  totalActiveItems,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3 sm:gap-6">
          
          {/* Logo & Campus Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                  Campus<span className="text-indigo-600 dark:text-indigo-400">Reunite</span>
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  AI Matching
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                University Smart Lost & Found Network
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="navbar-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lost & found (e.g. AirPods, Hydro Flask, Wallet)..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  id="navbar-clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Match Center Button */}
            <button
              id="navbar-match-center-btn"
              onClick={onOpenMatchCenter}
              className="relative inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all hover:border-slate-300"
              title="View Smart Match Suggestions"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Matches</span>
              {totalHighMatchesCount > 0 && (
                <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse shadow-xs">
                  {totalHighMatchesCount}
                </span>
              )}
            </button>

            {/* Report Lost Button */}
            <button
              id="navbar-report-lost-btn"
              onClick={() => onOpenReportModal('lost')}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>I Lost an Item</span>
            </button>

            {/* Report Found Button */}
            <button
              id="navbar-report-found-btn"
              onClick={() => onOpenReportModal('found')}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm shadow-indigo-600/30 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">I Found an Item</span>
              <span className="sm:hidden">Found</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="mobile-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, locations, keywords..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg border border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 border-t border-slate-100 dark:border-slate-800/60 text-xs sm:text-sm">
          <button
            id="tab-all-btn"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Items ({totalActiveItems})
          </button>

          <button
            id="tab-lost-btn"
            onClick={() => setActiveTab('lost')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'lost'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Lost Items (Seeking)
          </button>

          <button
            id="tab-found-btn"
            onClick={() => setActiveTab('found')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'found'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Found Items (Turned In)
          </button>

          <button
            id="tab-map-btn"
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'map'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Interactive Campus Map
          </button>

          <button
            id="tab-matches-btn"
            onClick={() => setActiveTab('matches')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'matches'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Potential Matches
            {totalHighMatchesCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                {totalHighMatchesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

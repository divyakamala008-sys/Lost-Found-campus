import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Sparkles,
  MapPin,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  ArrowUpDown,
  Compass,
  CheckCircle2,
  HelpCircle,
  Grid,
  List
} from 'lucide-react';
import { CampusItem, CampusLocation, ItemCategory, ItemMatchResult, ItemType } from './types';
import { INITIAL_ITEMS, CATEGORY_METADATA, CAMPUS_LOCATIONS } from './data/campusData';
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { ItemCard } from './components/ItemCard';
import { CampusMap } from './components/CampusMap';
import { ItemUploadModal } from './components/ItemUploadModal';
import { MatchCenterModal } from './components/MatchCenterModal';
import { ClaimModal } from './components/ClaimModal';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { calculateLocalMatch } from './utils/matchingEngine';

const STORAGE_KEY = 'campus_lost_found_items_v1';

export default function App() {
  // Persistence state
  const [items, setItems] = useState<CampusItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load items from localStorage', e);
    }
    return INITIAL_ITEMS;
  });

  // Save to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save items to localStorage', e);
    }
  }, [items]);

  // Filtering & Navigation State
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found' | 'map' | 'matches'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'matches' | 'reward'>('newest');
  const [filterOnlySafeCustody, setFilterOnlySafeCustody] = useState(false);

  // Modal States
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportModalDefaultType, setReportModalDefaultType] = useState<ItemType>('lost');
  const [isMatchCenterOpen, setIsMatchCenterOpen] = useState(false);
  const [selectedItemForMatches, setSelectedItemForMatches] = useState<CampusItem | null>(null);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<CampusItem | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimTargetItem, setClaimTargetItem] = useState<CampusItem | null>(null);
  const [claimCandidateItem, setClaimCandidateItem] = useState<CampusItem | null>(null);

  // Precompute matches for each item (for quick badge render)
  const itemsWithMatches = useMemo(() => {
    const map = new Map<string, ItemMatchResult[]>();

    items.forEach((target) => {
      if (target.status === 'reunited') return;

      const candidateMatches: ItemMatchResult[] = [];
      items.forEach((candidate) => {
        if (
          candidate.id !== target.id &&
          candidate.type !== target.type &&
          candidate.status !== 'reunited'
        ) {
          const analysis = calculateLocalMatch(target, candidate);
          if (analysis.matchScore >= 45) {
            candidateMatches.push({ candidateItem: candidate, analysis });
          }
        }
      });

      candidateMatches.sort((a, b) => b.analysis.matchScore - a.analysis.matchScore);
      map.set(target.id, candidateMatches);
    });

    return map;
  }, [items]);

  // Total high matches count across the entire campus
  const totalHighMatchesCount = useMemo(() => {
    let count = 0;
    itemsWithMatches.forEach((matchesList) => {
      if (matchesList.some((m) => m.analysis.matchScore >= 75)) {
        count++;
      }
    });
    return Math.floor(count / 2); // lost & found pair counts as 1 match pair
  }, [itemsWithMatches]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Tab filter
        if (activeTab === 'lost' && item.type !== 'lost') return false;
        if (activeTab === 'found' && item.type !== 'found') return false;
        if (activeTab === 'matches') {
          const itemMatches = itemsWithMatches.get(item.id) || [];
          if (itemMatches.length === 0 || item.status === 'reunited') return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

        // Location filter
        if (selectedLocationId && item.location.id !== selectedLocationId) return false;

        // Safe Custody Desk filter
        if (filterOnlySafeCustody && (!item.heldAtOfficialDesk || item.type !== 'found')) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchBrand = item.brand?.toLowerCase().includes(q) || false;
          const matchLoc = item.location.name.toLowerCase().includes(q) || item.location.zone.toLowerCase().includes(q);
          const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
          const matchColors = (item.colors || []).some((c) => c.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchBrand && !matchLoc && !matchTags && !matchColors) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.dateReported).getTime() - new Date(b.dateReported).getTime();
        }
        if (sortBy === 'reward') {
          return (b.rewardAmount || 0) - (a.rewardAmount || 0);
        }
        if (sortBy === 'matches') {
          const mScoreA = itemsWithMatches.get(a.id)?.[0]?.analysis.matchScore || 0;
          const mScoreB = itemsWithMatches.get(b.id)?.[0]?.analysis.matchScore || 0;
          return mScoreB - mScoreA;
        }
        return 0;
      });
  }, [
    items,
    activeTab,
    selectedCategory,
    selectedLocationId,
    filterOnlySafeCustody,
    searchQuery,
    sortBy,
    itemsWithMatches,
  ]);

  // Handlers
  const handleOpenReportModal = (defaultType: ItemType = 'lost') => {
    setReportModalDefaultType(defaultType);
    setIsReportModalOpen(true);
  };

  const handleOpenMatchCenterFor = (item?: CampusItem) => {
    if (item) {
      setSelectedItemForMatches(item);
    } else {
      const firstWithMatches = items.find(
        (i) => (itemsWithMatches.get(i.id)?.length || 0) > 0 && i.status === 'active'
      );
      setSelectedItemForMatches(firstWithMatches || items[0] || null);
    }
    setIsMatchCenterOpen(true);
  };

  const handleCreateItem = (newItem: CampusItem) => {
    setItems((prev) => [newItem, ...prev]);

    // Automatically check for instant match
    const potentialMatches = items.filter(
      (c) => c.type !== newItem.type && c.status !== 'reunited'
    );
    const top = potentialMatches
      .map((c) => ({ candidate: c, analysis: calculateLocalMatch(newItem, c) }))
      .sort((a, b) => b.analysis.matchScore - a.analysis.matchScore)[0];

    if (top && top.analysis.matchScore >= 70) {
      setTimeout(() => {
        handleOpenMatchCenterFor(newItem);
      }, 500);
    }
  };

  const handleInitiateClaim = (target: CampusItem, candidate: CampusItem) => {
    setClaimTargetItem(target);
    setClaimCandidateItem(candidate);
    setIsMatchCenterOpen(false);
    setIsClaimModalOpen(true);
  };

  const handleClaimSingle = (item: CampusItem) => {
    setClaimTargetItem(item);
    setClaimCandidateItem(null);
    setIsClaimModalOpen(true);
  };

  const handleConfirmReunited = (itemId1: string, itemId2?: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId1 || (itemId2 && item.id === itemId2)) {
          return {
            ...item,
            status: 'reunited',
            reunitedAt: new Date().toISOString(),
            matchedItemId: itemId2 ? (item.id === itemId1 ? itemId2 : itemId1) : undefined,
          };
        }
        return item;
      })
    );
  };

  const handleResetData = () => {
    if (window.confirm('Reset all items back to campus sample demonstration data?')) {
      setItems(INITIAL_ITEMS);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenReportModal={handleOpenReportModal}
        onOpenMatchCenter={() => handleOpenMatchCenterFor()}
        totalHighMatchesCount={totalHighMatchesCount}
        totalActiveItems={items.filter((i) => i.status === 'active').length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Dynamic Stats Banner */}
        <StatsBanner
          items={items}
          highMatchesCount={totalHighMatchesCount}
          onFilterCustody={() => {
            setFilterOnlySafeCustody(!filterOnlySafeCustody);
            setActiveTab('found');
          }}
        />

        {/* Interactive Campus Map View (Visible if Map tab is active or toggled) */}
        {activeTab === 'map' && (
          <CampusMap
            items={items}
            selectedLocationId={selectedLocationId}
            onSelectLocation={(locId) => setSelectedLocationId(locId)}
            onSelectItem={(item) => setSelectedItemForDetails(item)}
          />
        )}

        {/* Filter Controls & Categories Bar */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-xs space-y-3.5">
          
          {/* Category Chips Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              id="category-all-btn"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              All Categories
            </button>

            {Object.entries(CATEGORY_METADATA).map(([key, meta]) => {
              const isSelected = selectedCategory === key;
              const count = items.filter((i) => i.category === key && i.status === 'active').length;

              return (
                <button
                  key={key}
                  id={`category-${key}-btn`}
                  onClick={() => setSelectedCategory(key as ItemCategory)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span>{meta.label}</span>
                  {count > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Secondary Filter Bar: Sorts, Custody Filter, Clear Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Location Filter Dropdown */}
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <select
                  id="filter-location-select"
                  value={selectedLocationId || ''}
                  onChange={(e) => setSelectedLocationId(e.target.value || null)}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
                >
                  <option value="">All Campus Locations</option>
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.zone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Official Custody Only Toggle */}
              <button
                id="filter-custody-toggle-btn"
                onClick={() => setFilterOnlySafeCustody(!filterOnlySafeCustody)}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                  filterOnlySafeCustody
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>In Official Custody Only</span>
              </button>

              {/* Active Filters Clear Button */}
              {(selectedCategory !== 'all' ||
                selectedLocationId ||
                filterOnlySafeCustody ||
                searchQuery) && (
                <button
                  id="reset-filters-btn"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedLocationId(null);
                    setFilterOnlySafeCustody(false);
                    setSearchQuery('');
                  }}
                  className="px-2 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-white underline"
                >
                  Reset filters
                </button>
              )}
            </div>

            {/* Sort By Dropdown */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-slate-500 dark:text-slate-400">Sort by:</span>
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="newest">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="matches">Highest Match Potential</option>
                <option value="reward">Highest Reward</option>
              </select>
            </div>

          </div>

        </div>

        {/* Active Results Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {activeTab === 'matches'
                ? 'Items with Potential AI Matches'
                : activeTab === 'lost'
                ? 'Lost Items Looking for Return'
                : activeTab === 'found'
                ? 'Found Belongings Available for Claim'
                : 'Campus Property Directory'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
              {filteredItems.length}
            </span>
          </div>

          <button
            id="open-report-shortcut-btn"
            onClick={() => handleOpenReportModal('lost')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Belonging</span>
          </button>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center">
            <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No matching campus items found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4">
              Try adjusting your search keywords, location filters, or submit a new report to trigger the matching system.
            </p>
            <div className="flex items-center gap-3">
              <button
                id="empty-state-report-lost-btn"
                onClick={() => handleOpenReportModal('lost')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
              >
                Report Lost Item
              </button>
              <button
                id="empty-state-report-found-btn"
                onClick={() => handleOpenReportModal('found')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
              >
                Report Found Item
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                matches={itemsWithMatches.get(item.id) || []}
                onSelect={(item) => setSelectedItemForDetails(item)}
                onOpenMatches={(item) => handleOpenMatchCenterFor(item)}
                onClaim={(item) => handleClaimSingle(item)}
              />
            ))}
          </div>
        )}

        {/* Footer info & Reset demo button */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
          <p>
            University Campus Lost & Found System • Powered by Google Gemini AI Matching
          </p>
          <button
            id="reset-demo-data-btn"
            onClick={handleResetData}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Campus Data</span>
          </button>
        </div>

      </main>

      {/* Modals */}
      <ItemUploadModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitItem={handleCreateItem}
        defaultType={reportModalDefaultType}
        existingItems={items}
      />

      <MatchCenterModal
        isOpen={isMatchCenterOpen}
        onClose={() => setIsMatchCenterOpen(false)}
        selectedItem={selectedItemForMatches}
        allItems={items}
        onInitiateClaim={handleInitiateClaim}
        onSelectItem={(item) => setSelectedItemForDetails(item)}
      />

      <ClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => {
          setIsClaimModalOpen(false);
          setClaimTargetItem(null);
          setClaimCandidateItem(null);
        }}
        targetItem={claimTargetItem}
        candidateItem={claimCandidateItem}
        onConfirmReunited={handleConfirmReunited}
      />

      <ItemDetailsModal
        item={selectedItemForDetails}
        allItems={items}
        onClose={() => setSelectedItemForDetails(null)}
        onOpenMatches={(item) => handleOpenMatchCenterFor(item)}
        onClaim={(item) => handleClaimSingle(item)}
        onMarkReunited={(id) => handleConfirmReunited(id)}
      />

    </div>
  );
}

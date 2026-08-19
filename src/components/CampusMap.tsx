import React, { useState } from 'react';
import {
  MapPin,
  ShieldCheck,
  Building2,
  Sparkles,
  Info,
  Clock,
  Layers,
  ChevronRight,
  Filter
} from 'lucide-react';
import { CampusItem, CampusLocation } from '../types';
import { CAMPUS_LOCATIONS, CATEGORY_METADATA } from '../data/campusData';

interface CampusMapProps {
  items: CampusItem[];
  selectedLocationId: string | null;
  onSelectLocation: (locationId: string | null) => void;
  onSelectItem: (item: CampusItem) => void;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  items,
  selectedLocationId,
  onSelectLocation,
  onSelectItem,
}) => {
  const [hoveredLocation, setHoveredLocation] = useState<CampusLocation | null>(null);
  const [activeZoneFilter, setActiveZoneFilter] = useState<string | null>(null);

  // Group items by location
  const locationStats = CAMPUS_LOCATIONS.map((loc) => {
    const locItems = items.filter((i) => i.location.id === loc.id && i.status !== 'reunited');
    const lostCount = locItems.filter((i) => i.type === 'lost').length;
    const foundCount = locItems.filter((i) => i.type === 'found').length;
    return {
      location: loc,
      items: locItems,
      lostCount,
      foundCount,
      totalCount: locItems.length,
    };
  });

  const selectedStat = locationStats.find((s) => s.location.id === selectedLocationId);

  const zones = [
    'All Zones',
    'North Campus',
    'Central Quad',
    'South Campus',
    'East Academic',
    'West Sports Complex',
  ];

  return (
    <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm mb-6">
      
      {/* Header & Zone Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Interactive Campus Lost & Found Map
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              Live Hotspots
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click any campus building to inspect lost reports or found items currently turned in.
          </p>
        </div>

        {/* Zone Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {zones.map((zone) => {
            const isSelected =
              (zone === 'All Zones' && !activeZoneFilter) || activeZoneFilter === zone;
            return (
              <button
                key={zone}
                id={`map-zone-${zone.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setActiveZoneFilter(zone === 'All Zones' ? null : zone)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {zone}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Canvas Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SVG Interactive Map Area */}
        <div className="lg:col-span-8 relative aspect-16/10 sm:aspect-16/9 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 rounded-2xl border border-slate-200 dark:border-slate-750 overflow-hidden shadow-inner select-none">
          
          {/* Subtle Map Grid / Pathways Graphic */}
          <svg className="absolute inset-0 w-full h-full opacity-35 dark:opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="campus-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-slate-300 dark:text-slate-700" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#campus-grid)" />
            
            {/* Campus Pathways / Walkways */}
            <path
              d="M 180 650 Q 320 400 480 380 T 740 320"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray="4 8"
            />
            <path
              d="M 450 120 L 480 380 L 550 520 L 620 780"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d="M 480 380 L 260 440"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="12"
              strokeLinecap="round"
            />
          </svg>

          {/* Central Quad Lawn Graphical Indicator */}
          <div className="absolute top-[32%] left-[42%] w-[22%] h-[26%] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-3xl border border-dashed border-emerald-400/30 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800/40 dark:text-emerald-300/30">
              Central Quad Lawn
            </span>
          </div>

          {/* Campus Location Pins */}
          {locationStats.map(({ location, items: locItems, lostCount, foundCount, totalCount }) => {
            const isSelected = selectedLocationId === location.id;
            const isHovered = hoveredLocation?.id === location.id;
            const isDimmed = activeZoneFilter && location.zone !== activeZoneFilter;

            return (
              <div
                key={location.id}
                id={`map-pin-${location.id}`}
                style={{
                  left: `${location.mapCoords.x}%`,
                  top: `${location.mapCoords.y}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-all duration-200 ${
                  isDimmed ? 'opacity-30 scale-90' : 'opacity-100 hover:scale-110'
                }`}
                onClick={() => onSelectLocation(isSelected ? null : location.id)}
                onMouseEnter={() => setHoveredLocation(location)}
                onMouseLeave={() => setHoveredLocation(null)}
              >
                {/* Ping animation if has active items */}
                {totalCount > 0 && !isDimmed && (
                  <span className="absolute -inset-1 rounded-full bg-indigo-500/30 animate-ping" />
                )}

                {/* Building Marker Pill */}
                <div
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-xl shadow-md backdrop-blur-md transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white ring-2 ring-indigo-500 dark:bg-white dark:text-slate-900 scale-105'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  <Building2
                    className={`w-3.5 h-3.5 shrink-0 ${
                      location.hasOfficialDropoffDesk ? 'text-blue-500' : 'text-slate-500'
                    }`}
                  />
                  <span className="text-[11px] font-bold whitespace-nowrap max-w-[110px] truncate">
                    {location.name.replace('Campus ', '').replace('Center', '')}
                  </span>

                  {/* Badges count */}
                  {totalCount > 0 && (
                    <div className="flex items-center gap-0.5 ml-0.5">
                      {lostCount > 0 && (
                        <span
                          title={`${lostCount} lost reports`}
                          className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs"
                        >
                          {lostCount}
                        </span>
                      )}
                      {foundCount > 0 && (
                        <span
                          title={`${foundCount} found items`}
                          className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs"
                        >
                          {foundCount}
                        </span>
                      )}
                    </div>
                  )}

                  {location.hasOfficialDropoffDesk && (
                    <ShieldCheck className="w-3 h-3 text-blue-500 shrink-0" title="Official Dropoff Desk" />
                  )}
                </div>

                {/* Hover Popover Preview */}
                {isHovered && !isSelected && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2.5 bg-slate-900/95 text-white rounded-xl shadow-xl text-xs z-50 pointer-events-none backdrop-blur-md border border-slate-700 animate-fadeIn">
                    <p className="font-bold text-white text-xs">{location.name}</p>
                    <p className="text-[10px] text-slate-400">{location.building} • {location.zone}</p>
                    
                    <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-amber-400 font-semibold">{lostCount} Lost</span>
                      <span className="text-emerald-400 font-semibold">{foundCount} Found</span>
                    </div>

                    {location.hasOfficialDropoffDesk && (
                      <p className="mt-1 text-[10px] text-blue-300 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-blue-400" />
                        {location.deskName}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Map Legend */}
          <div className="absolute bottom-2 left-2 right-2 sm:right-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-[11px] flex flex-wrap items-center gap-3 shadow-xs">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-600 dark:text-slate-300">Lost Item Seeking Owner</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span className="text-slate-600 dark:text-slate-300">Found Item Turned In</span>
            </div>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-slate-600 dark:text-slate-300">Official Campus Drop-off Desk</span>
            </div>
          </div>
        </div>

        {/* Selected Building Details Sidebar */}
        <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col max-h-[480px]">
          {selectedStat ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {selectedStat.location.zone}
                    </span>
                    {selectedStat.location.hasOfficialDropoffDesk && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Safe Desk
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">
                    {selectedStat.location.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedStat.location.building}
                  </p>
                </div>
                <button
                  id="map-deselect-location-btn"
                  onClick={() => onSelectLocation(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              </div>

              {/* Desk hours if available */}
              {selectedStat.location.hasOfficialDropoffDesk && (
                <div className="mt-2.5 p-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs">
                  <div className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    {selectedStat.location.deskName}
                  </div>
                  <div className="text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-blue-500" />
                    {selectedStat.location.deskHours}
                  </div>
                </div>
              )}

              {/* Items List in this building */}
              <div className="mt-3 flex-1 overflow-y-auto pr-1 space-y-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Items Reported Here ({selectedStat.items.length})</span>
                </div>

                {selectedStat.items.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No active items reported in this location right now.
                  </div>
                ) : (
                  selectedStat.items.map((item) => {
                    const isLost = item.type === 'lost';
                    const catMeta = CATEGORY_METADATA[item.category];

                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectItem(item)}
                        className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-all cursor-pointer flex items-center gap-3 group"
                      >
                        <img
                          src={item.imageUrl || catMeta.placeholderImg}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = catMeta.placeholderImg;
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                                isLost
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {isLost ? 'LOST' : 'FOUND'}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate">
                              {catMeta.label}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate mt-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {item.title}
                          </h4>
                          {item.specificLocationDetails && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              {item.specificLocationDetails}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                Select a Campus Building
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px]">
                Click any building pin on the map to filter items and view official collection desks.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

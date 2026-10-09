'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { BoundingBox, Station, StationFilter } from '@/lib/types';
import { FilterBar } from '@/components/user/FilterBar';
import { SearchBox } from '@/components/user/SearchBox';
import { Loader2 } from 'lucide-react';

// Dynamically import heavy StationDrawer only when needed (reducing initial page JS bundle)
const StationDrawer = dynamic(
  () => import('@/components/user/StationDrawer').then((mod) => mod.StationDrawer),
  { ssr: false }
);

// Dynamically import EVMap (Leaflet) with a fast, instant map skeleton fallback
const EVMap = dynamic(
  () => import('@/components/map/EVMap').then((mod) => mod.EVMap),
  {
    ssr: false,
    loading: () => (
      <div className="relative flex h-full w-full items-center justify-center bg-slate-950 overflow-hidden">
        {/* Subtle Map Grid Lines Simulation */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)',
            backgroundSize: '36px 36px',
          }}
        />
        {/* Animated Radar Pulse */}
        <div className="relative flex flex-col items-center gap-3 z-10">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500/30" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600/90 text-white shadow-xl backdrop-blur-sm border border-brand-400/40">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          </div>
          <div className="flex flex-col items-center text-center px-4">
            <span className="text-sm font-bold text-white tracking-tight">Loading Kigali EV Map</span>
            <span className="text-xs text-slate-400">Connecting live stations and chargers...</span>
          </div>
        </div>
      </div>
    ),
  }
);

// Client-side in-memory cache for ultra-fast station filtering & panning
interface CacheEntry {
  data: Station[];
  timestamp: number;
}
const stationCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export default function DriverMapPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [filters, setFilters] = useState<StationFilter>({});
  const [currentBounds, setCurrentBounds] = useState<BoundingBox | null>(null);
  const [flyToLocation, setFlyToLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const abortControllerRef = useRef<AbortController | null>(null);
  const boundsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadedRef = useRef(false);

  // Fetch stations with instant client caching & AbortController support
  const fetchStations = useCallback(
    async (bounds?: BoundingBox | null, activeFilters?: StationFilter) => {
      const params = new URLSearchParams();

      if (bounds) {
        // Round bounding coordinates to 3 decimals (~100m) to maximize cache hits while panning
        params.set('minLng', bounds.minLng.toFixed(3));
        params.set('minLat', bounds.minLat.toFixed(3));
        params.set('maxLng', bounds.maxLng.toFixed(3));
        params.set('maxLat', bounds.maxLat.toFixed(3));
      }

      const f = activeFilters || filters;
      if (f.connectorTypes && f.connectorTypes.length > 0) {
        params.set('connectors', f.connectorTypes.join(','));
      }
      if (f.minPowerKw) {
        params.set('minPower', f.minPowerKw.toString());
      }
      if (f.status && f.status.length > 0) {
        params.set('status', f.status.join(','));
      }
      if (f.isFree) {
        params.set('isFree', 'true');
      }
      if (f.query) {
        params.set('q', f.query);
      }

      const cacheKey = params.toString();

      // Check instant memory cache
      const cached = stationCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        setStations(cached.data);
        setIsLoading(false);
        return;
      }

      // Abort any ongoing superseded request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        setIsLoading(true);
        const res = await fetch(`/api/stations?${cacheKey}`, {
          signal: controller.signal,
        });
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          stationCache.set(cacheKey, { data: json.data, timestamp: Date.now() });
          setStations(json.data);
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.warn('Error fetching stations:', err);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  // Initial load
  useEffect(() => {
    isInitialLoadedRef.current = true;
    fetchStations(currentBounds, filters);
  }, [filters]);

  // Handle URL query parameters (e.g. ?stationId=st-kigali-01&lat=-1.95&lng=30.09)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const stationId = urlParams.get('stationId');
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');

    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        setFlyToLocation({ lat: latNum, lng: lngNum });
      }
    }

    if (stationId) {
      // Find station by ID from API or current list
      fetch(`/api/stations/${stationId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setSelectedStation(json.data);
            setFlyToLocation({ lat: json.data.latitude, lng: json.data.longitude });
          }
        })
        .catch((err) => console.warn('Could not auto-select station from URL:', err));
    }
  }, []);

  // Listen for global custom events from AI Chatbot or navigation
  useEffect(() => {
    const handleSelectStationEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ station: Station }>;
      if (customEvent.detail?.station) {
        const s = customEvent.detail.station;
        setSelectedStation(s);
        setFlyToLocation({ lat: s.latitude, lng: s.longitude });
      }
    };

    const handleApplyFiltersEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ filters: StationFilter }>;
      if (customEvent.detail?.filters) {
        setFilters((prev) => ({ ...prev, ...customEvent.detail.filters }));
      }
    };

    window.addEventListener('ev:select-station', handleSelectStationEvent);
    window.addEventListener('ev:apply-filters', handleApplyFiltersEvent);

    return () => {
      window.removeEventListener('ev:select-station', handleSelectStationEvent);
      window.removeEventListener('ev:apply-filters', handleApplyFiltersEvent);
    };
  }, []);

  // Debounced bounds change handler to prevent network spam while dragging/zooming
  const handleBoundsChange = useCallback(
    (bounds: BoundingBox) => {
      setCurrentBounds(bounds);
      if (boundsTimerRef.current) {
        clearTimeout(boundsTimerRef.current);
      }
      boundsTimerRef.current = setTimeout(() => {
        fetchStations(bounds, filters);
      }, 200);
    },
    [fetchStations, filters]
  );

  const handleSelectLocation = (loc: { lat: number; lng: number; displayName: string }) => {
    // 1. Instantly fly map to the selected place
    setFlyToLocation({ lat: loc.lat, lng: loc.lng });

    // 2. Fetch stations in that area
    const bounds: BoundingBox = {
      minLng: loc.lng - 0.08,
      maxLng: loc.lng + 0.08,
      minLat: loc.lat - 0.08,
      maxLat: loc.lat + 0.08,
    };
    setCurrentBounds(bounds);
    fetchStations(bounds, filters);
  };

  const handleSelectStationFromSearch = (station: Station) => {
    setSelectedStation(station);
    setFlyToLocation({ lat: station.latitude, lng: station.longitude });
  };

  return (
    <div className="relative h-full w-full">
      {/* Top Floating Controls (Search Bar & Filter Bar) */}
      <div className="pointer-events-none absolute top-3 left-3 right-3 z-20 flex flex-col gap-2 sm:top-4 sm:left-6 sm:right-auto sm:max-w-2xl sm:gap-3">
        <div className="pointer-events-auto">
          <SearchBox
            stations={stations}
            onSelectStation={handleSelectStationFromSearch}
            onSelectLocation={handleSelectLocation}
          />
        </div>

        <div className="pointer-events-auto">
          <FilterBar
            filters={filters}
            onChangeFilters={setFilters}
            totalCount={stations.length}
          />
        </div>
      </div>

      {/* Loading Overlay Badge */}
      {isLoading && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 sm:bottom-auto sm:top-4 sm:right-6 sm:left-auto sm:translate-x-0 z-30 flex items-center gap-2 rounded-full bg-slate-900/90 text-white px-3.5 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-md border border-slate-700/80 animate-in fade-in">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-400" />
          <span>Searching Kigali area...</span>
        </div>
      )}

      {/* 100% Free Leaflet Map View */}
      <EVMap
        stations={stations}
        selectedStation={selectedStation}
        onSelectStation={setSelectedStation}
        onBoundsChange={handleBoundsChange}
        flyToLocation={flyToLocation}
      />

      {/* Station Details Drawer - loaded on demand */}
      {selectedStation && (
        <StationDrawer
          station={selectedStation}
          onClose={() => setSelectedStation(null)}
        />
      )}
    </div>
  );
}

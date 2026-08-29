'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { BoundingBox, Station, StationFilter } from '@/lib/types';
import { FilterBar } from '@/components/user/FilterBar';
import { SearchBox } from '@/components/user/SearchBox';
import { StationDrawer } from '@/components/user/StationDrawer';
import { Loader2 } from 'lucide-react';

// Dynamically import EVMap (Leaflet - 100% Free, Zero API Keys Required)
const EVMap = dynamic(
  () => import('@/components/map/EVMap').then((mod) => mod.EVMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          <span className="text-xs font-semibold text-slate-500">Loading Map...</span>
        </div>
      </div>
    ),
  }
);

export default function DriverMapPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [filters, setFilters] = useState<StationFilter>({});
  const [currentBounds, setCurrentBounds] = useState<BoundingBox | null>(null);
  const [flyToLocation, setFlyToLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch stations based on bounding box and filters
  const fetchStations = useCallback(
    async (bounds?: BoundingBox | null, activeFilters?: StationFilter) => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();

        if (bounds) {
          params.set('minLng', bounds.minLng.toString());
          params.set('minLat', bounds.minLat.toString());
          params.set('maxLng', bounds.maxLng.toString());
          params.set('maxLat', bounds.maxLat.toString());
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

        const res = await fetch(`/api/stations?${params.toString()}`);
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          setStations(json.data);
        }
      } catch (err) {
        console.warn('Error fetching stations:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  // Initial load
  useEffect(() => {
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

  const handleBoundsChange = (bounds: BoundingBox) => {
    setCurrentBounds(bounds);
    fetchStations(bounds, filters);
  };

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
      <div className="pointer-events-none absolute top-4 left-4 right-4 z-20 flex flex-col gap-3 sm:max-w-2xl sm:left-6">
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
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-md backdrop-blur-md border border-slate-200/80 animate-in fade-in">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-600" />
          <span>Searching area...</span>
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

      {/* Station Details Drawer */}
      <StationDrawer
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
      />
    </div>
  );
}

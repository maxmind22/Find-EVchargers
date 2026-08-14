'use client';

import { Search, X, Loader2, MapPin, Zap, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Station } from '@/lib/types';

interface SearchBoxProps {
  stations?: Station[];
  onSelectStation?: (station: Station) => void;
  onSelectLocation: (loc: { lat: number; lng: number; displayName: string }) => void;
  placeholder?: string;
}

interface GeocodeResult {
  display_name: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export function SearchBox({
  stations = [],
  onSelectStation,
  onSelectLocation,
  placeholder = 'Search Kigali station, street, or landmark...',
}: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [geoResults, setGeoResults] = useState<GeocodeResult[]>([]);
  const [stationResults, setStationResults] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter local stations instantly on keystroke
  useEffect(() => {
    if (!query.trim()) {
      setStationResults([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const matched = stations.filter((s) => {
      const nameMatch = s.name.toLowerCase().includes(q);
      const opMatch = s.operator_name.toLowerCase().includes(q);
      const addrMatch = s.address.toLowerCase().includes(q);
      const notesMatch = s.notes?.toLowerCase().includes(q);
      const connMatch = s.connectors?.some((c) =>
        c.connector_type.toLowerCase().includes(q.replace('/', '_'))
      );
      return nameMatch || opMatch || addrMatch || notesMatch || connMatch;
    });

    setStationResults(matched.slice(0, 5));
  }, [query, stations]);

  // Debounced geocoding search for street/landmark places
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setGeoResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setGeoResults(json.data);
          setIsOpen(true);
        }
      } catch (e) {
        console.warn('Search geocode error:', e);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle station click
  const handleSelectStation = (station: Station) => {
    if (onSelectStation) {
      onSelectStation(station);
    } else {
      onSelectLocation({
        lat: station.latitude,
        lng: station.longitude,
        displayName: station.name,
      });
    }
    setQuery(station.name);
    setIsOpen(false);
  };

  // Handle geographical location click
  const handleSelectGeo = (item: GeocodeResult) => {
    onSelectLocation({
      lat: item.latitude,
      lng: item.longitude,
      displayName: item.display_name,
    });
    setQuery(item.display_name.split(',')[0] || item.display_name);
    setIsOpen(false);
  };

  // Handle form submit (Enter key)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (stationResults.length > 0) {
      handleSelectStation(stationResults[0]);
      return;
    }

    if (geoResults.length > 0) {
      handleSelectGeo(geoResults[0]);
      return;
    }

    // Direct geocode fallback
    setIsLoading(true);
    fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          handleSelectGeo(json.data[0]);
        }
      })
      .finally(() => setIsLoading(false));
  };

  const handleClear = () => {
    setQuery('');
    setStationResults([]);
    setGeoResults([]);
    setIsOpen(false);
  };

  const hasResults = stationResults.length > 0 || geoResults.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="pointer-events-none absolute left-3.5 text-slate-400">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
          ) : (
            <Search className="h-4 w-4 text-slate-400" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-200/90 bg-white/95 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-900 shadow-md backdrop-blur-md transition-all placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150 divide-y divide-slate-100">
          {/* 1. EV Charging Station Matches */}
          {stationResults.length > 0 && (
            <div className="pb-1.5">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-700 flex items-center gap-1">
                <Zap className="h-3 w-3 fill-brand-600" />
                Charging Stations
              </div>
              <div className="space-y-0.5 mt-0.5">
                {stationResults.map((station) => {
                  const maxPower = station.connectors?.length
                    ? Math.max(...station.connectors.map((c) => c.power_kw))
                    : 0;

                  return (
                    <button
                      key={station.id}
                      type="button"
                      onClick={() => handleSelectStation(station)}
                      className="flex w-full items-center justify-between rounded-xl p-2 text-left text-xs transition-colors hover:bg-brand-50/70 focus:bg-brand-50 group"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="truncate font-bold text-slate-900 group-hover:text-brand-700">
                          {station.name}
                        </p>
                        <p className="truncate text-slate-500 text-[11px]">
                          {station.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {maxPower > 0 && (
                          <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                            {maxPower} kW
                          </span>
                        )}
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-brand-600" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Places & Addresses Matches */}
          {geoResults.length > 0 && (
            <div className="pt-1.5">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Places & Addresses
              </div>
              <div className="space-y-0.5 mt-0.5">
                {geoResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectGeo(item)}
                    className="flex w-full items-start gap-2.5 rounded-xl p-2 text-left text-xs transition-colors hover:bg-slate-50 focus:bg-slate-50"
                  >
                    <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-800">
                        {item.display_name.split(',')[0]}
                      </p>
                      <p className="truncate text-slate-400 text-[10px]">
                        {item.display_name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!hasResults && !isLoading && (
            <div className="p-4 text-center text-xs text-slate-400">
              No matching stations or locations found in Kigali for &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

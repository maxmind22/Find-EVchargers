'use client';

import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { Search, MapPin, Loader2, Crosshair, Key } from 'lucide-react';

interface GoogleMapPinPickerProps {
  latitude: number;
  longitude: number;
  onChangeLocation: (lat: number, lng: number, address?: string, city?: string, country?: string) => void;
}

export function GoogleMapPinPicker({
  latitude,
  longitude,
  onChangeLocation,
}: GoogleMapPinPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Initialize Google Maps for Admin Pin Picker
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    if (!apiKey) {
      setHasApiKey(false);
      return;
    }

    const initialLat = latitude || -1.9536; // Kigali
    const initialLng = longitude || 30.0924; // Kigali

    setOptions({
      key: apiKey,
      v: 'weekly',
    });

    importLibrary('maps')
      .then(async (mapsLib) => {
        const { Map } = mapsLib;

        const center = { lat: initialLat, lng: initialLng };
        const map = new Map(mapContainerRef.current!, {
          center,
          zoom: 14,
          disableDefaultUI: true,
          zoomControl: true,
        });

        const pinSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
            <g transform="translate(19,19) rotate(-45) translate(-19,-19)">
              <path d="M19,0 C10.7,0 4,6.7 4,15 C4,23.3 19,38 19,38 C19,38 34,23.3 34,15 C34,6.7 27.3,0 19,0 Z" fill="#0284c7" stroke="#ffffff" stroke-width="2"/>
              <text x="19" y="19" font-family="-apple-system, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="central" transform="rotate(45 19 19)">⚡</text>
            </g>
          </svg>
        `;

        const marker = new google.maps.Marker({
          position: center,
          map,
          draggable: true,
          title: 'Drag to position EV station',
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(pinSvg)}`,
            scaledSize: new google.maps.Size(38, 38),
            anchor: new google.maps.Point(19, 38),
          },
        });

        marker.addListener('dragend', () => {
          const pos = marker.getPosition();
          if (pos) {
            handleUpdateLocation(pos.lat(), pos.lng());
          }
        });

        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            marker.setPosition(e.latLng);
            handleUpdateLocation(e.latLng.lat(), e.latLng.lng());
          }
        });

        mapRef.current = map;
        markerRef.current = marker;
      })
      .catch((err) => {
        console.warn('Google Maps Pin Picker error:', err);
        setHasApiKey(false);
      });
  }, [apiKey]);

  // Update marker position if coordinates change externally
  useEffect(() => {
    if (markerRef.current && mapRef.current && latitude && longitude) {
      const current = markerRef.current.getPosition();
      if (!current || Math.abs(current.lat() - latitude) > 0.0001 || Math.abs(current.lng() - longitude) > 0.0001) {
        const newPos = { lat: latitude, lng: longitude };
        markerRef.current.setPosition(newPos);
        mapRef.current.panTo(newPos);
      }
    }
  }, [latitude, longitude]);

  // Reverse geocodes coordinates
  const handleUpdateLocation = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
      const json = await res.json();
      if (json.success && json.data) {
        onChangeLocation(lat, lng, json.data.address, json.data.city, json.data.country);
      } else {
        onChangeLocation(lat, lng);
      }
    } catch (e) {
      onChangeLocation(lat, lng);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Search Address inside Picker
  const handleSearch = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSearchResults(json.data);
        setShowDropdown(true);
      }
    } catch (e) {
      console.warn('Picker search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (item: any) => {
    const lat = item.latitude;
    const lng = item.longitude;
    const pos = { lat, lng };

    if (markerRef.current && mapRef.current) {
      markerRef.current.setPosition(pos);
      mapRef.current.panTo(pos);
      mapRef.current.setZoom(15);
    }

    onChangeLocation(lat, lng, item.display_name, item.city, item.country);
    setShowDropdown(false);
    setSearchQuery(item.display_name.split(',')[0]);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Top Address Search inside Picker (div container to prevent nested form) */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(e);
                }
              }}
              placeholder="Search Kigali address or landmark to drop pin..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-medium text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Find'}
          </button>
        </div>

        {/* Dropdown search results */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg text-xs">
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSearchResult(item)}
                className="flex w-full items-start gap-2 rounded-lg p-2 text-left hover:bg-slate-50 transition-colors"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-600" />
                <span className="truncate text-slate-700">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Pin Box */}
      <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-slate-200 shadow-inner">
        {!hasApiKey ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 p-4 text-center">
            <Key className="h-6 w-6 text-blue-600 mb-1.5" />
            <p className="text-xs font-bold text-slate-800">Google Maps Key Needed</p>
            <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
              Set <code className="text-brand-700">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in <code className="text-brand-700">.env.local</code> to activate the interactive Google Map pin dropper.
            </p>
          </div>
        ) : (
          <div ref={mapContainerRef} className="h-full w-full" />
        )}

        {/* Help Overlay Badge */}
        {hasApiKey && (
          <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-sm backdrop-blur-sm border border-slate-200/80">
            <Crosshair className="h-3 w-3 text-brand-600" />
            <span>Click map or drag pin to position</span>
            {isReverseGeocoding && <Loader2 className="h-3 w-3 animate-spin text-brand-600 ml-1" />}
          </div>
        )}
      </div>

      {/* Coordinate Displays */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block">
            Latitude
          </span>
          <span className="font-semibold text-slate-800">{latitude?.toFixed(6) || '-1.953600'}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block">
            Longitude
          </span>
          <span className="font-semibold text-slate-800">{longitude?.toFixed(6) || '30.092400'}</span>
        </div>
      </div>
    </div>
  );
}
